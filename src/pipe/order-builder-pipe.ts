import {Address, Coupon, ProductInOrder} from "../interfaces";

interface Order {
    products: ProductInOrder[];
    coupons: Coupon[];
    username: string;
    deliveryAddress: Address;
}

interface OrderStageFactory {
    (original: Order, current: Order): Order;
}

interface OrderBuilder {
    withProducts(products: Order['products']): OrderBuilder;
    withCoupons(coupons: Order['coupons']): OrderBuilder;
    withUsername(username: Order['username']): OrderBuilder;
    withDeliveryAddress(address: Order['deliveryAddress']): OrderBuilder;

    pipe(...stageFactories: OrderStageFactory[]): OrderBuilder;
    build(): Order;
}

export class OrderBuilderImpl implements OrderBuilder {
    private products: Order['products'];
    private coupons: Order['coupons'];
    private username: Order['username'];
    private deliveryAddress: Order['deliveryAddress'];

    private stageFactories: OrderStageFactory[] = [];

    withProducts(products: Order['products']): OrderBuilder {
        this.products = products;
        return this;
    }

    withCoupons(coupons: Order['coupons']): OrderBuilder {
        this.coupons = coupons;
        return this;
    }

    withUsername(username: Order['username']): OrderBuilder {
        this.username = username;
        return this;
    }

    withDeliveryAddress(address: Order['deliveryAddress']): OrderBuilder {
        this.deliveryAddress = address;
        return this;
    }

    pipe(...stageFactories: OrderStageFactory[]): OrderBuilder {
        this.stageFactories.push(...stageFactories);
        return this;
    }

    build(): Order {
        const originalOrder = new OrderImpl(
            this.products,
            this.coupons,
            this.username,
            this.deliveryAddress
        )

        if (!this.stageFactories.length) {
            return originalOrder;
        }

        return this.stageFactories.reduce(
            (order, stageFactory) => stageFactory.call(this, [originalOrder, order]),
        originalOrder);
    }
}

export class OrderImpl implements Order {
    private totalCost: number;

    constructor(
        public products: ProductInOrder[],
        public coupons: Coupon[],
        public username: string,
        public deliveryAddress: Address
    ) {}

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

const orderBuilder = new OrderBuilderImpl()
    .withProducts(products)
    .withCoupons(coupons)
    .withUsername('superuser177')
    .withDeliveryAddress(deliveryAddress);

const orderForSuperuser = orderBuilder
    .pipe(
        // Here comes our seasonal offer
        (original: Order, current: Order) => ({
            ...current,
            products: original.products.map(product => ({ ...product, price: product.price * 0.8 }))
        }),
        // Here comes our promo product
        (original: Order, current: Order) => ({
            ...current,
            products: [
                ...current.products,
                {
                    price: 0,
                    name: 'Seat',
                    quantity: 1
                }
            ]
        })
    )
    .build();
