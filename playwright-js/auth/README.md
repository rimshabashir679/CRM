# Bypass Google SSO

The CF Access tokens in `conftest.py` are **rejected** by Cloudflare, so headers alone still open Google.

## One-time fix (recommended)

```bash
npm run bypass:google
```

1. Chrome opens  
2. Complete **Google** sign-in  
3. Stop when you see the **CRM login form** (email + password)  
4. Do **not** sign into CRM — the script saves automatically  

Then run tests — they open the CRM login page (no Google):

```bash
npm run test:headed
npm run test:login
```

Saved files (gitignored): `user.json`, `chrome-profile/`
