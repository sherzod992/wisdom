import mongoose, { Schema } from "mongoose";
import { LessonCollection, LessonStatus } from "../libs/enums/lesson.enum";

const lessonSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    lessonCollection:{
      type:String,
      enum:LessonCollection,
      default: LessonCollection.IT
    },
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
