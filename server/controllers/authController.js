const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../utils/ErrorHandler");
const sendToken = require("../utils/jwtToken");
const SendEmail = require("../utils/SendEmail");
const crypto = require("crypto");

exports.registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const user = new User({
      name,
      email,
      password,
      avatar: {
        public_id: "123456789",
        url: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
      },
    });

    await user.save();
    sendToken(user, StatusCodes.CREATED, res);
  } catch (error) {
    next(error);
  }
};

// Log in user => /api/v1/auth/login

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return next(
        new ErrorHandler(
          "Please enter email & Password",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(
        new ErrorHandler("Invalid email or Password", StatusCodes.UNAUTHORIZED)
      );
    }

    const passwordMatch = await user.comarePassword(password);

    if (!passwordMatch) {
      return next(
        new ErrorHandler("Invalid email or Password", StatusCodes.UNAUTHORIZED)
      );
    }

    sendToken(user, StatusCodes.OK, res);
  } catch (error) {
    next(error);
  }
};

// User logout=> /api/v1/auth/logout
exports.logout = async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(StatusCodes.OK).json({
    status: true,
    message: "User logged out",
  });
};

// Forgot password send mail
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ErrorHandler("User not found with this email", StatusCodes.NOT_FOUND)
    );
  }

  const resetToken = user.forgotPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/password/reset/${resetToken}`;
  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

  try {
    await SendEmail({
      email: user.email,
      message,
      subject: "ShopIT Password Recovery",
    });
    res.status(StatusCodes.OK).json({
      status: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    (user.resetPasswordToken = undefined),
      (user.resetPasswordExpire = undefined);
    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR)
    );
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  const reserPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    reserPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler('Password reser token is invalid or has been expired', StatusCodes.BAD_REQUEST))
  }

  if (req.body.password != req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', StatusCodes.BAD_REQUEST))
  }

  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendToken(user, StatusCodes.OK, res)

};
