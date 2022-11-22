// see: https://ithelp.ithome.com.tw/articles/10202644

const { ApolloServer, gql } = require('apollo-server')

// schema
const typeDefs = gql`
  type Query {
    "A simple tpye for getting started!"
    hello: String
  }
`

// resolvers
const resolvers = {
  Query: {
    hello: () => 'world'
  }
}

// start server
const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`)
})