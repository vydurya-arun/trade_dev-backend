import CategoryModel from "../models/categoryModel.js";
import ProductModel from "../models/productModel.js";

export const searchAllProduct = async (req, res) => {
  try {
    const { product_name } = req.query;

    // simple validation
    if (!product_name || product_name.trim() === "") {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No search term provided",
      });
    }

    const query = {
      product_name: { $regex: product_name, $options: "i" }, // case-insensitive partial match
    };

    const products = await ProductModel.find(query);

    return res.status(200).json({
      success: true,
      data: products || [],
      message: products.length > 0 ? "Products found" : "No products found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while searching products",
    });
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
    const {
      search,
      inStock,
      sortBy,
      category_name,
      product_features,
      brand,
      page = 1, 
      limit = 6  
    } = req.query;

    let query = {};

    // Search by product name (partial, case-insensitive)
    if (search) {
      query.product_name = { $regex: search, $options: "i" };
    }

    //  In-stock filter
    if (inStock === "true") {
      query.stock_quantity = { $gt: 0 };
    }

    //  Category filter (by name instead of ID)
    if (category_name) {
      const category = await CategoryModel.findOne({
        category_name: { $regex: `^${category_name}$`, $options: "i" },
      });
      if (category) {
        query.categoryId = category._id;
      } else {
        return res.status(404).json({
          success: false,
          message: `No category found with name "${category_name}"`,
        });
      }
    }

    //  Product features filter
    if (product_features) {
      let featuresArray = product_features;

      if (typeof featuresArray === "string") {
        try {
          featuresArray = JSON.parse(featuresArray);
        } catch (e) {
          featuresArray = featuresArray.split(",").map((f) => f.trim());
        }
      }

      query.product_features = { $in: featuresArray };
    }

    //  Brand filter
    if (brand) {
      let brandArray = brand;
      if (typeof brandArray === "string") {
        brandArray = brandArray.split(",").map((b) => b.trim());
      }
      query.brand = { $in: brandArray };
    }

    //  Sorting
    let sort = {};
    if (sortBy === "lowToHigh") {
      sort = { sale_price: 1 };
    } else if (sortBy === "highToLow") {
      sort = { sale_price: -1 };
    } else {
      sort = { createdAt: -1 }; // newest first
    }

    //  Pagination setup
    const skip = (parseInt(page) - 1) * parseInt(limit);

    //  Total count for frontend pagination controls
    const totalProducts = await ProductModel.countDocuments(query);

    //  Fetch paginated products
    const products = await ProductModel.find(query)
      .populate("categoryId", "category_name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found" });
    }

    //  Return paginated response
    return res.status(200).json({
      success: true,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      data: products,
    });
  } catch (error) {
    console.error("Filter error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};