// see: https://ithelp.ithome.com.tw/articles/10205091
const _ = require('lodash')
const { ApolloServer, gql } = require('apollo-server')

// schema
const typeDefs = gql`
  type Query {
    "Hello World"
    hello: String
    "取得目前使用者"
    me: User
    "取得所有使用者"
    users: [User]
    "透過名字取得使用者"
    user(name: String!): User
    "取得所有貼文"
    posts: [Post]
    "透過id取得貼文"
    post(id: ID!): Post
  }
  """
  使用者
  """
  type User {
    "識別碼"
    id: ID!
    "帳號"
    email: String!
    "名字"
    name: String
    "年齡"
    age: Int
    "朋友"
    friends: [User]
    "貼文"
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
    body: String
    "按讚者"
    likeGivers: [User]
    "建立時間 (ISO 格式)"
    createdAt: String
  }
  input UpdateMyInfoInput {
    name: String
    age: Int
  }
  input AddPostInput {
    title: String!
    body: String
  }
  type Mutation {
    "更新目前使用者資訊"
    updateMyInfo(input: UpdateMyInfoInput!): User
    "新增朋友"
    addFriend(userId: ID!): User
    "新增貼文"
    addPost(input: AddPostInput!): Post
    "對貼文按讚"
    likePost(postId: ID!): Post
  }
`

const users = [
  {
    id: 1,
    email: 'fong@test.com',
    password: '$2b$04$wcwaquqi5ea1Ho0aKwkZ0e51/RUkg6SGxaumo8fxzILDmcrv4OBIO', // 123456
    name: 'Fong',
    age: 23,
    friendIds: [2, 3]
  },
  {
    id: 2,
    email: 'kevin@test.com',
    passwrod: '$2b$04$uy73IdY9HVZrIENuLwZ3k./0azDvlChLyY1ht/73N4YfEZntgChbe', // 123456
    name: 'Kevin',
    age: 40,
    friendIds: [1]
  },
  {
    id: 3,
    email: 'mary@test.com',
    password: '$2b$04$UmERaT7uP4hRqmlheiRHbOwGEhskNw05GHYucU73JRf8LgWaqWpTy', // 123456
    name: 'Mary',
    age: 18,
    friendIds: [1]
  }
]

const posts = [
  {
    id: 1,
    authorId: 1,
    title: 'Hello World',
    body: 'This is my first post',
    likeGiverIds: [1, 2],
    createdAt: '2018-10-22T01:40:14.941Z'
  },
  {
    id: 2,
    authorId: 2,
    title: 'Nice Day',
    body: 'Hello My Friend!',
    likeGiverIds: [1],
    createdAt: '2018-10-24T01:40:14.941Z'
  }
]

const ME_ID = 1

// resolver helpers
const findUserById = id => _.find(users, ['id', _.toInteger(id)])
const findUserByName = name => _.find(users, ['name', name])
const findPostById = id => _.find(posts, ['id', _.toInteger(id)])
const updateUserInfo = (userId, data) => _.assign(findUserById(userId), _.omitBy(data, _.isNil))
const addPost = ({ authorId, title, body }) => {
  posts.push({
    id: posts.length + 1,
    authorId,
    title,
    body,
    likeGiverIds: [],
    createdAt: new Date().toISOString(),
  })
  return _.last(posts)
}
const updatePost = (postId, data) => _.assign(findPostById(postId), _.omitBy(data, _.isNil))

// resolvers
const resolvers = {
  Query: {
    hello: () => 'world',
    me: () => findUserById(ME_ID),
    users: () => users,
    user: (root, { name }, context) => findUserByName(name),
    posts: () => posts,
    post: (root, { id }, context) => findPostById(id),
  },
  User: {
    posts: (parent, args, context) => _.filter(posts, post => post.authorId === parent.id),
    friends: (parent, args, context) => _.filter(users, user => _.includes(parent.friendIds, user.id)),
  },
  Post: {
    author: (parent, args, context) => findUserById(parent.authorId),
    likeGivers: (parent, args, context) => _.filter(users, user => _.includes(parent.likeGiverIds, user.id)),
  },
  Mutation: {
    updateMyInfo: (parent, { input }, context) => updateUserInfo(ME_ID, input),
    addFriend: (parent, { userId }, context) => {
      const me = findUserById(ME_ID)
      const friend = findUserById(userId)
      me.friendIds = _.uniq([...me.friendIds, friend.id])
      friend.friendIds = _.uniq([...friend.friendIds, me.id])
      return me
    },
    addPost: (parent, { input }, context) => addPost({ ...input, authorId: ME_ID }),
    likePost: (parent, { postId }, context) => {
      const post = findPostById(postId)
      if (!post) throw new Error(`Post ${postId} not found`)
      if (_.includes(post.likeGiverIds, ME_ID)) {
        _.remove(post.likeGiverIds, ME_ID)
      } else {
        post.likeGiverIds.push(ME_ID)
      }
      return post
    },
  },
}

// start server
const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`? Server ready at ${url}`)
})

/*
mutation ($updateMeInput: UpdateMyInfoInput!, $addPostInput: AddPostInput!) {
  updateMyInfo (input: $updateMeInput) {
    name
    age
  }
  addPost (input: $addPostInput) {
    id
    title
    body
  }
  likePost (postId: 3) {
    id
    title
    body
    author {
      name
    }
    likeGivers {
      id
      name
      age
    }
  }
}
*/