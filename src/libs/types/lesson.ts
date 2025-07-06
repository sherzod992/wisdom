import { LessonStatus, LessonSubject } from "../enums/lesson.enum";
import { ObjectId } from "mongoose";
import { OrderStatus } from "../enums/order.enum";

export interface Lesson {
    _id: ObjectId;
    lessonStatus: LessonStatus;
    lessonSubject: LessonSubject;
    lessonTitle: string;
    lessonPrice: number;
    lessonDesc?: string;
    lessonVideoLinks: string[]; // YouTube yoki Vimeo linklar
    lessonViews: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrderInquiry {
    page: number;
    limit: number;
    orderStatus?: OrderStatus; // 선택적 속성으로 정의
  }

export interface LessonInput {
    lessonStatus?: LessonStatus;
    lessonSubject: LessonSubject;
    lessonTitle: string;
    lessonDesc?: string;
    lessonPrice: number;
    lessonVideoLinks?: string[];
    lessonViews?: number;
}

export interface OrderUpdateInput {
    orderId: string | ObjectId; 
    lessonStatus?: LessonStatus;
    lessonSubject?: LessonSubject;
    lessonTitle?: string;
    lessonPrice?: number;
    lessonDesc?: string;
    lessonVideoLinks?: string[];
    lessonViews?: number;
}
