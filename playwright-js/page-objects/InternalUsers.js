/**
 * Internal Users page object — Playwright port of PageObjects/InternalUsers.py
 */
class InternalUsers {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.internalUserMenu = page
      .locator('nav a:has-text("Internal"), aside nav li:has-text("Internal Users"), text=Internal Users')
      .first();
    this.addNewInternalUserButton = page
      .locator('button:has-text("Add"), header button, header a:has-text("New"), text=Add New')
      .first();
    this.nameField = page
      .locator('input[name*="name" i], input[placeholder*="name" i]')
      .first();
    this.emailField = page
      .locator('form input[type="email"], form input[name*="email" i], form input[placeholder*="email" i]')
      .first();
    this.passwordField = page
      .locator('form input[type="password"]')
      .first();
    this.addGroupButton = page
      .locator('button:has-text("Group"), li:has-text("Add Group"), ul li')
      .first();

    // Absolute XPath fallbacks from the original Selenium page object
    this.internalUserMenuXPath = '/html/body/div[1]/aside/nav/ul/li[3]/ul/li[3]';
    this.addNewInternalUserXPath =
      '/html/body/div[1]/div[1]/main/div/section/header/div[2]/div';
    this.nameFieldXPath =
      '/html/body/div[1]/div[1]/main/div/section/div/div/form/div[1]/div[1]/div/div/div[1]/section/div/div/div/div[1]/div/div/div[2]/div/div/input';
    this.emailFieldXPath =
      '/html/body/div[1]/div[1]/main/div/section/div/div/form/div[1]/div[1]/div/div/div[1]/section/div/div/div/div[2]/div/div/div[2]/div/div/input';
    this.passwordFieldXPath =
      '/html/body/div[1]/div[1]/main/div/section/div/div/form/div[1]/div[1]/div/div/div[1]/section/div/div/div/div[3]/div/div/div[2]/div/div[1]/input';
    this.addGroupButtonXPath =
      '/html/body/div[1]/div[1]/main/div/section/div/div/form/div[1]/div[2]/section/div/div/div/div/div/div/div/div/ul/li';
  }

  async clickOnInternalUserMenuButton() {
    const el = (await this.internalUserMenu.count())
      ? this.internalUserMenu
      : this.page.locator(`xpath=${this.internalUserMenuXPath}`);
    await el.waitFor({ state: 'visible', timeout: 20_000 });
    await el.click();
  }

  async clickOnAddNewInternalUserMenuButton() {
    const el = (await this.addNewInternalUserButton.count())
      ? this.addNewInternalUserButton
      : this.page.locator(`xpath=${this.addNewInternalUserXPath}`);
    await el.waitFor({ state: 'visible', timeout: 15_000 });
    await el.click();
  }

  async addName(name) {
    const field = (await this.nameField.count())
      ? this.nameField
      : this.page.locator(`xpath=${this.nameFieldXPath}`);
    await field.waitFor({ state: 'visible', timeout: 15_000 });
    await field.fill(name);
  }

  async addEmail(email) {
    const field = (await this.emailField.count())
      ? this.emailField
      : this.page.locator(`xpath=${this.emailFieldXPath}`);
    await field.waitFor({ state: 'visible', timeout: 15_000 });
    await field.fill(email);
  }

  async addPassword(password) {
    const field = (await this.passwordField.count())
      ? this.passwordField
      : this.page.locator(`xpath=${this.passwordFieldXPath}`);
    await field.waitFor({ state: 'visible', timeout: 15_000 });
    await field.fill(password);
  }

  async clickOnAddGroupButton() {
    const el = (await this.addGroupButton.count())
      ? this.addGroupButton
      : this.page.locator(`xpath=${this.addGroupButtonXPath}`);
    await el.waitFor({ state: 'visible', timeout: 15_000 });
    await el.click();
  }
}

module.exports = { InternalUsers };
