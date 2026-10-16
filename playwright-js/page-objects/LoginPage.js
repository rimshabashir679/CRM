/**
 * Login page object — Playwright port of PageObjects/LoginPage.py
 *
 * With CF Access CDP headers (same as conftest.py), staging should show the
 * native CRM login form — not Google SSO.
 */
class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Prefer resilient locators; keep original absolute XPaths as fallback
    this.emailInput = page
      .locator(
        'input[type="email"], input[name*="email" i], input[placeholder*="email" i], input[id*="email" i]'
      )
      .first();
    this.passwordInput = page
      .locator(
        'input[type="password"]:not([aria-hidden="true"]):not([name="hiddenPassword"])'
      )
      .first();
    this.eyeIcon = page.locator(`xpath=${LoginPage.xpaths.eyeIcon}`);
    this.rememberMe = page.locator(`xpath=${LoginPage.xpaths.rememberMe}`);
    this.signInButton = page
      .locator(
        'button[type="submit"], button:has-text("Sign in"), button:has-text("Sign In"), button:has-text("Login")'
      )
      .or(page.locator(`xpath=${LoginPage.xpaths.signIn}`))
      .first();
    this.signOutButton = page
      .locator(
        'button:has-text("Sign out"), button:has-text("Sign Out"), button:has-text("Logout")'
      )
      .or(page.locator(`xpath=${LoginPage.xpaths.signOut}`))
      .first();
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

  async setEmail(email) {
    let field = this.emailInput;
    if (!(await field.count())) {
      field = this.page.locator(`xpath=${LoginPage.xpaths.email}`);
    }
    await field.waitFor({ state: 'visible', timeout: 20_000 });
    await field.fill(email);
  }

  async setPassword(password) {
    let field = this.passwordInput;
    if (!(await field.count())) {
      field = this.page.locator(`xpath=${LoginPage.xpaths.password}`);
    }
    await field.waitFor({ state: 'visible', timeout: 20_000 });
    await field.fill(password);
  }

  async clickOnEyeIcon() {
    if (await this.eyeIcon.count()) {
      await this.eyeIcon.click({ force: true }).catch(() => {});
    }
  }

  async clickOnRememberMe() {
    if (await this.rememberMe.count()) {
      await this.rememberMe.click({ force: true }).catch(() => {});
    }
  }

  async clickOnSignInButton() {
    await this.signInButton.waitFor({ state: 'visible', timeout: 15_000 });
    await this.signInButton.click();
  }

  async clickOnSignOutButton() {
    await this.signOutButton.waitFor({ state: 'visible', timeout: 30_000 });
    await this.signOutButton.click();
  }

  /** Full login flow — same steps as TestCases/test_loginPage.py */
  async login(email, password) {
    await this.setEmail(email);
    await this.setPassword(password);
    await this.clickOnEyeIcon();
    await this.clickOnRememberMe();
    await this.clickOnSignInButton();
  }
}

module.exports = { LoginPage };
