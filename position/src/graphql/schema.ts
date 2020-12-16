import { gql } from 'apollo-server-express';

const typeDefs = gql`
  extend type User @key(fields: "id") {
    id: ID @external
  }

  type Position @key(fields: "id") {
    id: ID!
    location: Coordinates
    version: Int
    expiresAt: String
    isActive: Boolean
    user: User
  }

  type Coordinates {
    coordinates: [Float]
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
