// schema/Order.model.ts
import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
  {
    orderTotal: Number,
    orderDelivery: Number,
    orderStatus: {
      type: String,
      enum: ["PAUSE", "PROCESS", "PAID", "CANCELLED"], // yoki OrderStatus
      default: "PAUSE",
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

// ❗ Bu muhim
export default mongoose.model("OrderItem", orderItemSchema);
