const express = require("express");
const multer = require("multer");
// const User = require('../Model/User');
const PageController = require("../../Controllers/PageController");
const AuthController = require("../../Controllers/AuthController");
const ProductController = require("../../Controllers/ProductController");
const router = express.Router();
const verifyToken = require("../../middleware/authMiddleware");

// router.get("/", (req, res, next) => {
//   User.find({})
//     .then((users) => res.json(users))
//     .catch((err) => next(err));
// });

router.get("/home", verifyToken, PageController.getHomePageData);
router.post(
  "/createUser",
  //  upload.none(),
  AuthController.createUser
);
router.post(
  "/login",
  // upload.none(),
  // {'onclud'},
  AuthController.loginUser
);

router.post("/logout", verifyToken, AuthController.logoutUser);
// router.get(
//   "/",
//   verifyToken,

//   AuthController.listDataUser
// );
router.get("/listData", verifyToken, AuthController.listDataUser);
router.get("product/data", verifyToken, ProductController.listProduct);
router.get("/api", (req, res) => {
  res.json({ message: "Hello from router the backend!" });
});

router.post(
  "/createData/product",
  verifyToken,
  // Accept up to 5 images
  ProductController.createProduct
);

router.get("/dataEdit/:id", verifyToken, ProductController.editProduct);
router.put("/updateData/:id", verifyToken, ProductController.updateProduct);
router.delete("/deleteProductImage/:id", verifyToken, ProductController.deleteProductImage);
router.delete("/deleteProduct/:id", verifyToken, ProductController.deleteProduct);
router.get("/dataListProduct", verifyToken, ProductController.listProduct);
// router.prefix('/user' ,verifyToken ,async function (user){
// });

module.exports = router;
