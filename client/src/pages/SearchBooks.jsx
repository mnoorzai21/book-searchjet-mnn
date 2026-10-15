import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useMutation } from "@apollo/client";

import BookCard from "../components/BookCard";
import { SAVE_BOOK } from "../utils/mutations";
import { getSavedBookIds, saveBookIds } from "../utils/localStorage";
import Auth from "../utils/auth";

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

function SearchBooks() {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds);

  const [saveBook] = useMutation(SAVE_BOOK);

  // Keep saved book ids in localStorage so the "saved" state survives reloads.
  useEffect(() => {
    saveBookIds(savedBookIds);
  }, [savedBookIds]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const query = searchInput.trim();

    if (!query) {
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=24`,
      );

      if (!response.ok) {
        throw new Error(`Google Books returned ${response.status}`);
      }

      const { items = [] } = await response.json();

      setSearchedBooks(items.map(toBook));
      setLastQuery(query);
      setSearchInput("");
    } catch (error) {
      console.error(error);
      setSearchError("Search failed. Please try again in a moment.");
    } finally {
      setSearching(false);
    }
  };

  const handleSaveBook = async (book) => {
    if (!Auth.loggedIn()) {
      return;
    }

    try {
      await saveBook({ variables: { bookData: book } });
      setSavedBookIds((ids) => [...ids, book.bookId]);
    } catch (error) {
      console.error(error);
      setSearchError(`Couldn't save "${book.title}". Please try again.`);
    }
  };

  const heading = searching
    ? "Searching…"
    : lastQuery
      ? `${searchedBooks.length} results for "${lastQuery}"`
      : "Search for a book to begin";

  return (
    <>
      <div className="hero text-light bg-dark py-5 mb-4">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row className="g-2">
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="search"
                  size="lg"
                  placeholder="Title, author or topic"
                  aria-label="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg" className="w-100" disabled={searching}>
                  {searching ? <Spinner size="sm" animation="border" /> : "Search"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container className="pb-5">
        {searchError && (
          <Alert variant="danger" dismissible onClose={() => setSearchError("")}>
            {searchError}
          </Alert>
        )}

        <h2 className="h4 mb-4">{heading}</h2>

        {!Auth.loggedIn() && searchedBooks.length > 0 && (
          <p className="text-muted">Log in or sign up to save books to your list.</p>
        )}

        <Row xs={1} md={2} lg={3} className="g-4">
          {searchedBooks.map((book) => {
            const isSaved = savedBookIds.includes(book.bookId);

            return (
              <Col key={book.bookId}>
                <BookCard
                  book={book}
                  action={
                    Auth.loggedIn() && (
                      <Button
                        className="w-100"
                        variant={isSaved ? "outline-secondary" : "info"}
                        disabled={isSaved}
                        onClick={() => handleSaveBook(book)}
                      >
                        {isSaved ? "Saved ✓" : "Save this book"}
                      </Button>
                    )
                  }
                />
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
}

export default SearchBooks;
