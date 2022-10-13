const User = require("../models/User");
const ErrorHandler = require("../utils/ErrorHandler");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(
            new ErrorHandler("Login frist to access this resource", StatusCodes.UNAUTHORIZED)
        );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
};


exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role ${req.user.role} is not allowed to access this resource`, StatusCodes.FORBIDDEN))
        }
        next()
    }
}
