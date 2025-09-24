import express from 'express';
import { addToCart, getCart, removeCartItem, updateCartItem } from '../controller/cartController.js';
import { authMiddleware } from '../middileware/authMiddleware.js';



const cartRouter = express.Router();

cartRouter.post('/add',authMiddleware,addToCart)
cartRouter.get("/get",authMiddleware, getCart);
cartRouter.put("/update",authMiddleware, updateCartItem);
cartRouter.delete("/remove/:itemId",authMiddleware, removeCartItem);


export default cartRouter;