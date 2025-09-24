import express from "express";
import {
  addToWishlist,
  getAllWishlists,
  getWishlistByUser,
  updateWishlistItem,
  deleteWishlistItem,
  deleteWishlist,
} from "../controller/wishlistController.js";
import { authMiddleware } from "../middileware/authMiddleware.js";


const wishlistRouter = express.Router();

wishlistRouter.post("/", authMiddleware, addToWishlist);
wishlistRouter.get("/", authMiddleware, getAllWishlists); // admin only
wishlistRouter.get("/me", authMiddleware, getWishlistByUser);
wishlistRouter.get("/:userId", authMiddleware, getWishlistByUser); // admin fetch specific user
wishlistRouter.put("/:itemId", authMiddleware, updateWishlistItem);
wishlistRouter.delete("/:itemId", authMiddleware, deleteWishlistItem);
wishlistRouter.delete("/", authMiddleware, deleteWishlist);

export default wishlistRouter;
