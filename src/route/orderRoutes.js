import express from 'express';
import { createOrder, deleteAllOrders, deleteOrderById, getAllOrders} from '../controller/orderController.js';
import { authMiddleware } from '../middileware/authMiddleware.js';


const orderRoute = express.Router();

orderRoute.post('/', createOrder);
orderRoute.get('/',authMiddleware,getAllOrders);
orderRoute.delete('/:id',deleteOrderById);
orderRoute.delete('/',deleteAllOrders);



export default orderRoute;