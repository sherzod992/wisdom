import { Schema, model, Types } from 'mongoose';

const lessonSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  teacher: { type: Types.ObjectId, ref: 'Member', required: true },
}, {
  timestamps: true,
});

export const LessonModel = model('Lesson', lessonSchema);