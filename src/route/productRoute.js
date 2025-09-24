import express from "express";
import {
  createCategory,
  createProduct,
  createProductVarient,
  deleteAllCategories,
  deleteAllProducts,
  deleteAllProductVarients,
  deleteCategoryById,
  deleteProductById,
  deleteProductVarientById,
  getAllCategories,
  getAllProducts,
  getCategoryById,
  getProductById,
  getProductByIdwithAllvarients,
  getProductVarientById,
  updateCategory,
  updateProduct,
  updateProductVarient,
} from "../controller/productController.js";
import { upload, uploadMultiple } from "../middileware/multer.js";
import { authMiddleware } from "../middileware/authMiddleware.js";
import { allowEditorOrAdmin } from "../middileware/roleMiddleware.js";

const productRouter = express.Router();

// category routes
productRouter.post("/category",authMiddleware, upload.single("file"), createCategory);
productRouter.get("/category",authMiddleware,allowEditorOrAdmin, getAllCategories);
productRouter.get("/category/:id", getCategoryById);
productRouter.put("/category/:id",authMiddleware, upload.single("file"), updateCategory);
productRouter.delete("/category/:id",authMiddleware, deleteCategoryById);
productRouter.delete("/category",authMiddleware, deleteAllCategories);

// product routes
productRouter.post("/",authMiddleware, upload.single("file"), createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/all_varient/:id", getProductByIdwithAllvarients);
productRouter.get("/:id", getProductById);
productRouter.put("/:id",authMiddleware, upload.single("file"), updateProduct);
productRouter.delete("/",authMiddleware, deleteAllProducts);
productRouter.delete("/:id",authMiddleware, deleteProductById);

// product varients
productRouter.post("/product_varient",authMiddleware, uploadMultiple, createProductVarient);
productRouter.get("/product_varient/:id", getProductVarientById);
productRouter.put("/product_varient/:id",authMiddleware, uploadMultiple, updateProductVarient);
productRouter.delete("/product_varient/:id",authMiddleware, deleteProductVarientById);
productRouter.delete("/product_varient",authMiddleware, deleteAllProductVarients);


export default productRouter;
