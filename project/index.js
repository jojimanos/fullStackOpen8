const { GraphQLError } = require('graphql')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const Author = require('./schema/author')
const Book = require('./schema/book')
const User = require('./schema/user')

require('dotenv').config()

const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')

const jwt = require('jsonwebtoken')

const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log("There was an error", error.message)
  })

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
    favouriteGenre: String!
  ): User
  login(
    username: String!
  ): Token
}
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      try {
        let result
        if (!args.author && !args.genres) {
          result = Book.find({})
        }
        else if (!args.genres) {

          let author = await Author.findOne({ name: args.author })

          console.log(author)

          let books = Book.find({ author: author._id }).populate('author')
          result = books
        }
        else if (!args.author) {
          let books = Book.find({ genres: args.genres })
          result = books
        }
        else if (args.author && args.genres) {
          
          let author = await Author.findOne({ name: args.author })
          
          let books = Book.find({ author: author._id, genres: args.genres })
          result = books
        }
        return result
      } catch (error) {
        throw new GraphQLError(`Failed to perform the search: ${error.message}`)
      }
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    name: (root) => root.name,
    id: (root) => root.id,
    bookCount: (root) => {
      let count = Book.collection.countDocuments({ author: root._id })
      return count
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      try {
        // Check if the author already exists in the database
        let author = await Author.findOne({ name: args.author });

        // If the author doesn't exist, create a new author
        if (!author) {
          author = new Author({ name: args.author });
          await author.save();
        }

        console.log(author)

        // Create a new book using the provided data and the author's ObjectId
        const book = new Book({
          title: args.title,
          published: args.published,
          genres: args.genres,
          author: author
        });

        await book.save();
        return book;
      } catch (error) {
        throw new GraphQLError(`Failed to add a book: ${error.message}`);
      }
    },
    editAuthor: async (root, args) => {
      try {
        const author = await Author.findOne({ name: args.name })
        author.born = args.setBornTo
        return author.save()
      } catch (error) {
        throw new GraphQLError(`There was an error while ${error.message}`)
      }
    },
    createUser: async (root, args) => {

      try {
      const user = new User({ username: args.username, favouriteGenre: args.favouriteGenre })
      return user.save()
      } catch (error) {
         throw new GraphQLError(`Creating the user failed ${error.message}`, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
