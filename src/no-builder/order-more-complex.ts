import {Address, Coupon, ProductInOrder} from "../interfaces";

interface Order {
    products: ProductInOrder[];
    coupons: Coupon[];
    username: string;
    deliveryAddress: Address;
}

export class OrderImpl implements Order {
    private totalCost: number;

    constructor(
        public products: ProductInOrder[],
        public coupons: Coupon[],
        public username: string,
        public deliveryAddress: Address
    ) {
        this.computeTotalCost();
    }

    private computeTotalCost(): void {
        const totalCost = this.products.reduce((sum, { price, quantity }) => sum += price * quantity, 0);

        this.totalCost = this.coupons.reduce((res, { discount }) => res *= (1 - discount), totalCost);
    }
}

const products: ProductInOrder[] = [
    { quantity: 10, price: 2, name: 'Bumper' },
    { quantity: 1, price: 200, name: 'LED Light' },
    { quantity: 100, price: 0.5, name: 'Fog Light' }
];

const coupons: Coupon[] = [
    { discount: 0.15, code: 'TEAL', validTill: new Date(Date.now() + Math.pow(100, 5)) }
];

const deliveryAddress: Address = {
    city: 'Yerevan',
    country: 'Armenia',
    street: 'Bagramian',
    house: 'some-house',
    apartment: 'some-apartment'
};

const orderForAnotherUser = new OrderImpl(
    products,
    coupons,
    'anotherUser',
    deliveryAddress
);

const orderForSuperuser = new OrderImpl(
    products,
    coupons,
    'superuser177',
    deliveryAddress
);
