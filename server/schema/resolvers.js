const { GraphQLError } = require("graphql");
const { signToken, authenticationError } = require("../utils/auth");
const { User } = require("../models");

const PRIVATE_FIELDS = "-__v -password";

function requireUser(context) {
  if (!context.user) {
    throw authenticationError();
  }

  return context.user;
}

function badInput(message) {
  return new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
}

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      const user = requireUser(context);

      return User.findById(user._id).select(PRIVATE_FIELDS);
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      if (password.length < 6) {
        throw badInput("Password must be at least 6 characters.");
      }

      try {
        const user = await User.create({ username, email, password });

        return { token: signToken(user), user };
      } catch (error) {
        if (error.code === 11000) {
          const field = Object.keys(error.keyPattern || {})[0] || "account";
          throw badInput(`That ${field} is already registered.`);
        }

        if (error.name === "ValidationError") {
          throw badInput(Object.values(error.errors)[0].message);
        }

        throw error;
      }
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email: email.toLowerCase().trim() });

      // Same message for both cases, so the API doesn't reveal which
      // emails are registered.
      if (!user || !(await user.isCorrectPassword(password))) {
        throw authenticationError("Incorrect email or password.");
      }

      return { token: signToken(user), user };
    },

    saveBook: async (parent, { bookData }, context) => {
      const user = requireUser(context);

      // Only add the book if it isn't already saved.
      await User.updateOne(
        { _id: user._id, "savedBooks.bookId": { $ne: bookData.bookId } },
        { $push: { savedBooks: bookData } },
        { runValidators: true },
      );

      return User.findById(user._id).select(PRIVATE_FIELDS);
    },

    removeBook: async (parent, { bookId }, context) => {
      const user = requireUser(context);

      return User.findByIdAndUpdate(
        user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true },
      ).select(PRIVATE_FIELDS);
    },
  },
};

module.exports = resolvers;
