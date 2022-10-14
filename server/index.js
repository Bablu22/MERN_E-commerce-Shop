const express = require("express");
const app = require("./app");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({ path: "config/config.env" });
const database = require("./config/database");
const errorHandle = require("./middlewares/error");
const cookieParser = require("cookie-parser");

// Import routes
const productRoute = require("./routes/products");
const authRouter = require("./routes/auth");
const orderRoute = require("./routes/order");

//  app use
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Route use
app.use("/api/v1", productRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1/auth", authRouter);
app.get("/", (req, res) => {
  res.send("Server is running");
});

// MiddleWares Use
app.use(errorHandle);

// Databse connection
database();

const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on PORT ${process.env.PORT} in ${process.env.NODE_ENV} Mode`
  );
});

// Handle Unhandle promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Server is sutting down due to unhandle rejection");

  server.close(() => {
    process.exit(1);
  });
});
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Server is sutting down due to uncaughtException");
  process.exit(1);
});
