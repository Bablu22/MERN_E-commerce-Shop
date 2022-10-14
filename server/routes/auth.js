const router = require("express").Router();

const {
  registerUser,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

// users
router.route("/me").get(isAuthenticated, getUserProfile);
router.route("/me/update").post(isAuthenticated, updateProfile);
router.route("/password/update").put(isAuthenticated, updatePassword);

// Admin get all users and users details
router
  .route("/admin/users")
  .get(isAuthenticated, authorizeRoles("admin"), getUsers);
router
  .route("/admin/users/:id")
  .get(isAuthenticated, authorizeRoles("admin"), getUserById)
  .put(isAuthenticated, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteUser);
module.exports = router;
