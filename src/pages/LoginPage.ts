import { type Page } from '@playwright/test';
import { BasePage } from '../core/BasePage.js';
import { CREDENTIALS, ROUTES } from '../config/constants.js';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly usernameInput = () => this.page.getByPlaceholder('Username');
  private readonly passwordInput = () => this.page.getByPlaceholder('Password');
  private readonly loginButton = () => this.page.getByTestId('login-button');
  private readonly errorMessage = () => this.page.getByTestId('error');

  async goto() {
    await this.page.goto(ROUTES.HOME);
  }

  async loginAs(username: string, password: string) {
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    await this.loginButton().click();
  }

  async loginAsStandardUser() {
    await this.loginAs(
      CREDENTIALS.STANDARD_USER.username,
      CREDENTIALS.STANDARD_USER.password,
    );
    await this.page.waitForURL(ROUTES.INVENTORY);
  }

  async getErrorMessage() {
    return this.errorMessage().textContent();
  }
}
