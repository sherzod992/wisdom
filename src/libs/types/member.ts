import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Session } from "express-session";
import { Request } from "express";
import { LessonModel } from "../../schema/Lesson.model";

export interface Member{
    _id: ObjectId;
    memberType: MemberType;
    memberStatus: MemberStatus;
    memberNick: string;
    memberPhone:string; 
    memberPassword?:string;
    memberAddress?:string;
    memberDesk?:string;
    memberImage?:string;
    memberPoints:number;
    createdAt:Date;
    updatedAt:Date;
}


export interface MemberInput{
    memberType?: MemberType;
    memberStatus?: MemberStatus;
    memberNick: string;
    memberPhone:string;
    memberPassword:string;
    memberAddress?:string;
    memberDesk?:string;
    memberImage?:string;
    memberPoints?:number;

}

export interface LoginInput{
    memberNick:string;
    memberPassword:string;
}

export interface MemberUpdateInput{
    _id: ObjectId;
    memberStatus?: MemberStatus;
    memberNick?: string;
    memberPhone?:string;
    memberPassword?:string;
    memberAddress?:string;
    memberDesk?:string;
    memberImage?:string;

}
export interface ExtendedRequest extends Request {
    member:Member;
    // file: Express.Multer.File;
    // files: Express.Multer.File[];
}



export interface AdminRequest extends Request {
    member:Member;
    session: Session & {member: Member}
    // file: Express.Multer.File;
    // files: Express.Multer.File[];
}





/**Lesson ts */
export const lessonService = {
    async createLesson(data: {
      title: string;
      description?: string;
      videoUrl: string;
      teacherId: string;
    }) {
      return await LessonModel.create({
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        teacher: data.teacherId
      });
    },
  
    async getAllLessons() {
      return await LessonModel.find().populate('teacher');
    }
  };