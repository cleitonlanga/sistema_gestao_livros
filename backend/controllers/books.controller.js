import Book from "../models/books.model.js";
import User from "../models/user.model.js";

export const getBooks = async (req, res) => {
  const { autor, book_genre, year_of_publication, available } = req.query;

  try {
    const query = {};

    if (autor) query.autor = new RegExp(autor, "i");
    if (book_genre) query.book_genre = new RegExp(book_genre, "i");
    if (year_of_publication) query.year_of_publication = year_of_publication;
    if (available) query.available = available;

    const projection =
      available === "true"
        ? "title autor book_genre year_of_publication available"
        : "title autor book_genre year_of_publication available userId loan_date";

    const books = await Book.find(query).select(projection);

    if (!books || books.length === 0) throw new Error("No books found");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ "Server Error in getBooks": error.message });
  }
};

export const updateBook = async (req, res) => {
  const { id } = req.params;
  const { autor, title, book_genre, year_of_publication, available } = req.body;
  const isAdmin = req.user.isSuperUser === "true" || req.user.role === "admin";

  try {
    if (!isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    let book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (autor !== undefined) book.autor = autor;
    if (title !== undefined) book.title = title;
    if (book_genre !== undefined) book.book_genre = book_genre;
    if (year_of_publication !== undefined)
      book.year_of_publication = year_of_publication;
    if (available !== undefined) book.available = available;

    res.status(200).json(await book.save());
  } catch (error) {
    res.status(500).json({ "Server Error in updateBook": error.message });
  }
};

export const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.available === false)
      return res.status(400).json({ message: "Book is not available" });

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    await Book.findByIdAndDelete(id).exec();
    res.status(200).json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ "Server Error in deleteBook": error.message });
  }
};

export const createBook = async (req, res) => {
  const {
    autor,
    title,
    book_genre,
    year_of_publication,
    available,
    userId,
    loan_date,
  } = req.body;

  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    const newBook = new Book({
      autor,
      title,
      book_genre,
      year_of_publication,
      available: available || true,
      userId: available ? null : userId,
      loan_date: available ? null : loan_date,
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ "Server Error in createBook": error.message });
  }
};
