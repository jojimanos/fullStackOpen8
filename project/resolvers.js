const { GraphQLError } = require('graphql')
const Author = require('./schema/author')
const Book = require('./schema/book')
const User = require('./schema/user')
const { v1: uuid } = require('uuid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//imports for subscriptions
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      try {
        let result
        if (!args.author && !args.genres) {
          result = Book.find({}).populate('author')
        }
        else if (!args.genres) {

          let author = await Author.findOne({ name: args.author })

          console.log(author)

          let books = Book.find({ author: author._id }).populate('author')
          result = books
        }
        else if (!args.author) {
          let books = Book.find({ genres: args.genres }).populate('author')
          result = books
        }
        else if (args.author && args.genres) {

          let author = await Author.findOne({ name: args.author }).populate('author')

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

        //subscription for addBook mutation
        pubsub.publish('BOOK_ADDED', { bookAdded: book })
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

        let saltRounds = 10

        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(args.password, salt)

        const user = new User({ username: args.username, password: hash, favouriteGenre: args.favouriteGenre })
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

      const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(args.password, user.password)

      if (!(user && passwordCorrect)) {
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
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    },
  },
}

module.exports = resolvers