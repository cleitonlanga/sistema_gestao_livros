import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  autor: {
    type: String,
  },
  book_genre: [
    {
      type: String,
    },
  ],
  year_of_publication: {
    type: Number,
  },
  available: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  loan_date: {
    type: Date,
  },
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
