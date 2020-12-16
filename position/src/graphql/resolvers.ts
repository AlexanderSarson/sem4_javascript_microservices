import { Position } from '../models/position';
import { User } from '../models/user';
import { BadRequestError } from '@alsafullstack/common';
import { PositionUpdatedPublisher } from '../events/publishers/position-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const resolvers = {
  Position: {
    user(position: any) {
      return { __typename: 'User', id: position.user._id };
    },
  },
  Query: {
    position: async (parent: any, args: any) => {
      const position = await Position.findById(args.id).populate('user');
      return position;
    },
    positions: async () => {
      const positions = await Position.find({}).populate('user');
      return positions;
    },
    findNearbyPlayers: async (parent: any, args: any) => {
      const { longitude, latitude, distance, userId } = args;
      const user = await User.findById(userId);
      if (!user) throw new BadRequestError('User not found');

      const nearbyPlayers = await Position.findNearbyPlayers({
        longitude,
        latitude,
        distance,
        user,
      });
      return nearbyPlayers;
    },
  },
  Mutation: {
    addPosition: async (parent: any, args: any) => {
      const { longitude, latitude, userId } = args;
      const user = await User.findById(userId);
      if (!user) throw new BadRequestError('User not found');

      const expiration = new Date();
      expiration.setSeconds(
        expiration.getSeconds() + Number(process.env.EXPIRATION_WINDOW_SECONDS)
      );
      const position = await Position.updatePosition(
        user,
        [latitude, longitude],
        true,
        expiration
      );

      new PositionUpdatedPublisher(natsWrapper.client).publish({
        // @ts-ignore
        id: position.id,
        coordinates: position.location.coordinates,
        // @ts-ignore
        userId: user.id,
        version: position.version,
        expiresAt: position.expiresAt.toISOString(),
        isActive: position.isActive,
      });
      return position;
    },
  },
};

export { resolvers };
