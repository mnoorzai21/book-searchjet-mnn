import { Card } from "react-bootstrap";

// One book in a results grid. `action` is the button shown at the bottom.
function BookCard({ book, action }) {
  return (
    <Card className="h-100 book-card" border="dark">
      {book.image && (
        <Card.Img
          variant="top"
          src={book.image}
          alt={`The cover for ${book.title}`}
          className="book-cover"
        />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title>
          {book.link ? (
            <a href={book.link} target="_blank" rel="noopener noreferrer">
              {book.title}
            </a>
          ) : (
            book.title
          )}
        </Card.Title>
        <p className="small">
          {book.authors?.length ? book.authors.join(", ") : "Unknown author"}
        </p>
        <Card.Text className="book-description">
          {book.description || "No description available."}
        </Card.Text>
        <div className="mt-auto">{action}</div>
      </Card.Body>
    </Card>
  );
}

export default BookCard;
