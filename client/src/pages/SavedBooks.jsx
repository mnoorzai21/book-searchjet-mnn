import { Alert, Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { useMutation, useQuery } from "@apollo/client";

import BookCard from "../components/BookCard";
import { QUERY_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import { removeBookId } from "../utils/localStorage";
import Auth from "../utils/auth";

function SavedBooks() {
  const loggedIn = Auth.loggedIn();
  const { loading, data, error } = useQuery(QUERY_ME, { skip: !loggedIn });
  const [removeBook] = useMutation(REMOVE_BOOK);

  const user = data?.me;
  const books = user?.savedBooks || [];

  const handleDeleteBook = async (bookId) => {
    try {
      await removeBook({ variables: { bookId } });
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!loggedIn) {
    return (
      <Container className="py-5 text-center">
        <h2 className="h4">Log in to see your saved books.</h2>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" aria-label="Loading" />
      </Container>
    );
  }

  return (
    <>
      <div className="hero text-light bg-dark py-5 mb-4">
        <Container>
          <h1>{user ? `${user.username}'s books` : "Saved books"}</h1>
        </Container>
      </div>

      <Container className="pb-5">
        {error && <Alert variant="danger">Couldn't load your books. Please log in again.</Alert>}

        <h2 className="h4 mb-4">
          {books.length
            ? `${books.length} saved ${books.length === 1 ? "book" : "books"}`
            : "You have no saved books yet."}
        </h2>

        <Row xs={1} md={2} lg={3} className="g-4">
          {books.map((book) => (
            <Col key={book.bookId}>
              <BookCard
                book={book}
                action={
                  <Button
                    className="w-100"
                    variant="danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Remove
                  </Button>
                }
              />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default SavedBooks;
