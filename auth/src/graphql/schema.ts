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
    users: [User]
    user(userName: String!): User
  }

  input UserInput {
    userName: String!
    password: String!
    name: String!
    role: String!
  }

  type Mutation {
    addUser(input: UserInput!): User
  }
`;


export { typeDefs };
