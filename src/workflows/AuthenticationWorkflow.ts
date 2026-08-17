import { LoginPage } from '../pages/LoginPage.js';

export class AuthenticationWorkflow {
  constructor(private readonly loginPage: LoginPage) {}

  async loginAs(username: string, password: string): Promise<void> {
    await this.loginPage.goto();
    await this.loginPage.loginAs(username, password);
  }
}
