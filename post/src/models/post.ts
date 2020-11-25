import mongoose from 'mongoose';
import { UserDoc } from './user';
import { Position } from './position';

interface PostAttrs {
  name: string;
  text: string;
  isUrl: boolean;
  taskSolution: string;
  longitude: number;
  latitude: number;
}

interface PostModel extends mongoose.Model<PostDoc> {
  build(attrs: PostAttrs): PostDoc;
  findNearbyPost(user: UserDoc, distance: number): Promise<PostDoc | null>;
}

interface PostDoc extends mongoose.Document {
  name: string;
  task: {
    text: string;
    isUrl: boolean;
    taskSolution: string;
  };
  TaskPosition: {
    type: string;
    coordinates: number[];
  };
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

const postSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    task: {
      text: {
        type: String,
        required: true,
      },
      isUrl: {
        type: Boolean,
        required: true,
      },
      taskSolution: {
        type: String,
        required: true,
      },
    },
    taskPosition: {
      type: pointSchema,
      index: '2dsphere',
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

postSchema.statics.build = (attrs: PostAttrs) => {
  return new Post({
    name: attrs.name,
    task: {
      text: attrs.text,
      isUrl: attrs.isUrl,
      taskSolution: attrs.taskSolution,
    },
    taskPosition: {
      type: 'Point',
      coordinates: [attrs.longitude, attrs.latitude],
    },
  });
};

postSchema.statics.findNearbyPost = async (user: UserDoc, distance: number) => {
  const position = await Position.findOne({ user: user });
  if (!position) throw new Error('position not found');
  const point = { type: 'Point', coordinates: position.location.coordinates };

  const nearbyPosts = Post.findOne({
    taskPosition: {
      $near: {
        $geometry: point,
        $maxDistance: distance,
      },
    },
  });
  return nearbyPosts;
};

const Post = mongoose.model<PostDoc, PostModel>('Post', postSchema);

export { Post };
