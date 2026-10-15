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

## Bypass Google SSO (recommended)

Google blocks automated password entry. Do this **once**:

```bash
# 1) Opens Chrome — log in manually to Google + CRM
npm run auth:save
# When the CRM app is open, press Enter in the terminal

# 2) Later runs reuse auth/user.json and skip Google
npm run test:bypass
npm run test:bypass:headed
```

If the session expires, run `npm run auth:save` again.

## Run tests

```bash
# Smoke only (no full Google login required)
npm run test:smoke

# With saved session (bypasses Google)
npm run test:bypass

# Without saved session (will hit Google SSO)
npm run test:headed
npm run test:login

# HTML report
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
