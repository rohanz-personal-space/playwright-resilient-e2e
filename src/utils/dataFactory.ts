import { faker } from '@faker-js/faker';

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export function generateCheckoutInfo(): CheckoutInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode(),
  };
}
