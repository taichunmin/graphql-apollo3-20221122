// see: https://ithelp.ithome.com.tw/articles/10203333

const { ApolloServer, gql } = require('apollo-server')

const users = [
  { id: 1, name: 'Fong', age: 23 },
  { id: 2, name: 'Kelvin', age: 40 },
  { id: 3, name: 'Mary', age: 18 },
]

// schema
const typeDefs = gql`
  """
  使用者資訊
  """
  type User {
    "識別碼"
    id: ID
    "名字"
    name: String
    "年齡"
    age: Int
  }

  type Query {
    "A simple tpye for getting started!"
    hello: String
    "取得當下使用者"
    me: User
  }
`

// resolvers
const resolvers = {
  Query: {
    hello: () => 'world',
    me: () => users[0],
  }
}

// start server
const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`)
})