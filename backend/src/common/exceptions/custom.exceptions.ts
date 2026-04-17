export class InsufficientStockException extends Error {
  constructor(ingredientId: number, requiredQty: number, availableQty: number) {
    super(
      `Insufficient stock for ingredient ${ingredientId}. Required: ${requiredQty}, Available: ${availableQty}`,
    );
    this.name = 'InsufficientStockException';
  }
}

export class InvalidOrderException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidOrderException';
  }
}

export class PaymentFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentFailedException';
  }
}

export class RecipeNotCompleteException extends Error {
  constructor(menuItemId: number) {
    super(`Recipe for menu item ${menuItemId} is incomplete`);
    this.name = 'RecipeNotCompleteException';
  }
}
