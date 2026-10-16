# Bypass Google SSO

## If Google "Next" does nothing

Playwright Chrome often breaks Google login. Use your **real** Chrome:

```bash
npm run bypass:google:system
```

## Email tip (`hd=dubizzlegroup.com`)

The Google screen locks the domain to `@dubizzlegroup.com`.

- Type **only** your username, e.g. `rimsha.bashir`
- Do **not** type `@dubizzlelabs.com` or another domain
- Then click **Next**, enter password, continue

## Steps

1. `npm run bypass:google:system`
2. Finish Google in Chrome
3. Stop at the **CRM login form** (do not sign into CRM)
4. Press **Enter** in Terminal
5. `npm run test:headed`
