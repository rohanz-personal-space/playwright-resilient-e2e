import { type Page } from '@playwright/test';
import { ROUTES } from '../config/constants.js';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  private readonly firstNameInput = () => this.page.getByTestId('firstName');
  private readonly lastNameInput = () => this.page.getByTestId('lastName');
  private readonly postalCodeInput = () => this.page.getByTestId('postalCode');
  private readonly continueButton = () => this.page.getByRole('button', { name: 'Continue' });
  private readonly finishButton = () => this.page.getByRole('button', { name: 'Finish' });
  private readonly confirmationHeader = () => this.page.getByTestId('complete-header');

  async fillShippingInfo(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput().fill(firstName);
    await this.lastNameInput().fill(lastName);
    await this.postalCodeInput().fill(postalCode);
    await this.continueButton().click();
    await this.page.waitForURL(ROUTES.CHECKOUT_STEP_TWO);
  }

  async finish() {
    await this.finishButton().click();
    await this.page.waitForURL(ROUTES.CHECKOUT_COMPLETE);
  }

  async getConfirmationHeader() {
    return this.confirmationHeader().textContent();
  }
}
