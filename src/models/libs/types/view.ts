import { ObjectId } from "mongoose";
import { ViewGroup } from "../enums/lesson.enum";

export interface View {
  _id: ObjectId;
  viewGroup: ViewGroup;
  memberId: ObjectId;
  viewRefId: ObjectId;
  createdAt: Date;
  updateAt: Date;
}

export interface ViewInput {  
  memberId: ObjectId;
  viewRefId: ObjectId;
  viewGroup: ViewGroup;
}