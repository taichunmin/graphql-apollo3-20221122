// see: https://ithelp.ithome.com.tw/articles/10203628
const _ = require('lodash')
const { ApolloServer, gql } = require('apollo-server')

const users = [
  { id: 1, name: 'Fong', age: 23, friendIds: [2,3] },
  { id: 2, name: 'Kelvin', age: 40, friendIds: [1] },
  { id: 3, name: 'Mary', age: 18, friendIds: [1] },
]

// schema
const typeDefs = gql`
  """
  使用者資訊
  """
  type User {
    "識別碼"
    id: ID!
    "名字"
    name: String
    "年齡"
    age: Int
    "朋友清單 ([] 代表 array 的意思)"
    friends: [User]
  }

  type Query {
    "A simple tpye for getting started!"
    hello: String
    "取得當下使用者"
    me: User
    "取得所有使用者"
    users: [User]
  }
`

// resolvers
const resolvers = {
  Query: {
    hello: () => 'world',
    me: () => users[0],
    users: () => users,
  },
  User: {
    friends: (parent, args, context) => {
      const { friendIds } = parent
      return _.filter(users, user => _.includes(friendIds, user.id))
    }
  }
}

// start server
const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`)
})