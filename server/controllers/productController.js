const Product = require("../models/Product");
const ErrorHandler = require("../utils/ErrorHandler");
const { StatusCodes } = require("http-status-codes");
const APIFeatures = require("../utils/APIFeatures");

// Create new product=> /api/v1/product/new
exports.newProduct = async (req, res, next) => {
  req.body.user = req.user.id;
  try {
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Get all products => /api/v1/products?keyword=apple
exports.getProducts = async (req, res, next) => {
  try {
    const restPerPage = 4;
    const apifeatures = new APIFeatures(Product.find(), req.query)
      .search()
      .filter()
      .pagination(restPerPage);

    const products = await apifeatures.query;

    res.status(StatusCodes.OK).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Get product by id => /api/v1/product/id
exports.getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", StatusCodes.NOT_FOUND));
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Update product by id => /api/v1/admin/product/id
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", StatusCodes.NOT_FOUND));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product by Id => /api/v1/admin/product/id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", StatusCodes.NOT_FOUND));
    }

    product.remove();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Product deleted Success",
    });
  } catch (error) {
    next(error);
  }
};

// Product review
exports.newReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);
    const isReviewd = product.reviews.find(
      (r) => r._id.toString() === req.user._id.toString()
    );

    if (isReviewd) {
      product.reviews.forEach((item) => {
        if (item.user.toString() === req.user._id.toString()) {
          (review.comment = comment), review, (rating = rating);
        }
      });
    } else {
      product.reviews.push(review);
      product.numofReviews = product.reviews.length;
    }

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save({ validateBeforeSave: false });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Comment add success",
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.id);
    res.status(StatusCodes.OK).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.productId);

    const reviews = product.reviews.filter(
      (review) => review._id.toString() !== req.query.id.toString()
    );

    const rating = (product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length);

    const numofReviews = reviews.length;

    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        rating,
        numofReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "review delete success",
    });
  } catch (error) {
    next(error);
  }
};
