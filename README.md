# Book Search: Search Google Books and Save a Reading List

[![CI](https://github.com/mnoorzai21/book-searchjet-mnn/actions/workflows/ci.yml/badge.svg)](https://github.com/mnoorzai21/book-searchjet-mnn/actions/workflows/ci.yml)

A full-stack MERN app for searching the Google Books catalog and keeping a personal reading list. Users sign up, search for any title, author or topic, save books to their account, and remove them later.

**Live demo:** https://mnoorzai21.github.io/book-searchjet-mnn/ (the API runs on Render's free tier, so the first search after a break can take about a minute)

![Book Search screenshot](./client/src/images/book-search.jpg)

## Features

- Search millions of books through the Google Books API, via a cached server-side GraphQL query
- Sign up and log in with JWT authentication and bcrypt-hashed passwords
- Save books to your account and manage your list on the **My Books** page
- GraphQL API built with Apollo Server, with clear errors for duplicate accounts and wrong passwords
- Responsive Bootstrap layout

## Tech Stack

- **Frontend:** React 19, Vite, Apollo Client, React Router, React Bootstrap
- **Backend:** Node.js, Express 5, Apollo Server 5 (GraphQL), Mongoose 8
- **Database:** MongoDB (MongoDB Atlas in production)
- **Testing & CI:** Node's test runner, mongodb-memory-server, GitHub Actions
- **Hosting:** GitHub Pages (frontend, deployed with GitHub Actions), Render (API, free plan), and MongoDB Atlas (database, free M0 cluster)

## How It Works

```
GitHub Pages (React + Vite) ──GraphQL + JWT──▶ Render (Express + Apollo Server) ──▶ MongoDB Atlas
                                                         │
                                                         └──▶ Google Books API (cached searches)
```

- **Split deployment:** the React app is a static site on GitHub Pages, and the GraphQL API runs on Render. The server only accepts cross-origin requests from origins listed in `CLIENT_ORIGIN` (CORS), and the login token is sent in the `Authorization` header.
- **Server-side search:** book searches go through the server, which keeps the Google API key private and caches results for 10 minutes.
- **Configurable build:** the client reads its API URL (`VITE_GRAPHQL_URL`) and base path (`BASE_PATH`) at build time. Without them, it falls back to `/graphql` and `/`, so local development and the Render-hosted copy of the app work unchanged.

## Getting Started

### Prerequisites

- Node.js 20.12 or newer
- MongoDB running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Install

```bash
git clone https://github.com/mnoorzai21/book-searchjet-mnn.git
cd book-searchjet-mnn
npm run install:all
```

### Configure

```bash
cp server/.env.example server/.env
```

Set `MONGODB_URI` (local MongoDB or your Atlas connection string) and `JWT_SECRET` (any long random string). Optionally set `GOOGLE_BOOKS_API_KEY` (see Deployment).

### Run

In two terminals:

```bash
npm run dev:server   # API on http://localhost:3001/graphql
npm run dev:client   # app on http://localhost:3000
```

In development, Vite proxies `/graphql` to the API server, so no CORS setup is needed locally.

### Test

```bash
npm test
```

The tests start a real in-memory MongoDB and cover sign-up, login, duplicate accounts, saving and removing books, authentication and serving the React app.

## Deployment

1. **Database:** create a free **M0** cluster on MongoDB Atlas, add a database user, allow network access from `0.0.0.0/0`, and copy the connection string.
2. **API:** on [Render](https://render.com), choose **New > Blueprint**, select this repository, and paste the connection string as `MONGODB_URI`. The included `render.yaml` sets up everything else, including a generated `JWT_SECRET`.
3. **CORS:** in Render, add `CLIENT_ORIGIN=https://<your-username>.github.io` (the origin only, with no path). Separate several origins with commas.
4. **Search (recommended):** create a free Google Books API key (Google Cloud Console > APIs & Services > enable **Books API** > Credentials > **Create API key**) and add it in Render as `GOOGLE_BOOKS_API_KEY`. Without a key, searches share Google's anonymous limit and may fail with a "busy" message.
5. **Frontend:** in the GitHub repo, go to **Settings > Pages** and set **Source** to **GitHub Actions**. The workflow in `.github/workflows/pages.yml` builds and deploys the client on every push to `main`. If you fork this repo, update `BASE_PATH` and `VITE_GRAPHQL_URL` in that file.

Render's free plan sleeps after 15 minutes without traffic. The page itself loads instantly from GitHub Pages; only the first API request after a break waits for the server to wake up.

## What I Learned

- **CORS in a split deployment:** moving the frontend to another domain meant allowing only my own origin on the API (least privilege) instead of opening it to every site.
- **Base paths on GitHub Pages:** the app lives under `/book-searchjet-mnn/`, so asset paths, React Router, and redirects all had to respect the base path. Testing the live site revealed a hard-coded `"/"` redirect after login that only broke under the new path.
- **Testing without external services:** the server tests use an in-memory MongoDB and a fake Google Books API, so CI runs quickly and reliably on every pull request.

## Author

**Mohammad Nabi Noorzai**

- GitHub: [mnoorzai21](https://github.com/mnoorzai21)
- LinkedIn: [mnoorzai21](https://www.linkedin.com/in/mnoorzai21)
- Portfolio: [mnoorzai.vercel.app](https://mnoorzai.vercel.app)
- Email: [mnoorzai21@gmail.com](mailto:mnoorzai21@gmail.com)