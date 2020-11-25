import mongoose from 'mongoose';

interface UserAttrs {
  id: string;
  userName: string;
  name: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
  userName: string;
  name: string;
}

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
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

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User({
    _id: attrs.id,
    userName: attrs.userName,
    name: attrs.name,
  });
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User, UserDoc };
