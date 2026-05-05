const express = require("express");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/book_management";

app.use(express.json());

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  author: {
    type: String,
    required: [true, "Author is required"],
    trim: true,
  },
    price: {
    type: Number,
    required: [true, "Price is required"],
    validate: {
      validator: (value) => value > 0,
      message: "Price must be greater than 0",
    },
  },
  available: {
    type: Boolean,
    default: true,
  },
});

const Book = mongoose.model("Book", bookSchema);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const sendValidationError = (res, error) => {
  res.status(400).json({
    message: "Validation failed",
    errors: Object.values(error.errors).map((err) => err.message),
  });
};

const sendServerError = (res, error) => {
  res.status(500).json({
    message: "Server error",
    error: error.message,
  });
};

app.get("/", (req, res) => {
  res.status(200).json({ message: "Book Management API is running" });
});

app.post("/books", async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendValidationError(res, error);
    }

    sendServerError(res, error);
  }
});

app.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    sendServerError(res, error);
  }
});

app.get("/books/available", async (req, res) => {
  try {
    const books = await Book.find({ available: true });
    res.status(200).json(books);
  } catch (error) {
    sendServerError(res, error);
  }
});

app.get("/books/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    sendServerError(res, error);
  }
});

app.put("/books/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendValidationError(res, error);
    }

    sendServerError(res, error);
  }
});

app.delete("/books/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    sendServerError(res, error);
  }
});

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
    console.log("Please start MongoDB, then run: npm start");
  });





