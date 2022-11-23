// see: https://ithelp.ithome.com.tw/articles/10203965
const _ = require('lodash')
const { ApolloServer, gql } = require('apollo-server')

const users = [
  { id: 1, name: 'Fong', age: 23, height: 175, weight: 70, friendIds: [2,3] },
  { id: 2, name: 'Kelvin', age: 40, height: 185, weight: 90, friendIds: [1] },
  { id: 3, name: 'Mary', age: 18, height: 162, weight: 80, friendIds: [1] },
]

// schema
const typeDefs = gql`
  """
  高度單位
  """
  enum HeightUnit {
    "公尺"
    METRE
    "公分"
    CENTIMETRE
    "英尺 (1 英尺 = 30.48 公分)"
    FOOT
  }
  """
  重量單位
  """
  enum WeightUnit {
    "公斤"
    KILOGRAM
    "公克"
    GRAM
    "磅 (1 磅 = 0.45359237 公斤)"
    POUND
  }
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
    "身高 (預設為 CENTIMETRE)"
    height(unit: HeightUnit = CENTIMETRE): Float
    "體重 (預設為 KILOGRAM)"
    weight(unit: WeightUnit = KILOGRAM): Float
  }

  type Query {
    "A simple tpye for getting started!"
    hello: String
    "取得當下使用者"
    me: User
    "取得所有使用者"
    users: [User]
    "取得特定 user (name 為必填)"
    user(name: String!): User
  }
`

// resolvers
const resolvers = {
  Query: {
    hello: () => 'world',
    me: () => users[0],
    users: () => users,
    user: (root, args, context) => {
      const { name } = args
      return _.find(users, ['name', name])
    }
  },
  User: {
    friends: (parent, args, context) => {
      const { friendIds } = parent
      return _.filter(users, user => _.includes(friendIds, user.id))
    },
    height: (parent, args) => {
      const { unit } = args
      if (!unit || unit === 'CENTIMETRE') return parent.height
      else if (unit === 'METRE') return parent.height / 100
      else if (unit === 'FOOT') return parent.height / 30.48
      throw new ArgumentError(`Height unit "${unit}" not supported.`)
    },
    weight: (parent, args, context) => {
      const { unit } = args
      if (!unit || unit === 'KILOGRAM') return parent.weight
      else if (unit === 'GRAM') return parent.height * 1000
      else if (unit === 'POUND') return parent.height / 0.45359237
      throw new ArgumentError(`Height unit "${unit}" not supported.`)
    }
  }
}

// start server
const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`)
})