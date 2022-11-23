// see: https://ithelp.ithome.com.tw/articles/10204294
const _ = require('lodash')
const { ApolloServer, gql } = require('apollo-server')

const users = [
  { id: 1, name: 'Fong', age: 23, height: 175, weight: 70, friendIds: [2,3] },
  { id: 2, name: 'Kelvin', age: 40, height: 185, weight: 90, friendIds: [1] },
  { id: 3, name: 'Mary', age: 18, height: 162, weight: 80, friendIds: [1] },
]

const posts = [
  { id: 1, authorId: 1, title: 'Hello World!', content: 'This is my first post.', likeGiverIds: [2] },
  { id: 2, authorId: 2, title: 'Good Night', content: 'Have a Nice Dream =)', likeGiverIds: [2, 3] },
  { id: 3, authorId: 1, title: 'I love U', content: 'Here\'s my second post!', likeGiverIds: [] },
]

const ME_ID = 1

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
    "使用者發的貼文"
    posts: [Post]
  }
  """
  貼文
  """
  type Post {
    "識別碼"
    id: ID!
    "作者"
    author: User
    "標題"
    title: String
    "內容"
    content: String
    "按讚者"
    likeGivers: [User]
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

  type Mutation {
    "新增貼文"
    addPost(title: String!, content: String!): Post
    "貼文按讚 (收回讚)"
    likePost(postId: ID!): Post
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
  Mutation: {
    addPost: (root, args, context) => {
      const { title, content } = args
      posts.push({
        id: posts.length + 1,
        authorId: ME_ID,
        title,
        content,
        likeGiverIds: [],
      })
      return _.last(posts)
    },
    likePost: (root, args, context) => {
      const { postId } = args
      const post = _.filter(posts, post => post.id === postId)
      if (!post) throw new Error(`Post ${postId} Not Exists`)

      if (_.includes(post.likeGiverIds, ME_ID)) {
        _.remove(post.likeGiverIds, ME_ID)
      } else {
        post.likeGiverIds.push(ME_ID)
      }
      return post
    },
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
    },
    posts: (parent, args, context) => {
      return _.filter(posts, post => post.authorId === parent.id)
    },
  },
  Post: {
    likeGivers: (parent, args, context) => {
      return _.filter(users, user => _.includes(parent.likeGiverIds, user.id))
    },
    author: (parent, args, context) => {
      return _.find(users, ['id', parent.authorId])
    },
  },
}

// start server
const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`)
})

/*
mutation {
  addPost(title: "Mutation Is Awesome", content: "Adding Post is like a piece of cake") {
    id
    title
    author {
      name
    }
  }
}
*/