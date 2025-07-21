import mongoose, { Schema } from "mongoose";
import { LessonCollection, LessonStatus } from "../models/libs/enums/lesson.enum";

const lessonSchema = new Schema(
  {
    lessonName: {
      type: String,
      required: true,
    },
    lessonTitle: { 
      type: String, 
      required: false 
    },
    lessonCollection:{
      type:String,
      enum:LessonCollection,
      default: LessonCollection.IT
    },
    lessonDesc: {
      type: String,
      required: false,
    },
    lessonVideo: { 
      type: [String], 
      default: [] 
    },
    lessonPrice: {
      type: Number,
      default: 0,
      required: true,
    },
    lessonStatus: {
      type: String,
      enum: LessonStatus,
      default: LessonStatus.PAUSE
    },
    lessonImages: {
      type: [String],
      default: [],
    },
    lessonViews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "lessons",
  }
);

export default mongoose.model("Lesson", lessonSchema);
