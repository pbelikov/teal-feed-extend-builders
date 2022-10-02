import {ProductInOrder} from "../interfaces";

interface Order {
    products: ProductInOrder[];
}

export class OrderImpl implements Order {
    private totalCost: number;

    constructor(
        public products: ProductInOrder[]
    ) {}

    private computeTotalCost(): void {
        this.totalCost = this.products.reduce((sum, { price, quantity }) => sum += price * quantity, 0)
    }
}

const order = new OrderImpl(
    [
        { quantity: 10, price: 2, name: 'Bumper' },
        { quantity: 1, price: 200, name: 'LED Light' },
        { quantity: 100, price: 0.5, name: 'Fog Light' }
    ]
);
