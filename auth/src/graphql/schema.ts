import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID
    userName: String
    password: String
    name: String!
    role: String!
  }

  type Query {
    "Returns all users"
    users: [User]
    "Returns requested user"
    user(userName: String!): User
  }

  input UserInput {
    userName: String!
    password: String!
    name: String!
    role: String!
  }

  type Mutation {
    "Returns the added user"
    addUser(input: UserInput!): User
    "Returns the deleted user"
    deleteUser(userName: String!): User
  }
`;


export { typeDefs };
