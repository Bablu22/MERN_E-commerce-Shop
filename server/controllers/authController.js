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
    return next(
      new ErrorHandler(
        "Password reser token is invalid or has been expired",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  if (req.body.password != req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password does not match", StatusCodes.BAD_REQUEST)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, StatusCodes.OK, res);
};

// Get current logged in user

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(StatusCodes.OK).json({
      status: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user password
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    const passwordMatch = await user.comarePassword(req.body.oldPassword);

    if (!passwordMatch) {
      return next(
        new ErrorHandler(
          "Current password is incorrect",
          StatusCodes.UNAUTHORIZED
        )
      );
    }
    user.password = req.body.password;
    await user.save();
    sendToken(user, StatusCodes.OK, res);
  } catch (error) {
    next(error);
  }
};

// Update Profile name & email
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const newData = {
      name,
      email,
    };

    // Update avatar

    const user = await User.findByIdAndUpdate(req.user.id, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    res.status(StatusCodes.OK).json({
      status: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(StatusCodes.OK).json({
      status: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single user
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        new ErrorHandler(`User does not found with id: ${req.params.id}`)
      );
    }
    res.status(StatusCodes.OK).json({
      status: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// User update
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const newData = {
      name,
      email,
      role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    res.status(StatusCodes.OK).json({
      status: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete User
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(
        new ErrorHandler(`User does not found with id: ${req.params.id}`)
      );
    }
    await user.remove();
    res.status(StatusCodes.OK).json({
      status: true,
      message: "User deletd success",
    });
  } catch (error) {
    next(error);
  }
};
