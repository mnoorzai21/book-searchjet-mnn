const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Query {
    me: User
  }
  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
  }
  type Auth {
    token: ID!
    user: User
  }
  type User {
    _id: ID
    username: String
    email: String
    password: String
    savedBooks: [Book]
  }
  type Book {
    _id: ID
    description: String!
    bookId: String!
    title: String!
    authors: [String]
    image: String
    link: String
  }
`;

module.exports = typeDefs;
