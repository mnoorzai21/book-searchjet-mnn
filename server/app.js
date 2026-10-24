const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const cors = require("cors");
const { typeDefs, resolvers } = require("./schema");
const { getUserFromRequest } = require("./utils/auth");

const CLIENT_DIST = path.join(__dirname, "../client/dist");

async function createApp({ clientDist = CLIENT_DIST } = {}) {
  const app = express();

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== "production",
  });

  await apollo.start();

  app.get("/healthz", (req, res) => {
    res.json({ ok: true, database: mongoose.connection.readyState === 1 });
  });

  // Browser origins allowed to call the API from another domain,
  // e.g. the GitHub Pages frontend. Comma-separated in CLIENT_ORIGIN.
  const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    "/graphql",
    cors({ origin: allowedOrigins }),
    express.json(),
    expressMiddleware(apollo, {
      context: async ({ req }) => ({ user: getUserFromRequest(req) }),
    }),
  );

  // Serve the built React app, and send index.html for client-side routes
  // like /saved so refreshing the page works.
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.method !== "GET") {
        return next();
      }

      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  return { app, apollo };
}

module.exports = { createApp };
