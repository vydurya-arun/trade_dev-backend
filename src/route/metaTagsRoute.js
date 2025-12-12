import express from "express";
import {
  createMetaTags,
  getAllMetaTags,
  getMetaTagById,
  updateMetaTags,
  deleteMetaTags,
} from "../controller/metaTagsController.js";

const metaRouter = express.Router();

metaRouter.post("/", createMetaTags);
metaRouter.get("/", getAllMetaTags);
metaRouter.get("/:id", getMetaTagById);
metaRouter.put("/:id", updateMetaTags);
metaRouter.delete("/:id", deleteMetaTags);

export default metaRouter;
