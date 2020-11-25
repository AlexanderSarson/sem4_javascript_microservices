import mongoose from 'mongoose';
import { UserDoc } from './user';

interface PositionAttrs {
  id: string;
  coordinates: number[];
  user: UserDoc;
  isActive: boolean;
}

interface PositionModel extends mongoose.Model<PositionDoc> {
  build(attrs: PositionAttrs): Promise<PositionDoc>;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<PositionDoc | null>;
  updatePosition(
    user: UserDoc,
    id: string,
    coordinates: number[],
    isActive: boolean,
    expiresAt: Date,
    version: number
  ): Promise<PositionDoc>;
}

interface PositionDoc extends mongoose.Document {
  location: {
    type: string;
    coordinates: number[];
  };
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

positionSchema.statics.findByEvent = (event: {
  id: string;
  version: number;
}) => {
  return Position.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

positionSchema.statics.build = (attrs: PositionAttrs) => {
  return Position.findOneAndUpdate(
    { user: attrs.user },
    {
      _id: attrs.id,
      location: {
        type: 'Point',
        coordinates: attrs.coordinates,
      },
      user: attrs.user,
      isActive: attrs.isActive,
    },
    { upsert: true, new: true }
  );
};

positionSchema.statics.updatePosition = (
  user: UserDoc,
  id: string,
  coordinates: number[],
  isActive: boolean,
  expiresAt: Date,
  version: number
) => {
  return Position.findOneAndUpdate(
    { user },
    {
      _id: id,
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
  );
};

const Position = mongoose.model<PositionDoc, PositionModel>(
  'Position',
  positionSchema
);

export { Position };
