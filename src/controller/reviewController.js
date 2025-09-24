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
            .populate("userId", "username email")
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
    const { productId, rating, comment } = req.body;
    const userId = req?.user?.id;

    if (!productId || !rating || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing productId, userId, or rating",
      });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: "Invalid rating value" });
    }

    const alreadyReviewed = await reviewModel.findOne({ productId, userId });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "Product already reviewed" });
    }

    // If images exist, upload to Cloudinary
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const cloudResult = await uploadToCloudinary(file.buffer, "review_images");
          return {
            url: cloudResult.secure_url || cloudResult.url,
            public_id: cloudResult.public_id,
          };
        })
      );
    }

    // create review
    const review = new reviewModel({
      productId,
      userId,
      rating: ratingNum,
      comment: comment || "",
      images: uploadedImages, // empty array if no images
    });

    await review.save();

    // update product rating
    const reviews = await reviewModel.find({ productId });
    const numReviews = reviews.length;
    const averageRating =
      numReviews > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews
        : 0;

    await ProductModel.findByIdAndUpdate(productId, { averageRating, numReviews });

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("Post Review Error:", error);
    res.status(500).json({ success: false, message: "Failed to post review" });
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
    const userId = req.user?.id;

    const review = await reviewModel.findById(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    // Check if user is owner (or admin)
    if (review.userId.toString() !== userId /* && !req.user.isAdmin */) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Delete images from Cloudinary
    if (review.images && review.images.length > 0) {
      for (const img of review.images) {
        await deleteFromCloudinary(img.public_id);
      }
    }

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