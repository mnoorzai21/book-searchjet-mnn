const { GraphQLError } = require("graphql");

const API_URL = "https://www.googleapis.com/books/v1/volumes";
const MAX_RESULTS = 24;
const CACHE_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

const cache = new Map();

function toBook(item) {
  const info = item.volumeInfo || {};

  return {
    bookId: item.id,
    authors: info.authors || [],
    title: info.title || "Untitled",
    description: info.description || "",
    image: info.imageLinks?.thumbnail?.replace("http://", "https://") || "",
    link: info.infoLink || "",
  };
}

function searchUnavailable(message) {
  return new GraphQLError(message, {
    extensions: { code: "SEARCH_UNAVAILABLE" },
  });
}

// Searches Google Books from the server, so an API key (if set) stays
// private and every visitor shares one cache.
async function searchGoogleBooks(
  rawQuery,
  { apiKey = process.env.GOOGLE_BOOKS_API_KEY, fetchImpl = globalThis.fetch } = {},
) {
  const query = rawQuery.trim();
  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_MS) {
    return cached.books;
  }

  const url = new URL(API_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(MAX_RESULTS));

  if (apiKey) {
    url.searchParams.set("key", apiKey);
  }

  let response;

  try {
    response = await fetchImpl(url, { signal: AbortSignal.timeout(10_000) });
  } catch (error) {
    console.error("Google Books request failed:", error.message);
    throw searchUnavailable("Book search is unavailable right now. Please try again.");
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`Google Books returned ${response.status}: ${detail.slice(0, 300)}`);

    throw searchUnavailable(
      response.status === 429 || response.status === 403
        ? "Book search is busy right now. Please try again in a minute."
        : "Book search is unavailable right now. Please try again.",
    );
  }

  const data = await response.json();
  const books = (data.items || []).map(toBook);

  if (cache.size >= MAX_CACHE_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }

  cache.set(cacheKey, { books, timestamp: Date.now() });

  return books;
}

function clearSearchCache() {
  cache.clear();
}

module.exports = { searchGoogleBooks, clearSearchCache, toBook };
