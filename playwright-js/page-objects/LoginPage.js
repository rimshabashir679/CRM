/**
 * Login page object — Playwright port of PageObjects/LoginPage.py
 *
 * Current staging uses Google Workspace SSO (hd=dubizzlegroup.com).
 * Native CRM form locators / XPaths from the Python suite are kept as fallbacks.
 */
class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Locators aligned with the original Python page object steps
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.locator(
      'input[name="Passwd"], input[type="password"]:not([aria-hidden="true"]):not([name="hiddenPassword"])'
    );
    this.nextButton = page.getByRole('button', { name: /^Next$/i });
    this.signInButtonGoogle = page.getByRole('button', {
      name: /^(Next|Sign in)$/i,
    });
    this.eyeIcon = page.locator(`xpath=${LoginPage.xpaths.eyeIcon}`);
    this.rememberMe = page.locator(`xpath=${LoginPage.xpaths.rememberMe}`);
    this.signInButtonNative = page.locator(
      `xpath=${LoginPage.xpaths.signIn}`
    );
    this.signOutButton = page
      .locator(
        'button:has-text("Sign out"), button:has-text("Sign Out"), button:has-text("Logout")'
      )
      .or(page.locator(`xpath=${LoginPage.xpaths.signOut}`));
  }

  static xpaths = {
    email:
      '/html/body/div[1]/div/main/div/section/form/div[1]/div[1]/div/div/div[2]/div/div/input',
    password:
      '/html/body/div[1]/div/main/div/section/form/div[1]/div[2]/div/div/div[2]/div/div[1]/input',
    eyeIcon:
      '/html/body/div[1]/div/main/div/section/form/div[1]/div[2]/div/div/div[2]/div/div[2]',
    rememberMe:
      '/html/body/div[1]/div/main/div/section/form/div[1]/div[3]/div/div/div/label/input',
    signIn:
      '/html/body/div[1]/div/main/div/section/form/div[2]/div/button',
    signOut:
      '/html/body/div[1]/div[1]/main/div/section/div/div/div/div[1]/section/div/div/div/form/button[2]',
  };

  async goto(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async isGoogleSso() {
    return /accounts\.google\.com/i.test(this.page.url());
  }

  async assertGoogleRejectedAutomation() {
    const url = this.page.url();
    if (/signin\/rejected|\/rejected/i.test(url)) return true;
    const insecure = this.page.getByText(/may not be secure|Couldn.?t sign you in/i);
    return (await insecure.count()) > 0;
  }

  async setEmail(email) {
    if (await this.isGoogleSso()) {
      await this.emailInput.waitFor({ state: 'visible', timeout: 20_000 });
      await this.emailInput.fill(email);
      return;
    }
    const field = this.page.locator(`xpath=${LoginPage.xpaths.email}`);
    await field.waitFor({ state: 'visible', timeout: 15_000 });
    await field.fill(email);
  }

  _googleBlockedError() {
    return new Error(
      'Google blocked this automated browser ("This browser or app may not be secure"). ' +
        'Run headed on your machine (`npm run test:headed`) or reuse a saved auth file via ' +
        '`npm run auth:save` then `STORAGE_STATE=auth/user.json npm test`.'
    );
  }

  async setPassword(password) {
    if (await this.isGoogleSso()) {
      await Promise.all([
        this.page
          .waitForURL(
            (url) =>
              /rejected|challenge|pwd|password/i.test(url.href) ||
              !/\/identifier/i.test(url.href),
            { timeout: 20_000 }
          )
          .catch(() => {}),
        this.nextButton.click(),
      ]);
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      await this.page.waitForTimeout(1000);

      if (await this.assertGoogleRejectedAutomation()) {
        throw this._googleBlockedError();
      }

      try {
        await this.passwordInput
          .first()
          .waitFor({ state: 'visible', timeout: 20_000 });
      } catch (err) {
        if (await this.assertGoogleRejectedAutomation()) {
          throw this._googleBlockedError();
        }
        // Still on identifier / unknown Google page → treat as automation block
        if (/accounts\.google\.com/i.test(this.page.url())) {
          throw this._googleBlockedError();
        }
        throw err;
      }
      await this.passwordInput.first().fill(password);
      return;
    }

    const field = this.page.locator(`xpath=${LoginPage.xpaths.password}`);
    await field.waitFor({ state: 'visible', timeout: 15_000 });
    await field.fill(password);
  }

  async clickOnEyeIcon() {
    if (await this.isGoogleSso()) return;
    if (await this.eyeIcon.count()) {
      await this.eyeIcon.click({ force: true }).catch(() => {});
    }
  }

  async clickOnRememberMe() {
    if (await this.isGoogleSso()) return;
    if (await this.rememberMe.count()) {
      await this.rememberMe.click({ force: true }).catch(() => {});
    }
  }

  async clickOnSignInButton() {
    if (await this.isGoogleSso()) {
      await this.signInButtonGoogle.first().click();
      await this.page
        .waitForURL(/neo\.staging\.profolio\.ae/i, { timeout: 60_000 })
        .catch(() => {});
      return;
    }
    await this.signInButtonNative.click();
  }

  async clickOnSignOutButton() {
    await this.signOutButton.first().waitFor({ state: 'visible', timeout: 30_000 });
    await this.signOutButton.first().click();
  }

  /** Full login flow (mirrors TestCases/test_loginPage.py). */
  async login(email, password) {
    await this.setEmail(email);
    await this.setPassword(password);
    await this.clickOnEyeIcon();
    await this.clickOnRememberMe();
    await this.clickOnSignInButton();
  }
}

module.exports = { LoginPage };
