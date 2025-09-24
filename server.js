import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './src/config/mongodb.js';
import authRouter from './src/route/authRoute.js';
import productRouter from './src/route/productRoute.js';
import orderRoute from './src/route/orderRoutes.js';
import searchRouter from './src/route/searchRoutes.js';
import cartRouter from './src/route/cartRoutes.js';
import chargeRoutes from './src/route/chargesRoutes.js';
import wishlistRoutes from './src/route/wishlistRoutes.js';
import reviewRoutes from './src/route/reviewRoute.js';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 4000;
connectDB();


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
    origin: true, 
    credentials:true
}));

//API ENDpoints

app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);
app.use('/api/search', searchRouter);
app.use('/api/order', orderRoute);
app.use('/api/cart', cartRouter);
app.use('/api/charges', chargeRoutes);
app.use('/api/whishlist', wishlistRoutes);
app.use('/api/review', reviewRoutes);

app.get('/', (req,res) => res.send('welcome to Backend'));

app.listen(port,()=> console.log(`Server start on PORT:${port}`));