const router = require("express").Router();

const {
  registerUser,
  login,
  logout,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)

module.exports = router;
