export const CREDENTIALS = {
  STANDARD_USER: { username: 'standard_user', password: 'secret_sauce' },
  LOCKED_USER: { username: 'locked_out_user', password: 'secret_sauce' },
} as const;

export const ROUTES = {
  HOME: '/',
  INVENTORY: '/inventory.html',
  CART: '/cart.html',
  CHECKOUT_STEP_ONE: '/checkout-step-one.html',
  CHECKOUT_STEP_TWO: '/checkout-step-two.html',
  CHECKOUT_COMPLETE: '/checkout-complete.html',
} as const;

export const MESSAGES = {
  LOCKED_USER_ERROR: 'Epic sadface: Sorry, this user has been locked out.',
  ORDER_COMPLETE: 'Thank you for your order!',
} as const;

export const PRODUCTS = {
  BACKPACK: 'Sauce Labs Backpack',
} as const;
