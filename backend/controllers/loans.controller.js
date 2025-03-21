import Loan from "../models/loans.model.js";
import Book from "../models/books.model.js";

import { format, parse, addDays, isBefore, isAfter } from "date-fns";
import { pt } from "date-fns/locale";

export const createLoan = async (req, res) => {
  const { bookId, return_date } = req.body;
  const userId = req.user._id;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    if (!book.available) {
      return res.status(400).json({ message: "Book is not available." });
    }

    const existingLoan = await Loan.findOne({
      userId,
      bookId,
      returned: false,
    });
    if (existingLoan) {
      return res.status(400).json({
        message: "You already borrowed this book and haven't returned it yet.",
      });
    }

    // Check if return date is between today and 14 days from now
    const today = new Date();
    const loan_date = today;
    const maxReturnDate = addDays(loan_date, 14);

    const returnDateObj = parse(return_date, "dd/MM/yyyy", new Date());
    if (
      isBefore(returnDateObj, loan_date) ||
      isAfter(returnDateObj, maxReturnDate)
    ) {
      return res.status(400).json({
        error: "Return date must be between today and 14 days from now.",
      });
    }

    // Create new loan
    const newLoan = new Loan({
      userId,
      bookId,
      loan_date: loan_date,
      return_date: returnDateObj,
      returned: false,
    });

    await newLoan.save();

    book.available = false;
    await book.save();

    res.status(201).json({
      message: "Loan created successfully",
      loan: newLoan,
    });
  } catch (error) {
    res.status(500).json({ "Error in creating Loan": error.message });
  }
};

export const returnLoan = async (req, res) => {
  const { loanId } = req.params;
  const user = req.user._id;
  const userId = user.toString();

  try {
    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    console.log(loan.userId.toString(), userId);
    if (loan.userId.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (loan.returned) {
      return res.status(400).json({ message: "Loan already returned" });
    }
    const book = await Book.findById(loan.bookId);

    if (!book) return res.status(404).json({ message: "Book not found" });

    loan.returned = true;
    (loan.return_date = new Date()), await loan.save();

    book.available = true;
    await book.save();

    res.status(200).json({
      message: "Loan returned successfully",
      loan: {
        loanId: loan._id,
        bookId: book._id,
        title: book.title,
        autor: book.autor,
        return_date: format(loan.return_date, "dd/MM/yyyy", { locale: pt }),
      },
    });
  } catch (error) {
    res.status(500).json({ "Server Error in returnLoan": error.message });
  }
};

export const getLoans = async (req, res) => {
  const userId = req.user._id;

  try {
    if (!userId || userId === "")
      return res.status(400).json({ message: "User ID is required" });

    const loans = await Loan.find({ userId })
      .populate("bookId", "title autor book_genre year_of_publication")
      .sort({ loan_date: -1 });

    if (!loans) return res.status(404).json({ message: "Loans not found" });

    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ "Server Error in getLoans": error.message });
  }
};

export const getLoansAdmin = async (req, res) => {
  const user = req.user._id;
  const userId = user.toString();
  const isAdmin = req.user.role === "admin" || req.user.isSuperUser === "true";

  try {
    if (!isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const loans = await Loan.find({ userId })
      .populate("bookId", "title autor book_genre year_of_publication")
      .populate("userId", "name email")
      .sort({ loan_date: -1 });

    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ "Server Error in getLoansAdmin": error.message });
  }
};
