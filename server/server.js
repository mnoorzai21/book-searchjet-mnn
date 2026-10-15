const path = require("path");

// Load server/.env when it exists (Node 20.12+ has this built in).
try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {
  // No .env file: rely on real environment variables (e.g. on Render).
}

const { connectDb } = require("./config/connection");
const { createApp } = require("./app");
const { getSecret } = require("./utils/auth");

const PORT = process.env.PORT || 3001;

async function start() {
  getSecret(); // Fail fast if JWT_SECRET is missing in production.

  await connectDb();
  const { app } = await createApp();

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
