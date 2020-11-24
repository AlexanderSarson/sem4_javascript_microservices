import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { User, UserDoc } from './user';

interface PositionAttrs {
  longitude: number;
  latitude: number;
  expiresAt: Date;
  user: UserDoc;
}

interface NearbyPlayersArgs {
  longitude: number;
  latitude: number;
  distance: number;
  user: UserDoc;
}

interface PositionModel extends mongoose.Model<PositionDoc> {
  build(attrs: PositionAttrs): PositionDoc;
  findNearbyPlayers(attrs: NearbyPlayersArgs): Promise<PositionDoc[]>;
}

interface PositionDoc extends mongoose.Document {
  location: {
    type: string;
    coordinates: number[];
  };
  expiresAt: Date;
  user: UserDoc;
  version: number;
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
positionSchema.plugin(updateIfCurrentPlugin);

positionSchema.statics.build = (attrs: PositionAttrs) => {
  return new Position({
    location: {
      type: 'Point',
      coordinates: [attrs.longitude, attrs.latitude],
    },
    expiresAt: attrs.expiresAt,
    user: attrs.user,
  });
  // Position.findOneAndUpdate(
  //   { user: attrs.user },
  //   {
  //     location: {
  //       type: 'Point',
  //       coordinates: [attrs.longitude, attrs.latitude],
  //     },
  //     expiresAt: attrs.expiresAt,
  //     user: attrs.user,
  //   },
  //   { upsert: true, new: true }
  // );
};

positionSchema.statics.findNearbyPlayers = (args: NearbyPlayersArgs) => {
  const { longitude, latitude, distance, user } = args;
  const point = { type: 'Point', coordinates: [longitude, latitude] };
  const nearbyPlayers = Position.find({
    user: { $ne: user },
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
