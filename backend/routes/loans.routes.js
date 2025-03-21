import express from "express";
import {
  createLoan,
  returnLoan,
  getLoans,
  getLoansAdmin,
} from "../controllers/loans.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/createloan", protectRoute, createLoan);
router.put("/returnloan/:loanId", protectRoute, returnLoan);
router.get("/getloans", protectRoute, getLoans);
router.get("/getloansadmin", protectRoute, getLoansAdmin);

export default router;
