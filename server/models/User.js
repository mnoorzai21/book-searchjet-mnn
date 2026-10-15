const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const bookSchema = require("./Book");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    savedBooks: [bookSchema],
  },
  {
    toJSON: { virtuals: true },
  },
);

// Hash the password before saving.
userSchema.pre("save", async function () {
  if (this.isNew || this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.isCorrectPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Number of saved books, returned as `bookCount`.
userSchema.virtual("bookCount").get(function () {
  return this.savedBooks.length;
});

const User = model("User", userSchema);

module.exports = User;
