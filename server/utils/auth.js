const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

const EXPIRATION = "2h";
const DEV_SECRET = "development-only-secret";

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }

  return secret || DEV_SECRET;
}

function authenticationError(message = "You need to be logged in!") {
  return new GraphQLError(message, {
    extensions: { code: "UNAUTHENTICATED", http: { status: 401 } },
  });
}

// Reads "Authorization: Bearer <token>" and returns the user, or null.
function getUserFromRequest(req) {
  const header = req.headers.authorization || "";
  const token = header.split(" ").pop().trim();

  if (!token) {
    return null;
  }

  try {
    const { data } = jwt.verify(token, getSecret(), { maxAge: EXPIRATION });
    return data;
  } catch {
    return null;
  }
}

function signToken({ email, username, _id }) {
  return jwt.sign({ data: { email, username, _id } }, getSecret(), {
    expiresIn: EXPIRATION,
  });
}

module.exports = {
  getSecret,
  getUserFromRequest,
  signToken,
  authenticationError,
};
