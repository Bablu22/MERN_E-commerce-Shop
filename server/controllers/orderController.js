const Order = require("../models/Order");
const Product = require("../models/Product");
const ErrorHandler = require("../utils/ErrorHandler");
const { StatusCodes } = require("http-status-codes");

// Create a new order=> /api/v1/order/new
exports.newOrder = async (req, res, next) => {
    const {
        orderItem,
        shippingInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
    } = req.body;

    try {
        const order = new Order({
            orderItem,
            shippingInfo,
            itemPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo,
            paidAt: Date.now(),
            user: req.user._id,
        });
        await order.save();
        res.status(StatusCodes.OK).json({
            status: true,
            message: "Order Success",
            order,
        });
    } catch (error) {
        next(error);
    }
};

// Get single order => /api/v1/order/:id

exports.singleOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );

        if (!order) {
            return next(new ErrorHandler("No order found", StatusCodes.NOT_FOUND));
        }
        res.status(StatusCodes.OK).json({
            status: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};

// get my order
exports.myOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id });

        if (!orders) {
            return next(new ErrorHandler("No order found", StatusCodes.NOT_FOUND));
        }
        res.status(StatusCodes.OK).json({
            status: true,
            orders,
        });
    } catch (error) {
        next(error);
    }
};

// Admin get all orders => /api/v1/admin/orders
exports.allOrders = async (req, res, next) => {
    try {
        const orders = await Order.find();
        let totalAmount = 0;
        orders.forEach((order) => (totalAmount += order.paymentInfo.totalPrice));

        res.status(StatusCodes.OK).json({
            status: true,
            totalAmount,
            count: orders.length,
            orders,
        });
    } catch (error) {
        next(error);
    }
};


// Update Stock
async function updateStock(id, quantity) {
    let product = await Product.findById(id);

    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false });
}

// Update/ Process order- Admin => /api/v1/order/:id
exports.updateOrders = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return next(new ErrorHandler("No order found", StatusCodes.NOT_FOUND));
        }

        if (order.orderStatus === "Delivered") {
            return next(
                new ErrorHandler(
                    "Your order already delivered",
                    StatusCodes.BAD_REQUEST
                )
            );
        }

        order.orderItem.forEach(async (item) => {
            await updateStock(item.product, item.quantity);
        });

        order.orderStatus = req.body.status
        order.deliverAt = Date.now()


        await order.save()

        res.status(StatusCodes.OK).json({
            status: true,
        });
    } catch (error) {
        next(error);
    }
};


// Delete order
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)

        if (!order) {
            return next(new ErrorHandler("No order found", StatusCodes.NOT_FOUND));
        }

        await order.remove()
        res.status(StatusCodes.OK).json({
            status: true,
            message: "Order Delete success"
        });
    } catch (error) {
        next(error);
    }
};