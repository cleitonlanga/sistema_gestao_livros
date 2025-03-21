// Initialize express and connect to MongoDB
import express from "express";
import connectMongoDB from "../database/connectMongoDB.js";
import dotenv from "dotenv";

//Routes
import booksRoutes from "./routes/books.routes.js";
import usersRoutes from "./routes/users.routes.js";
import loansRoutes from "./routes/loans.routes.js";
//Cookie parser
import cookieParser from "cookie-parser";

dotenv.config();

console.log(process.env.MONGO_URI);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello from Express");
});

app.use("/api/users", usersRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/loans", loansRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
  connectMongoDB();
});
