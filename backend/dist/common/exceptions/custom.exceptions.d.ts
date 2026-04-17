export declare class InsufficientStockException extends Error {
    constructor(ingredientId: number, requiredQty: number, availableQty: number);
}
export declare class InvalidOrderException extends Error {
    constructor(message: string);
}
export declare class PaymentFailedException extends Error {
    constructor(message: string);
}
export declare class RecipeNotCompleteException extends Error {
    constructor(menuItemId: number);
}
