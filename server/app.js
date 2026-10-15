const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");

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

  app.use(
    "/graphql",
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
