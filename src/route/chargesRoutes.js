// routes/chargesRoutes.js
import express from "express";
import { createCharges, deleteCharge, getCharges, updateCharges } from "../controller/chargesController.js";
import { authMiddleware } from "../middileware/authMiddleware.js";

const chargeRouter = express.Router();


chargeRouter.post("/",authMiddleware, createCharges);
chargeRouter.get("/",authMiddleware, getCharges);
chargeRouter.get("/public", getCharges);
chargeRouter.put("/",authMiddleware, updateCharges);
chargeRouter.delete("/",authMiddleware, deleteCharge);

export default chargeRouter;