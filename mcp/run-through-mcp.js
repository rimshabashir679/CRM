/**
 * Speak MCP to mcp/server.js and run one pytest target through the run_test tool.
 *
 * Usage: node run-through-mcp.js [pytest-target]
 */
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const target = process.argv[2] || "Sequential.py";

const inheritedEnv = {};
for (const [key, value] of Object.entries(process.env)) {
  if (typeof value === "string") inheritedEnv[key] = value;
}

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.join(here, "server.js")],
  cwd: path.resolve(here, ".."),
  stderr: "inherit",
  env: inheritedEnv,
});

const client = new Client({ name: "crm-tests-runner", version: "1.0.0" });
await client.connect(transport);

const listed = await client.listTools();
const names = (listed.tools ?? []).map((tool) => tool.name);
process.stdout.write(`tools: ${names.join(", ")}\n`);

if (!names.includes("run_test") || !names.includes("list_tests")) {
  process.stderr.write("MCP server did not advertise list_tests and run_test\n");
  await client.close();
  process.exit(1);
}

const listedTests = await client.callTool({ name: "list_tests", arguments: {} });
for (const block of listedTests.content ?? []) {
  if (block.type === "text") process.stdout.write(`${block.text}\n`);
}

const result = await client.callTool({
  name: "run_test",
  arguments: { target },
});
for (const block of result.content ?? []) {
  if (block.type === "text") process.stdout.write(`${block.text}\n`);
}

await client.close();
process.exit(result.isError ? 1 : 0);
