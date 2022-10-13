const ErrorHandler = require("../utils/ErrorHandler");
const { StatusCodes } = require("http-status-codes");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    if (process.env.NODE_ENV === "DEVELOPMENT") {
        // if (err.name === 'CastError') {
        //     const message = `Resource not found. Invalid ${err.path}`
        //     err = new ErrorHandler(message, StatusCodes.BAD_REQUEST)
        // }
        // if (err.name === 'ValidationError') {
        //     const message = Object.values(err.errors).map(value => value.message)
        //     err = new ErrorHandler(message, StatusCodes.BAD_REQUEST)
        // }

        res.status(err.statusCode).json({
            status: false,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    if (process.env.NODE_ENV === "PRODUCTION") {
        let error = { ...err };
        error.message = err.message;

        if (err.name === "CastError") {
            const message = `Resource not found. Invalid ${error.path}`;
            error = new ErrorHandler(message, StatusCodes.BAD_REQUEST);
        }
        if (err.name === "ValidationError") {
            const message = Object.values(err.errors).map((value) => value.message);
            error = new ErrorHandler(message, StatusCodes.BAD_REQUEST);
        }
        if (err.code === 11000) {
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
            error = new ErrorHandler(message, StatusCodes.BAD_REQUEST);
        }
        if (err.name === "JsonWebTokenError") {
            const message = "JSON web token is invalid. Try Again!!!";
            error = new ErrorHandler(message, StatusCodes.BAD_REQUEST);
        }
        if (err.name === "TokenExpiredError") {
            const message = "JSON web token is expired. Try Again!!!";
            error = new ErrorHandler(message, StatusCodes.BAD_REQUEST);
        }

        res.status(err.statusCode).json({
            status: false,
            message: error.message || "Internal Server Error",
        });
    }
};
