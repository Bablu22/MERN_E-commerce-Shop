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
