const mongoose = require("mongoose");

// 127.0.0.1 instead of localhost: newer Node versions resolve localhost to
// IPv6 first, which a local MongoDB usually isn't listening on.
const DEFAULT_URI = "mongodb://127.0.0.1:27017/googlebooks";

async function connectDb(uri = process.env.MONGODB_URI || DEFAULT_URI) {
  await mongoose.connect(uri);

  return mongoose.connection;
}

module.exports = { connectDb };
