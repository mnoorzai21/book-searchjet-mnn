const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const { createApp } = require("../app");

let mongo;
let httpServer;
let baseUrl;
let clientDist;

async function graphql(query, variables = {}, token) {
  const response = await fetch(`${baseUrl}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  return response.json();
}

const ADD_USER = `
  mutation ($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user { _id username }
    }
  }`;

const LOGIN = `
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password) { token user { username } }
  }`;

const ME = `{ me { username email bookCount savedBooks { bookId title description authors } } }`;

const SAVE_BOOK = `
  mutation ($bookData: BookInput!) {
    saveBook(bookData: $bookData) { bookCount savedBooks { bookId title } }
  }`;

const REMOVE_BOOK = `
  mutation ($bookId: ID!) {
    removeBook(bookId: $bookId) { bookCount }
  }`;

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  // A fake built client, to test that the server serves the React app.
  clientDist = fs.mkdtempSync(path.join(os.tmpdir(), "client-dist-"));
  fs.writeFileSync(path.join(clientDist, "index.html"), "<div id=root></div>");

  const { app } = await createApp({ clientDist });

  await new Promise((resolve) => {
    httpServer = app.listen(0, resolve);
  });

  baseUrl = `http://127.0.0.1:${httpServer.address().port}`;
});

test.after(async () => {
  httpServer?.close();
  await mongoose.disconnect();
  await mongo?.stop();
});

let token;

test("signs up a new user", async () => {
  const { data, errors } = await graphql(ADD_USER, {
    username: "reader",
    email: "Reader@Example.com",
    password: "secret123",
  });

  assert.equal(errors, undefined);
  assert.equal(data.addUser.user.username, "reader");
  assert.ok(data.addUser.token);
  token = data.addUser.token;
});

test("rejects duplicate emails with a clear message", async () => {
  const { errors } = await graphql(ADD_USER, {
    username: "someone-else",
    email: "reader@example.com",
    password: "secret123",
  });

  assert.match(errors[0].message, /email is already registered/);
});

test("rejects short passwords", async () => {
  const { errors } = await graphql(ADD_USER, {
    username: "shorty",
    email: "shorty@example.com",
    password: "123",
  });

  assert.match(errors[0].message, /at least 6 characters/);
});

test("logs in with the right password only", async () => {
  const ok = await graphql(LOGIN, { email: "reader@example.com", password: "secret123" });
  assert.equal(ok.data.login.user.username, "reader");

  const bad = await graphql(LOGIN, { email: "reader@example.com", password: "wrong-pass" });
  assert.equal(bad.errors[0].extensions.code, "UNAUTHENTICATED");
  assert.equal(bad.errors[0].message, "Incorrect email or password.");
});

test("requires login to view saved books", async () => {
  const { errors } = await graphql(ME);

  assert.equal(errors[0].extensions.code, "UNAUTHENTICATED");
});

test("saves books, including ones without a description, without duplicates", async () => {
  const book = { bookId: "abc123", title: "Dune", authors: ["Frank Herbert"] };

  const first = await graphql(SAVE_BOOK, { bookData: book }, token);
  assert.equal(first.errors, undefined);
  assert.equal(first.data.saveBook.bookCount, 1);

  const again = await graphql(SAVE_BOOK, { bookData: book }, token);
  assert.equal(again.data.saveBook.bookCount, 1);

  const { data } = await graphql(ME, {}, token);
  assert.equal(data.me.email, "reader@example.com");
  assert.equal(data.me.savedBooks[0].title, "Dune");
  assert.equal(data.me.savedBooks[0].description, "");
});

test("removes a saved book", async () => {
  const { data } = await graphql(REMOVE_BOOK, { bookId: "abc123" }, token);

  assert.equal(data.removeBook.bookCount, 0);
});

test("ignores invalid tokens", async () => {
  const { errors } = await graphql(ME, {}, "not-a-real-token");

  assert.equal(errors[0].extensions.code, "UNAUTHENTICATED");
});

test("reports health and serves the React app for client routes", async () => {
  const health = await (await fetch(`${baseUrl}/healthz`)).json();
  assert.deepEqual(health, { ok: true, database: true });

  const page = await fetch(`${baseUrl}/saved`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /id=root/);
});
