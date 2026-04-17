"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeNotCompleteException = exports.PaymentFailedException = exports.InvalidOrderException = exports.InsufficientStockException = void 0;
class InsufficientStockException extends Error {
    constructor(ingredientId, requiredQty, availableQty) {
        super(`Insufficient stock for ingredient ${ingredientId}. Required: ${requiredQty}, Available: ${availableQty}`);
        this.name = 'InsufficientStockException';
    }
}
exports.InsufficientStockException = InsufficientStockException;
class InvalidOrderException extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidOrderException';
    }
}
exports.InvalidOrderException = InvalidOrderException;
class PaymentFailedException extends Error {
    constructor(message) {
        super(message);
        this.name = 'PaymentFailedException';
    }
}
exports.PaymentFailedException = PaymentFailedException;
class RecipeNotCompleteException extends Error {
    constructor(menuItemId) {
        super(`Recipe for menu item ${menuItemId} is incomplete`);
        this.name = 'RecipeNotCompleteException';
    }
}
exports.RecipeNotCompleteException = RecipeNotCompleteException;
//# sourceMappingURL=custom.exceptions.js.map