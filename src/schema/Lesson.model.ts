import mongoose, { Schema } from "mongoose";
import { LessonStatus } from "../libs/enums/lesson.enum";

const lessonSchema = new Schema(
  {
    lessonTitle: {
      type: String,
      required: true,
    },
    lessonDesc: {
      type: String,
    },
    lessonVideo: {
      type: String,
      required: true,
    },
    lessonPrice: {
      type: Number,
      default: 0,
    },
    lessonStatus: {
      type: String,
      enum: LessonStatus,
      default:LessonStatus.PAUSE
    },
    lesssonName:{
      type: String,
      required: true,
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
