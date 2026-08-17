import { BasePage } from '../core/BasePage.js';
import { ROUTES } from '../config/constants.js';
export class CheckoutPage extends BasePage {
    constructor(page) {
        super(page);
    }
    firstNameInput = () => this.page.getByTestId('firstName');
    lastNameInput = () => this.page.getByTestId('lastName');
    postalCodeInput = () => this.page.getByTestId('postalCode');
    continueButton = () => this.page.getByRole('button', { name: 'Continue' });
    finishButton = () => this.page.getByRole('button', { name: 'Finish' });
    confirmationHeader = () => this.page.getByTestId('complete-header');
    async fillShippingInfo(firstName, lastName, postalCode) {
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
