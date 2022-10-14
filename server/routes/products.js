const router = require("express").Router();

const {
    getProducts,
    newProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    newReview,
    getAllReviews,
    deleteReview
} = require("../controllers/productController");

const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

router.route("/products").get(getProducts);
router.route("/product/:id").get(getSingleProduct);
router
    .route("/admin/product/new")
    .post(isAuthenticated, authorizeRoles("admin"), newProduct);
router
    .route("/admin/product/:id")
    .put(isAuthenticated, authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticated, authorizeRoles("admin"), deleteProduct);

router.route("/review").put(isAuthenticated, newReview);
router.route("/reviews").get(isAuthenticated, getAllReviews);
router.route("/reviews").delete(isAuthenticated, deleteReview);

module.exports = router;
