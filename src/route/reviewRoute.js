import express from "express";
import {  deleteAllReviews, deleteReviewById, getAllReviews, getReviewsByProduct, postReview, updateReviewByUser } from "../controller/reviewController.js";
import { authMiddleware } from "../middileware/authMiddleware.js";
import {  uploadReview } from "../middileware/multer.js";


const reviewRouter = express.Router();


reviewRouter.post("/", authMiddleware,uploadReview, postReview);       
reviewRouter.get("/:productId", getReviewsByProduct);  // Get all reviews for product
reviewRouter.get("/", getAllReviews);  // Get all reviews 
reviewRouter.delete("/",authMiddleware, deleteAllReviews); 
reviewRouter.put("/:id",authMiddleware, updateReviewByUser); 
reviewRouter.delete("/:id",authMiddleware, deleteReviewById); 


export default reviewRouter;