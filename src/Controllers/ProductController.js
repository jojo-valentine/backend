const path = require("path");
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
const verifyToken = require("../middleware/authMiddleware");
const {
  validateProduct,
  validateProductImages,
} = require("../validation/ProductValidator");
const {
  AppError,
  handleValidationError,
  handleDatabaseError,
  sendErrorDev,
  sendErrorProd,
} = require("../utils/errorHandler");
const Product = require("../Model/Product");
const ImageProduct = require("../Model/ImageProduct");

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // กำหนดให้ไฟล์ถูกบันทึกที่โฟลเดอร์ 'uploads'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // เปลี่ยนชื่อไฟล์ให้ไม่ซ้ำกัน
  },
});

// ✅ Define file filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("อัปโหลดได้เฉพาะไฟล์ภาพเท่านั้น!"), false);
  }
};

// ✅ Initialize Multer upload instance (define it globally)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max size: 5MB
  fileFilter: fileFilter,
}).array("imageProduct", 5); // Allow multiple images (up to 5)

const deleteUploadedFiles = (files) => {
  if (files) {
    files.forEach((file) => {
      const filePath = path.join(uploadDir, file.filename);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(`ไม่สามารถลบไฟล์ ${filePath}:`, unlinkErr);
        } else {
          console.log(`ลบไฟล์ ${filePath} สำเร็จ`);
        }
      });
    });
  }
};
exports.createProduct = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const { isValid: isProductValid, errors: errorMessages } = validateProduct(
      req.body
    );
    const { isValid: isProductImagesValid, errors: errorMessageImage } =
      validateProductImages(req.files);

    if (!isProductImagesValid) {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        errors: errorMessageImage.map((error) => ({
          field: error.field,
          message: error.message,
        })),
      });
    }
    // console.log(isProductImagesValid);

    if (!isProductValid) {
      // console.error("Validation failed:", errors);
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        message: "Validation failed.",
        errors: errorMessages.map((error) => ({
          field: error.field,
          message: error.message,
        })),
      });
    }

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
    const session = await mongoose.startSession(); // Ensure this is inside an async function
    session.startTransaction();
    try {
      const newProduct = await Product.create(
        [
          {
            user_id: req.user.userId,
            nameProduct: req.body.nameProduct,
            priceProduct: req.body.priceProduct,
            detailProduct: req.body.detailProduct ?? null,
            discountProduct: req.body.discountProduct ?? null,
            activeProduct: 1,
          },
        ],
        { session }
      );
      if (req.files && req.files.length > 0) {
        const dataProductImage = req.files.map((file) => ({
          productId: newProduct[0]._id, // ใช้ `_id` จาก `newProduct`
          imagePath: `/uploads/${file.filename}`, // ใช้ `filename` แยกกัน
        }));

        const newProductImage = await ImageProduct.insertMany(
          dataProductImage,
          { session }
        ); // ✅ ใช้ insertMany สำหรับหลายรูป
        // console.log("Inserted documents:", newProductImage);
      }

      await session.commitTransaction();
      session.endSession();
      console.log("Product created successfully!");

      res.status(201).json({
        message: "Product created successfully!",
        product: newProduct[0],
        images: imagePaths,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(error);
      deleteUploadedFiles(req.files);
      res.status(500).json({
        message: "Error processing product creation.",
        error: error.message,
      });
    } finally {
      session.endSession(); // End the session
    }
  });
};

exports.editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    // console.log("productId: ", productId);
    const product = await Product.findOne({ _id: productId })
      .populate({
        path: "images",
        match: { deletedAt: null },
      })
      .exec();
    // console.log("product: ", productId);
    if (!product) {
      res.status(404).json({
        message: "product not find",
      });
    }
    res.status(201).json({
      message: "find product success",
      data: product,
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาด!" });
  }
};
exports.updateProduct = async (req, res) => {
  upload(req, res, async (err) => {
    const productId = req.params.id;

    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const { isValid: isProductValid, errors: errorMessages } = validateProduct(
      req.body
    );
    const { isValid: isProductImagesValid, errors: errorMessageImage } =
      validateProductImages(req.files);

    if (!isProductImagesValid) {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        errors: errorMessageImage.map((error) => ({
          field: error.field,
          message: error.message,
        })),
      });
    }
    // console.log(isProductImagesValid);

    if (!isProductValid) {
      // console.error("Validation failed:", errors);
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        message: "Validation failed.",
        errors: errorMessages.map((error) => ({
          field: error.field,
          message: error.message,
        })),
      });
    }

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
    const session = await mongoose.startSession(); // Ensure this is inside an async function
    session.startTransaction();
    const {
      nameProduct,
      priceProduct,
      detailProduct,
      activeProduct,
      discountProduct,
    } = req.body;

    try {
      const product = await Product.findByIdAndUpdate(
        { _id: productId },
        {
          nameProduct: nameProduct,
          priceProduct: priceProduct,
          detailProduct: detailProduct,
          activeProduct: activeProduct,
          discountProduct: discountProduct,
        },
        { new: true, session }
      );
      if (!product) return res.status(404).json({ error: "Product not found" });
      if (req.files && req.files.length > 0) {
        const dataProductImage = req.files.map((file) => ({
          productId: product._id, // ใช้ `_id` จาก `newProduct`
          imagePath: `/uploads/${file.filename}`, // ใช้ `filename` แยกกัน
        }));

        const newProductImage = await ImageProduct.insertMany(
          dataProductImage,
          { session }
        ); // ✅ ใช้ insertMany สำหรับหลายรูป
        // console.log("Inserted documents:", newProductImage);
      }

      await session.commitTransaction();
      session.endSession();
      console.log("Product update successfully!", product);

      res.status(201).json({
        message: "Product update successfully!",
        product: product[0],
        images: imagePaths,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error(error);
      deleteUploadedFiles(req.files);
      res.status(500).json({
        message: "Error processing product creation.",
        error: error.message,
      });
    } finally {
      session.endSession(); // End the session
    }
  });
};
exports.deleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const productId = req.params.id;

    // Check if ID is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { deletedAt: new Date() },
      { new: true, session }
    );

    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Product not found." });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      message: "Delete successful",
      data: product,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    session.endSession(); // Only need this once here
  }
};

exports.deleteProductImage = async (req, res) => {
  const productId = req.params.id;
  // const productImage = await ImageProduct.findById(productId);
  const productImage = await ImageProduct.findByIdAndUpdate(productId, {
    deletedAt: new Date(),
  });
  console.log(productImage);
  if (!productImage) {
    return res.status(404).json({ message: "Image not found" });
  }
  res.status(201).json({
    massage: "delete success",
    data: productImage,
  });
};
exports.listProduct = async (req, res) => {
  try {
    // ค้นหาทุกเอกสารในคอลเลกชัน Product และ populate ฟิลด์ 'images'
    const products = await Product.find({ deletedAt: null })
      .populate({
        path: "images",
        match: { deletedAt: null },
      })
      .exec();
    res.status(200).json({
      message: "สำเร็จ",
      datalist: products,
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาด!" });
  }
};
