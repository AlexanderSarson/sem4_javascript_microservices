import { User as UserDB } from '../models/user';
import { BadRequestError } from '@alsafullstack/common';
import { UserCreatedPublisher } from '../events/publishers/user-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const resolvers = {
  Query: {
    users: async () => await UserDB.find({}),
    user: async (parent: any, args: any) => {
      const { userName } = args;
      const user = await UserDB.findOne({ userName });
      if (!user) throw new BadRequestError('User not found');
      return user;
    },
  },
  User: {
    async __resolveReference(object: any) {
      return await UserDB.findById(object.id);
    },
  },
  Mutation: {
    addUser: async (parent: any, args: any) => {
      const { userName, password, name, role } = args.input;
      const existingUser = await UserDB.findOne({
        userName,
      });
  
      if (existingUser) throw new BadRequestError('Username already in use');
      
      const user = UserDB.build({ userName, password, name, role });
      await user.save();
      await new UserCreatedPublisher(natsWrapper.client).publish({
        id: user.id!,
        userName: user.userName!,
        name: user.name!,
      });
      return user;
    },
  },
};

export { resolvers };
