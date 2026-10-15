const { Schema } = require("mongoose");

// Subdocument schema for the books in User.savedBooks.
const bookSchema = new Schema(
  {
    authors: [{ type: String }],
    // Many Google Books results have no description, so it's optional.
    description: { type: String, default: "" },
    // Book id from Google Books.
    bookId: { type: String, required: true },
    image: { type: String },
    link: { type: String },
    title: { type: String, required: true },
  },
  { _id: false },
);

module.exports = bookSchema;
