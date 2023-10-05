const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const Author = require('./schema/author')
const Book = require('./schema/book')

require('dotenv').config()

const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')

const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log("There was an error", error.message)
  })

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: { name: 'Robert Martin', id: "afa5b6f1-344d-11e9-a414-719c6709cf3e", born: 1952 },
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: { name: 'Martin Fowler', born: 1963 },
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: { name: 'Joshua Kerievsky' },
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const bookCount = (name, books) => {
  let booksArray = books

  let newArray = booksArray.filter(b => b.author === name)

  let count = newArray.length

  return count
}

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
type Query {
  bookCount: Int!
  authorCount: Int!
  allBooks(author: String, genres: String): [Book!]!
  allAuthors: [Author!]!
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
}
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let result
      if (!args.author && !args.genres) {
        result = Book.find({})
      }
      else if (!args.genres) {
        let books = Book.find({ author: args.author })
        result = books
        // result = books.filter(b => b.author === args.author)
      }
      else if (!args.author) {
        let books = Book.find({ genres: args.genres })
        result = books
        // result = books.filter(b => b.genres.includes(args.genres))
      }
      else if (args.author && args.genres) {
        let books = Book.find({ author: args.author, genres: args.genres })
        result = books
        // let authorArray = books.filter(b => b.author === args.author)
        // result = authorArray.filter(b => b.genres.includes(args.genres))
      }
      return result
    },
    allAuthors: async () => Author.find({}),
  },
  Author: {
    name: (root) => root.name,
    id: (root) => root.id,
    bookCount: (root) => { return books.filter(b => b.author == root.name).length }
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

        // Create a new book using the provided data and the author's ObjectId
        const book = new Book({
          title: args.title,
          published: args.published,
          genres: args.genres,
          author: author._id, // Use the ObjectId of the author
        });

        await book.save();
        return book;
      } catch (error) {
        throw new Error(`Failed to add a book: ${error.message}`);
      }
    },
    editAuthor: async (root, args) => {

      const author = await Author({ name: args.name })

      author.born = args.setBornTo
      return author.save()
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
