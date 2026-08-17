export class AuthenticationWorkflow {
    loginPage;
    constructor(loginPage) {
        this.loginPage = loginPage;
    }
    async loginAs(username, password) {
        await this.loginPage.goto();
        await this.loginPage.loginAs(username, password);
    }
}
