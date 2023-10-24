const typeDefs = `
type Query {
  bookCount: Int!
  authorCount: Int!
  allBooks(author: String, genres: [String]): [Book!]!
  allAuthors: [Author!]!
  me: User
  }

  type User {
    username: String!
    password: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

type Author {
  name: String!
  id: String!
  born: Int
  bookCount: Int
}

type Book {
  title: String!
  published: Int!
  author: Author!
  id: String!
  genres: [String!]!
}

type Mutation {
  addBook(
    title: String!
    author: String!
    published: Int!
    genres: [String!]!
  ): Book
  editAuthor(
    name: String!
    setBornTo: Int!
  ): Author
  createUser(
    username: String!
    password: String!
    favouriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
}

type Subscription {
  bookAdded: Book!
}    
`

module.exports = typeDefs