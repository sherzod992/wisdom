import { LessonCollection, LessonStatus } from "../enums/lesson.enum";
import { ObjectId } from "mongoose";
import { OrderStatus } from "../enums/order.enum";

export interface Lesson {
    _id: ObjectId;
    lessonStatus: LessonStatus;
    lessonName: string;
    lessonTitle?: string;
    lessonPrice: number;
    lessonDesc?: string;
    lessonVideo: string[];
    lessonImage:string[];
    lessonViews: number;
    lessonCollection: LessonCollection;
    createdAt: Date;
    updatedAt: Date;
}
export interface LessonInquiry {
    order: string;
    page: number;
    limit: number;
    lessonCollection?:LessonCollection
    search?: string;
  }
  export interface LessonInput {
    lessonName: string;
    lessonTitle?: string;
    lessonDesc?: string;
    lessonVideo?: string[]; 
    lessonPrice: number;
    lessonCollection: LessonCollection; 
    lessonStatus?: LessonStatus; 
    lessonImages?: string[]; 
    lessonViews?: number;
}


export interface LessonUpdateInput {
    orderId: string | ObjectId; 
    lessonStatus?: LessonStatus;
    lessonCollection?:LessonCollection
    lessonTitle?: string;
    lessonPrice?: number;
    lessonDesc?: string;
    lessonVideoLinks?: string[];
    lessonViews?: number;
}
