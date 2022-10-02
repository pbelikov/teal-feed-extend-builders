export interface ProductInOrder {
    name: string;
    price: number;
    quantity: number;
}

export interface Coupon {
    code: string;
    discount: number;
    validTill: Date;
}

export interface Address {
    country: string;
    state?: string;
    city: string;
    street: string;
    house: string;
    apartment: string;
}
