import ProductModel from "../models/productModel.js";

export const searchAllProduct = async (req, res) => {
  try {
    const { product_name } = req.query;

    let query = {};
    if (product_name) {
      query.product_name = { $regex: product_name, $options: "i" }; // case-insensitive partial search
    }

    const product = await ProductModel.find(query);

    if (!product || product.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Auto-suggest product names
export const autoSuggestProduct = async (req, res) => {
  try {
    const { q } = req.query; // user input (like "i")

    if (!q) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    // search only in product_name using regex
    const products = await ProductModel.find(
      { product_name: { $regex: q, $options: "i" } },
      { product_name: 1 } // return only product_name field
    ).limit(10); // limit suggestions to 10

    return res.status(200).json({ success: true, suggestions: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const filterProducts = async (req, res) => {
  try {
    const { search, inStock, sortBy, categoryId } = req.query;

    let query = {};

    // Search by product name (partial match, case-insensitive)
    if (search) {
      query.product_name = { $regex: search, $options: "i" };
    }

    //  In-stock filter
    if (inStock === "true") {
      query.stock_quantity = { $gt: 0 };
    }

    //  Category filter (by ID)
    if (categoryId) {
      query.categoryId = categoryId; // must be ObjectId
    }

    // Sorting
    let sort = {};
    if (sortBy === "lowToHigh") {
      sort = { sale_price: 1 }; // ascending
    } else if (sortBy === "highToLow") {
      sort = { sale_price: -1 }; // descending
    } else {
      sort = { createdAt: -1 }; // newest first (default)
    }

    const products = await ProductModel.find(query)
      .populate("categoryId", "category_name") // show category name
      .sort(sort);

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: "No products found" });
    }

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};