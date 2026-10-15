# Saved auth (gitignored)

Run once on your machine:

```bash
npm run auth:save
```

Log in manually in the Chrome window. Press Enter in the terminal when the CRM app is open.

This creates:
- `user.json` — Playwright storage state
- `chrome-profile/` — persistent Chrome profile

Then:

```bash
npm run test:bypass
```
