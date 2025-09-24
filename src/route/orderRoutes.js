import express from 'express';
import { createOrder, deleteAllOrders, deleteOrderById, getAllOrders} from '../controller/orderController.js';
import { authMiddleware } from '../middileware/authMiddleware.js';


const orderRoute = express.Router();

orderRoute.post('/',authMiddleware, createOrder);
orderRoute.get('/',getAllOrders);
orderRoute.delete('/:id',deleteOrderById);
orderRoute.delete('/',deleteAllOrders);



export default orderRoute;