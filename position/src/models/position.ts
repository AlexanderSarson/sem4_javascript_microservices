import mongoose from 'mongoose';
// import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { UserDoc } from './user';
// import { PositionDeletedPublisher } from '../events/publishers/position-deleted-publisher';
// import { natsWrapper } from '../nats-wrapper';

// interface PositionAttrs {
//   longitude: number;
//   latitude: number;
//   expiresAt: Date;
//   user: UserDoc;
// }

interface NearbyPlayersArgs {
  longitude: number;
  latitude: number;
  distance: number;
  user: UserDoc;
}

interface PositionModel extends mongoose.Model<PositionDoc> {
  // build(attrs: PositionAttrs): PositionDoc;
  findNearbyPlayers(attrs: NearbyPlayersArgs): Promise<PositionDoc[]>;
  // deleteOldPosition(user: UserDoc): Promise<void>;
  updatePosition(
    user: UserDoc,
    coordinates: number[],
    isActive: boolean,
    expiresAt: Date
  ): Promise<PositionDoc>;
}

interface PositionDoc extends mongoose.Document {
  location: {
    type: string;
    coordinates: number[];
  };
  expiresAt: Date;
  user: UserDoc;
  version: number;
  isActive: boolean;
}

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const positionSchema = new mongoose.Schema(
  {
    location: {
      type: pointSchema,
      index: '2dsphere',
      required: true,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
  },

  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

positionSchema.set('versionKey', 'version');

// positionSchema.statics.deleteOldPosition = async (user: UserDoc) => {
//   const oldPosition = await Position.findOne({ user: user });
//   if (oldPosition) {
//     await oldPosition.deleteOne();
//     if (oldPosition.isActive) {
//       new PositionDeletedPublisher(natsWrapper.client).publish({
//         id: oldPosition.id,
//       });
//     }
//   }
// };

// positionSchema.statics.build = (attrs: PositionAttrs) => {
//   return new Position({
//     location: {
//       type: 'Point',
//       coordinates: [attrs.longitude, attrs.latitude],
//     },
//     expiresAt: attrs.expiresAt,
//     user: attrs.user,
//     isActive: true,
//   });
// };

positionSchema.statics.updatePosition = async (
  user: UserDoc,
  coordinates: number[],
  isActive: boolean,
  expiresAt: Date
) => {
  const oldPosition = await Position.findOne({ user: user });
  let version = 0;
  if (oldPosition) {
    version = oldPosition.version + 1;
  }
  const position = await Position.findOneAndUpdate(
    { user },
    {
      location: {
        type: 'Point',
        coordinates,
      },
      user,
      isActive,
      expiresAt,
      version,
    },
    { upsert: true, new: true }
  ).populate('user');
  return position;
};

positionSchema.statics.findNearbyPlayers = (args: NearbyPlayersArgs) => {
  const { longitude, latitude, distance, user } = args;
  const point = { type: 'Point', coordinates: [latitude, longitude] };
  const nearbyPlayers = Position.find({
    $and: [{ user: { $ne: user } }, { isActive: { $eq: true } }],
    location: {
      $near: {
        $geometry: point,
        $maxDistance: distance,
      },
    },
  }).populate('user');
  return nearbyPlayers;
};

const Position = mongoose.model<PositionDoc, PositionModel>(
  'Position',
  positionSchema
);

export { Position };
