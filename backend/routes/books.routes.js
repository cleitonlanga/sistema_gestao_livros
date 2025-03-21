import express from "express";
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/books.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/createbook", protectRoute, createBook);
router.get("/getbook", protectRoute, getBooks);
router.put("/updatebook/:id", protectRoute, updateBook);
router.delete("/deletebook/:id", protectRoute, deleteBook);

export default router;
