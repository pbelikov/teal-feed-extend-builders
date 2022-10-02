import {Address, Coupon, ProductInOrder} from "../interfaces";

// Generic intefaces and abstract builder

export interface StageFactory<T> {
    (original: T, current: T): T;
}

export interface PipeBuilderBase<T> {
    pipe(...stageFactories: StageFactory<T>[]): PipeBuilderBase<T>;
    build(): T;
}

export abstract class AbstractBasePipeBuilder<T> implements PipeBuilderBase<T> {
    /**
     * @desc Stack of stages that are executed over the value.
     * @private
     */
    private stageFactories: StageFactory<T>[] = [];

    /**
     * @desc Base implementation of the pipe that just adds the stages.
     * @param stageFactories
     */
    pipe(...stageFactories: StageFactory<T>[]): PipeBuilderBase<T> {
        this.stageFactories.push(...stageFactories);
        return this;
    }

    /**
     * @desc Abstract build method to be implemented by the developer.
     */
    abstract build(): T;

    /**
     * @desc Method to execute the piped stages.
     * @param source
     * @protected
     */
    protected executePipe(source: T): T {
        if (!this.stageFactories.length) {
            return source;
        }

        return this.stageFactories.reduce(
            (current, stageFactory) => stageFactory.call(this, [source, current]),
            source);
    }
}

/// Concrete interfaces and builder

interface Order {
    products: ProductInOrder[];
    coupons: Coupon[];
    username: string;
    deliveryAddress: Address;
}

interface OrderBuilder extends PipeBuilderBase<Order> {
    withProducts(products: Order['products']): OrderBuilder;
    withCoupons(coupons: Order['coupons']): OrderBuilder;
    withUsername(username: Order['username']): OrderBuilder;
    withDeliveryAddress(address: Order['deliveryAddress']): OrderBuilder;
}

export class OrderBuilderImpl extends AbstractBasePipeBuilder<Order> implements OrderBuilder {
    private products: Order['products'];
    private coupons: Order['coupons'];
    private username: Order['username'];
    private deliveryAddress: Order['deliveryAddress'];

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

    build(): Order {
        const originalOrder = new OrderImpl(
            this.products,
            this.coupons,
            this.username,
            this.deliveryAddress
        )

        return super.executePipe(originalOrder);
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
