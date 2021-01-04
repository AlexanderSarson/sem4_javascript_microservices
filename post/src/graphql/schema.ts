import { gql } from 'apollo-server-express';

const typeDefs = gql`
  extend type User @key(fields: "id") {
    id: ID @external
  }

  type Post @key(fields: "id") {
    id: ID
    name: String
    text: String
    isUrl: Boolean
    taskSolution: String
    longitude: Float
    latitude: Float
  }

  type Query {
    position(id: ID!): Position
    positions: [Position]
    findNearbyPlayers(
      latitude: Float!
      longitude: Float!
      distance: Int!
      userId: String!
    ): [Position]
  }
  type Mutation {
    addPosition(latitude: Float!, longitude: Float!, userId: String!): Position
  }
`;

export { typeDefs };
