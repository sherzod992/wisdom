import { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'completed', 'canceled'],
      default: 'pending',
    },
    orderTotal: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, collection: "orders" }
);
