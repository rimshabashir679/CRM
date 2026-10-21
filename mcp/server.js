/**
 * CRM test MCP server.
 *
 * Cursor launches this over stdio from `.cursor/mcp.json`.
 * Tools: list_tests, run_test.
 *
 * stdout is the JSON-RPC channel. Logs go to stderr only.
 */
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as z from "zod/v4";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const ALLOWED_FILES = [
  "Sequential.py",
  "TestCases/test_loginPage.py",
  "TestCases/test_internalUsers.py",
];

const TIMEOUT_MS = {
  "Sequential.py": 60_000,
  "TestCases/test_loginPage.py": 180_000,
  "TestCases/test_internalUsers.py": 180_000,
};

function pythonCommand() {
  const candidates = [
    path.join(ROOT, ".venv", "bin", "python"),
    path.join(ROOT, ".venv", "Scripts", "python.exe"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return process.platform === "win32" ? "python" : "python3";
}

function resolveTarget(target) {
  const normalized = String(target).trim().replace(/\\/g, "/").replace(/^\.\//, "");
  if (!normalized || normalized.includes("..") || path.isAbsolute(normalized)) {
    throw new Error("Target must be a repo-relative pytest path.");
  }
  const file = normalized.split("::")[0];
  if (!ALLOWED_FILES.includes(file)) {
    throw new Error(
      `Unsupported target "${normalized}". Allowed: ${ALLOWED_FILES.join(", ")}`
    );
  }
  return normalized;
}

function loadSecrets() {
  const secrets = new Set();
  const iniPath = path.join(ROOT, "Configurations", "config.ini");
  if (fs.existsSync(iniPath)) {
    const ini = fs.readFileSync(iniPath, "utf8");
    for (const line of ini.split(/\r?\n/)) {
      const match = line.match(/^\s*password\s*=\s*(.+?)\s*$/i);
      if (match && match[1].length >= 4) secrets.add(match[1]);
    }
  }
  const sources = [
    path.join(ROOT, "TestCases", "conftest.py"),
    path.join(ROOT, "TestCases", "test_internalUsers.py"),
  ];
  for (const sourcePath of sources) {
    if (!fs.existsSync(sourcePath)) continue;
    const source = fs.readFileSync(sourcePath, "utf8");
    for (const match of source.matchAll(
      /CF-Access-Client-(?:Id|Secret)"\s*:\s*"([^"]+)"/g
    )) {
      secrets.add(match[1]);
    }
    for (const match of source.matchAll(
      /google_password\s*=\s*["']([^"']+)["']/g
    )) {
      secrets.add(match[1]);
    }
    for (const match of source.matchAll(/addPassword\(\s*["']([^"']+)["']/g)) {
      secrets.add(match[1]);
    }
  }
  return [...secrets].sort((a, b) => b.length - a.length);
}

function scrub(text, secrets) {
  let out = text;
  for (const secret of secrets) {
    if (secret) out = out.split(secret).join("[redacted]");
  }
  return out;
}

function clip(text, limit = 12000) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}\n...[truncated ${text.length - limit} chars]`;
}

function runPytest(target, maxfail) {
  const file = target.split("::")[0];
  const timeoutMs = TIMEOUT_MS[file] ?? 120_000;
  const args = [
    "-m",
    "pytest",
    target,
    "-q",
    "--disable-warnings",
    `--maxfail=${maxfail}`,
    "--ignore=env",
    "-p",
    "no:cacheprovider",
  ];

  return new Promise((resolve) => {
    const child = spawn(pythonCommand(), args, {
      cwd: ROOT,
      env: { ...process.env, PYTHONPATH: ROOT },
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        code: 1,
        signal: null,
        timedOut: false,
        stdout,
        stderr: `${stderr}\n${error.message}`,
      });
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, signal, timedOut, stdout, stderr });
    });
  });
}

function createServer() {
  const server = new McpServer({ name: "crm-tests", version: "1.0.0" });

  server.registerTool(
    "list_tests",
    {
      title: "List CRM tests",
      description:
        "List pytest targets the CRM test server can run (login, internal users, and the sequential smoke file).",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [
        {
          type: "text",
          text: [
            "Sequential.py — import smoke; asserts only, does not open a browser",
            "TestCases/test_loginPage.py — sign in to Sales Companion and sign out",
            "TestCases/test_internalUsers.py — sign in and open Add Internal User",
            "",
            "Node ids are allowed, for example TestCases/test_loginPage.py::Test_01_LoginPage::test_login",
          ].join("\n"),
        },
      ],
    })
  );

  server.registerTool(
    "run_test",
    {
      title: "Run CRM pytest",
      description:
        "Run one allowlisted CRM pytest target from the repository root and return the pytest output.",
      inputSchema: z.object({
        target: z
          .string()
          .describe(
            "Repo-relative pytest path or node id. Example: Sequential.py or TestCases/test_loginPage.py"
          ),
        maxfail: z
          .number()
          .int()
          .min(1)
          .max(5)
          .optional()
          .describe("Stop after this many failures. Defaults to 1."),
      }),
    },
    async ({ target, maxfail }) => {
      let resolved;
      try {
        resolved = resolveTarget(target);
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: error.message }],
        };
      }

      const result = await runPytest(resolved, maxfail ?? 1);
      const secrets = loadSecrets();
      const stdout = clip(scrub(result.stdout, secrets));
      const stderr = clip(scrub(result.stderr, secrets));
      const status = result.timedOut
        ? "timed_out"
        : result.code === 0
          ? "passed"
          : "failed";
      const text = [
        `target: ${resolved}`,
        `status: ${status}`,
        `exit_code: ${result.code}`,
        result.signal ? `signal: ${result.signal}` : null,
        "--- stdout ---",
        stdout || "(empty)",
        "--- stderr ---",
        stderr || "(empty)",
      ]
        .filter(Boolean)
        .join("\n");

      return {
        isError: status !== "passed",
        content: [{ type: "text", text }],
      };
    }
  );

  return server;
}

void serveStdio(createServer);
console.error("crm-tests MCP server listening on stdio");
