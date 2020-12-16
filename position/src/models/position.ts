// @ts-nocheck
import mongoose from 'mongoose';
import { UserDoc } from './user';

interface NearbyPlayersArgs {
  longitude: number;
  latitude: number;
  distance: number;
  user: UserDoc;
}

interface PositionModel extends mongoose.Model<PositionDoc> {
  findNearbyPlayers(attrs: NearbyPlayersArgs): Promise<PositionDoc[]>;
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
