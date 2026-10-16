# CRM Playwright JavaScript Project

Playwright (JavaScript) automation suite for the Profolio CRM **Sales Companion** app.  
Port of the Selenium + Pytest (Python) project in the repo root.

| Python (existing) | Playwright JS (`playwright-js/`) |
| --- | --- |
| `PageObjects/LoginPage.py` | `page-objects/LoginPage.js` |
| `PageObjects/InternalUsers.py` | `page-objects/InternalUsers.js` |
| `TestCases/test_loginPage.py` | `tests/login.spec.js` |
| `TestCases/test_internalUsers.py` | `tests/internalUsers.spec.js` |
| `Configurations/config.ini` | `Configurations/config.js` + `.env` |
| `Utilities/customLogger.py` | `utils/logger.js` |
| Cloudflare Access CDP headers | `extraHTTPHeaders` in `playwright.config.js` |

## Get this project on your system

```bash
git clone https://github.com/rimshabashir679/CRM.git
cd CRM
git pull origin main
cd playwright-js
```

If the PR is not merged yet:

```bash
git fetch origin cursor/playwright-js-crm-7748
git checkout cursor/playwright-js-crm-7748
cd playwright-js
```

## Setup

```bash
npm install
npm run install:browsers
cp .env.example .env
# Edit .env — use a @dubizzlegroup.com Google Workspace account for SSO
```

## Bypass Google SSO → land on CRM login page

The CF Access tokens in `conftest.py` are **rejected** by Cloudflare
(`service_token_status=false`), so headers alone still open Google.

**Do this once on your Mac:**

```bash
cd playwright-js
npm run bypass:google
```

1. Chrome opens  
2. Complete Google sign-in  
3. Wait until the **CRM login form** appears (email + password)  
4. Do **not** sign into CRM — script auto-saves  

Then every test run skips Google and opens the CRM login page:

```bash
npm run test:headed
npm run test:login
```

## Run tests

```bash
npm run test:headed
npm run test:login
npm run test:internal-users
npm run test:smoke
npm run test:report
```

## Project structure

```
playwright-js/
├── Configurations/config.js
├── page-objects/
│   ├── LoginPage.js
│   └── InternalUsers.js
├── tests/
│   ├── smoke.spec.js
│   ├── login.spec.js
│   └── internalUsers.spec.js
├── utils/
├── scripts/save-auth.js
├── auth/                  # gitignored storage state
├── screenshots/
├── logs/
├── playwright.config.js
└── package.json
```

## Notes

- Staging login is **Google Workspace SSO** (`hd=dubizzlegroup.com`). Google often blocks headless/cloud browsers; use **headed** mode or `npm run auth:save` on your machine.
- Cloudflare Access service-token headers are sent on every request (same idea as the Selenium CDP setup).
- Prefer `.env` for secrets; do not commit passwords or CF tokens.
