import CategoryModel from "../models/categoryModel.js";
import ProductModel from "../models/productModel.js";
import productVarientModel from "../models/ProductVariant.js";
import { uploadToCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";


export const createCategory = async (req, res) => {
  try {
    const { category_name, description,status } = req.body;

    if (!category_name || !description || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: category_name, description, or image file",
      });
    }

    // Upload to Cloudinary using buffer
    const cloudResult = await uploadToCloudinary(req.file.buffer, "category");

    const category = new CategoryModel({
      category_name,
      description,
      category_imageUrl: cloudResult.url,
      imagePublicId: cloudResult.public_id,
      is_active:status|| true,
    });

    await category.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category, // fixed typo from `date`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    let updates = req.body;

    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // ✅ Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (category.imagePublicId) {
        await deleteFromCloudinary(category.imagePublicId);
      }

      const cloudResult = await uploadToCloudinary(req.file.buffer, "category");
      updates.category_imageUrl = cloudResult.url;
      updates.imagePublicId = cloudResult.public_id;
    }

    // ✅ Merge updates into category
    Object.assign(category, updates);

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteCategoryById = async (req, res) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    // Delete image from Cloudinary
    if (category.imagePublicId) await deleteFromCloudinary(category.imagePublicId);

    await category.deleteOne();
    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();

    // Delete images from Cloudinary
    for (const cat of categories) {
      if (cat.imagePublicId) await deleteFromCloudinary(cat.imagePublicId);
    }

    await CategoryModel.deleteMany();
    return res.status(200).json({ success: true, message: "All categories deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      product_description,
      product_price,
      sale_price,
      stock_quantity,
      low_stock_threshold,
      categoryId,
      brand,
      is_active
    } = req.body;

    // Check required fields
    if (
      !product_name ||
      !product_price ||
      !stock_quantity ||
      !categoryId ||
      !req.file
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Missing required fields: product_name, product_price, stock_quantity, categoryId, or image file",
      });
    }

    // Check if category exists
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Upload product image to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer, "products");

    // Create new product
    const product = new ProductModel({
      product_name,
      product_description,
      product_price,
      sale_price: sale_price || null,
      stock_quantity,
      low_stock_threshold: low_stock_threshold || 5,
      is_active: is_active !== undefined ? is_active : true,
      categoryId,
      brand:brand,
      imagePublicId: cloudResult.public_id,
      product_imageUrl: cloudResult.url,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find().populate("categoryId", "category_name");
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/productController.js
export const getProductsByBrand = async (req, res) => {
  try {
    const { brand } = req.params;

    // Validate brand name (optional, for safety)
    const allowedBrands = ["devproducts", "olaproducts", "jappantools"];
    if (!allowedBrands.includes(brand)) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand name",
      });
    }

    // Fetch all products matching the brand
    const products = await ProductModel.find({ brand })
      .populate("categoryId", "category_name") // if you want category details
      .lean();

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: `No products found for brand: ${brand}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id).populate("categoryId", "category_name");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



export const getProductByIdwithAllvarients = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product with category
    const product = await ProductModel.findById(id).populate("categoryId", "category_name");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Find all variants for this product
    const variants = await productVarientModel.find({ productId: id });

    return res.status(200).json({
      success: true,
      data: {
        product,
        variants,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Handle image update if new file uploaded
    if (req.file) {
      // Delete old image
      if (product.imagePublicId) {
        await deleteFromCloudinary(product.imagePublicId);
      }
      const cloudResult = await uploadToCloudinary(req.file.buffer, "products");
      updates.imagePublicId = cloudResult.public_id;
      updates.product_imageUrl = cloudResult.url;
    }

    Object.assign(product, updates);
    await product.save();

    return res.status(200).json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete Cloudinary image
    if (product.imagePublicId) {
      await deleteFromCloudinary(product.imagePublicId);
    }

    await product.deleteOne();

    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find();

    // Delete all Cloudinary images
    for (const product of products) {
      if (product.imagePublicId) {
        await deleteFromCloudinary(product.imagePublicId);
      }
    }

    await ProductModel.deleteMany();

    return res.status(200).json({ success: true, message: "All products deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const createProductVarient = async (req, res) => {
  try {
    const {
      productvarient_name,
      productId,
      productvarient_description,
      productvarient_price,
      productvarient_sale_price,
      productvarient_stock_quantity,
      is_active,
    } = req.body;

    // ✅ Validate required fields
    if (
      !productvarient_name ||
      !productId ||
      !productvarient_price ||
      !productvarient_stock_quantity ||
      !req.files ||
      req.files.length < 4 ||
      req.files.length > 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields or invalid number of images (must be 4–6).",
      });
    }

    // ✅ Check parent product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        const cloudResult = await uploadToCloudinary(file.buffer, "product_variants");
        return {
          url: cloudResult.url,   // ✅ Make sure secure_url exists
          public_id: cloudResult.public_id,
        };
      })
    );


    // ✅ Create new variant
    const productVarient = new productVarientModel({
      productvarient_name,
      productId,
      productvarient_description,
      productvarient_price,
      productvarient_sale_price: productvarient_sale_price || null,
      productvarient_stock_quantity,
      is_active: is_active !== undefined ? is_active : true,
      productvarient_images: uploadedImages,
    });

    await productVarient.save();

    return res.status(201).json({
      success: true,
      message: "Product variant created successfully",
      data: productVarient,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getProductVarientById = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await productVarientModel.findById(id).populate("productId", "product_name");

    if (!variant) {
      return res.status(404).json({ success: false, message: "Product variant not found" });
    }

    return res.status(200).json({ success: true, data: variant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProductVarient = async (req, res) => {
  try {

    const variant = await productVarientModel.find().populate("productId", "product_name");

    if (!variant) {
      return res.status(404).json({ success: false, message: "Product variant not found" });
    }


    return res.status(200).json({ success: true, data: variant });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ Update Product Variant
export const updateProductVarient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      productvarient_name,
      productvarient_description,
      productvarient_price,
      productvarient_sale_price,
      productvarient_stock_quantity,
      is_active,
      existingImages, // 👈 comes as JSON string from frontend
    } = req.body;

    const variant = await productVarientModel.findById(id);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Product variant not found" });
    }

    // ✅ Parse existing images (ids to keep)
    let keepImages = [];
    if (existingImages) {
      try {
        const keepIds = JSON.parse(existingImages);
        keepImages = variant.productvarient_images.filter((img) =>
          keepIds.includes(img._id.toString())
        );
      } catch (err) {
        console.warn("Failed to parse existingImages:", err.message);
      }
    }

    // ✅ Handle new image uploads
    let newUploads = [];
    if (req.files && req.files.length > 0) {
      newUploads = await Promise.all(
        req.files.map(async (file) => {
          const cloudResult = await uploadToCloudinary(file.buffer, "product_variants");
          return {
            url: cloudResult.url,
            public_id: cloudResult.public_id,
          };
        })
      );
    }

    // ✅ Delete removed images from Cloudinary (only those not in keep list)
    const removedImages = variant.productvarient_images.filter(
      (img) => !keepImages.some((keep) => keep._id.toString() === img._id.toString())
    );
    if (removedImages.length > 0) {
      await Promise.all(
        removedImages.map((img) => deleteFromCloudinary(img.public_id))
      );
    }

    // ✅ Final images = kept + new
    const uploadedImages = [...keepImages, ...newUploads];

    // ✅ Update fields
    variant.productvarient_name = productvarient_name || variant.productvarient_name;
    variant.productvarient_description =
      productvarient_description || variant.productvarient_description;
    variant.productvarient_price =
      productvarient_price || variant.productvarient_price;
    variant.productvarient_sale_price =
      productvarient_sale_price || variant.productvarient_sale_price;
    variant.productvarient_stock_quantity =
      productvarient_stock_quantity || variant.productvarient_stock_quantity;
    variant.is_active =
      is_active !== undefined ? is_active === "true" || is_active === true : variant.is_active;
    variant.productvarient_images = uploadedImages;

    await variant.save();

    return res.status(200).json({
      success: true,
      message: "Product variant updated successfully",
      data: variant,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message });
  }
};

// ✅ Delete Product Variant By ID
export const deleteProductVarientById = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await productVarientModel.findById(id);

    if (!variant) {
      return res.status(404).json({ success: false, message: "Product variant not found" });
    }

    // Delete images from Cloudinary
    await Promise.all(
      variant.productvarient_images.map((img) => deleteFromCloudinary(img.public_id))
    );

    await productVarientModel.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Product variant deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete All Product Variants
export const deleteAllProductVarients = async (req, res) => {
  try {
    const variants = await productVarientModel.find();

    // Delete images from Cloudinary
    await Promise.all(
      variants.flatMap((variant) =>
        variant.productvarient_images.map((img) => deleteFromCloudinary(img.public_id))
      )
    );

    await productVarientModel.deleteMany();

    return res.status(200).json({ success: true, message: "All product variants deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

