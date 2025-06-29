import mongoose, { Schema } from "mongoose";

const lessonSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  {
    timestamps: true,
    collection: "lessons",
  }
);

export default mongoose.model("Lesson", lessonSchema);
