import mongoose, { Schema } from "mongoose";
import { LessonStatus } from "../libs/enums/lesson.enum";

const lessonSchema = new Schema(
  {
    lessonTitle: { type: String, required: true },
    lessonDesc: {
      type: String,
    },
    lessonVideo: { type: [String], default: [] },
    lessonPrice: {
      type: Number,
      default: 0,
    },
    lessonStatus: {
      type: String,
      enum: LessonStatus,
      default:LessonStatus.PAUSE
    },
    lessonName: {
      type: String,
      required: false,
    },
    lessonImages: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "lessons",
  }
);

export default mongoose.model("Lesson", lessonSchema);
