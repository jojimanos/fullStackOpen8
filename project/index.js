const { ApolloServer } = require('@apollo/server')

const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const cors = require('cors')
const http = require('http')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

//schema imports
const User = require('./schema/user')

//schema queries, mutations and types as well as resolvers 
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

require('dotenv').config()

const { startStandaloneServer } = require('@apollo/server/standalone')

const jwt = require('jsonwebtoken')
const { hostname } = require('os')

const MONGO_URI = process.env.MONGO_URI

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log("There was an error", error.message)
  })

const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const server = new ApolloServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],

  })

  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
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
    })
  )
  const PORT = 4000

  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  }
  )
}


start()