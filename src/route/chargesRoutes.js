// routes/chargesRoutes.js
import express from "express";
import { createCharges, deleteCharge, getCharges, updateCharges } from "../controller/chargesController.js";

const chargeRouter = express.Router();


chargeRouter.post("/", createCharges);
chargeRouter.get("/", getCharges);
chargeRouter.put("/", updateCharges);
chargeRouter.delete("/", deleteCharge);

export default chargeRouter;