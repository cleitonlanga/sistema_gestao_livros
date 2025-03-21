import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  loan_date: {
    type: Date,
  },
  return_date: {
    type: Date,
  },
  returned: {
    type: Boolean,
  },
});

const Loan = mongoose.model("Loan", loanSchema);

export default Loan;
