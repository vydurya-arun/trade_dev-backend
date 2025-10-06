import mongoose from "mongoose";
import ProductModel from "../models/productModel.js";
import reviewModel from "../models/reviewModel.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";


// ✅ Get Reviews for a Product
export const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(404).json({ success: false, message: "notfound productId" })
        }
        const reviews = await reviewModel.find({ productId: productId })
            .populate("userId", "username email")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error("Get Reviews Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
};

// ✅ Get AllReviews
export const getAllReviews = async (req, res) => {
    try {

        const reviews = await reviewModel.find()
            .populate("productId", "product_name")
            .sort({ createdAt: -1 });

        const Reviewcount = reviews.length;    

        res.json({ success: true, data: reviews,Reviewcount:Reviewcount });
    } catch (error) {
        console.error("Get Reviews Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
};

export const postReview = async (req, res) => {
  try {
    const { productId, rating, comment, email, name } = req.body;

    // Basic required fields check
    if (!productId || !rating || !email || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing productId, rating, email, or name",
      });
    }

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    // Normalize inputs
    const emailNormalized = String(email).trim().toLowerCase();
    const nameTrimmed = String(name).trim();
    const commentTrimmed = comment ? String(comment).trim() : "";

    // Validate rating
    const ratingNum = Number(rating);
    if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid rating value (1-5)" });
    }

    // Ensure product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Prevent duplicate review by the same email for the same product
    const alreadyReviewed = await reviewModel.findOne({
      productId,
      email: emailNormalized,
    });
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You (this email) have already reviewed this product",
      });
    }

    // Create and save review
    const review = new reviewModel({
      productId,
      rating: ratingNum,
      comment: commentTrimmed,
      email: emailNormalized,
      name: nameTrimmed,
    });

    await review.save();

    // Recompute stats (using aggregation for accuracy & performance)
    const stats = await reviewModel.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$productId",
          numReviews: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    let numReviews = 0;
    let averageRating = 0;
    if (stats.length > 0) {
      numReviews = stats[0].numReviews;
      averageRating = Number(stats[0].avgRating.toFixed(1)); // store as number
    }

    // Update product's rating fields
    await ProductModel.findByIdAndUpdate(
      productId,
      { averageRating, numReviews },
      { new: true }
    );

    return res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("Post Review Error:", error);
    return res.status(500).json({ success: false, message: "Failed to post review" });
  }
};


export const deleteAllReviews = async (req, res) => {
  try {
    const allReviews = await reviewModel.find();

    for (const review of allReviews) {
      if (review.images && review.images.length > 0) {
        for (const img of review.images) {
          await deleteFromCloudinary(img.public_id);
        }
      }
    }

    await reviewModel.deleteMany({});
    // Optional: reset product ratings
    await ProductModel.updateMany({}, { averageRating: 0, numReviews: 0 });

    res.json({ success: true, message: "All reviews deleted successfully" });
  } catch (error) {
    console.error("Delete All Reviews Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete all reviews" });
  }
};


// Update review by user
export const updateReviewByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    const review = await reviewModel.findById(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Update fields
    if (rating) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // Update product rating
    const reviews = await reviewModel.find({ productId: review.productId });
    const numReviews = reviews.length;
    const averageRating =
      numReviews > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews
        : 0;
    await ProductModel.findByIdAndUpdate(review.productId, { averageRating, numReviews });

    res.json({ success: true, review });
  } catch (error) {
    console.error("Update Review Error:", error);
    res.status(500).json({ success: false, message: "Failed to update review" });
  }
};


export const deleteReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await reviewModel.findById(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });


    // Delete the review
    await reviewModel.findByIdAndDelete(id);

    // Update product rating
    const reviews = await reviewModel.find({ productId: review.productId });
    const numReviews = reviews.length;
    const averageRating =
      numReviews > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews
        : 0;

    await ProductModel.findByIdAndUpdate(review.productId, { averageRating, numReviews });

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};