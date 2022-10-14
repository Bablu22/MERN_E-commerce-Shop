const router = require("express").Router();
const {
    newOrder,
    myOrders,
    singleOrder,
    allOrders,
    updateOrders,
    deleteOrder,
} = require("../controllers/orderController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

// route
router.route("/order/new").post(isAuthenticated, newOrder);
router.route("/order/new").post(isAuthenticated, newOrder);

router.route("/order/:id").get(isAuthenticated, singleOrder);
router.route("/orders/me").get(isAuthenticated, myOrders);

router
    .route("/admin/orders")
    .get(isAuthenticated, authorizeRoles("admin"), allOrders);
router
    .route("/admin/order/:id")
    .put(isAuthenticated, authorizeRoles("admin"), updateOrders)
    .delete(isAuthenticated, authorizeRoles("admin"), deleteOrder);

module.exports = router;
