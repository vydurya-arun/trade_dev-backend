import express from "express";
import { getContacts, createContact, deleteContact } from "../controller/contactController.js";
import { authMiddleware } from "../middileware/authMiddleware.js";

const router = express.Router();

// Routes
router.get("/",authMiddleware, getContacts);       // GET all contacts
router.post("/", createContact);    // POST new contact
router.delete("/:id",authMiddleware, deleteContact); // DELETE contact by ID

export default router;
