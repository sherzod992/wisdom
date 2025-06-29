import { LessonStatus, LessonSubject } from "../enums/lesson.enum";
import { ObjectId } from "mongoose";

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

export interface LessonInquiry {
    order: string;
    page: number;
    limit: number;
    lessonSubject?: LessonSubject;
    search?: string;
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

export interface LessonUpdateInput {
    _id: ObjectId;
    lessonStatus?: LessonStatus;
    lessonSubject?: LessonSubject;
    lessonTitle?: string;
    lessonPrice?: number;
    lessonDesc?: string;
    lessonVideoLinks?: string[];
    lessonViews?: number;
}
