import { gql } from "@apollo/client";

export const QUERY_ME = gql`
  {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        image
        description
        title
        link
      }
    }
  }
`;

export const SEARCH_BOOKS = gql`
  query searchBooks($query: String!) {
    searchBooks(query: $query) {
      bookId
      authors
      title
      description
      image
      link
    }
  }
`;
