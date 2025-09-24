import express from 'express';
import { autoSuggestProduct, filterProducts, searchAllProduct } from '../controller/searchController.js';


const searchRoute = express.Router();


searchRoute.get("/", searchAllProduct);
searchRoute.get("/suggest", autoSuggestProduct);
searchRoute.get("/filter", filterProducts);


export default searchRoute;