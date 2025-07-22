import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Session } from "express-session";
import { Request } from "express";
import LessonModel from "../../../schema/Lesson.model";

// 소셜 로그인 제공자 enum 추가
export enum AuthProvider {
    LOCAL = "LOCAL",
    KAKAO = "KAKAO", 
    NAVER = "NAVER",
    GITHUB = "GITHUB"
}

export interface Member{
    _id: ObjectId;
    memberType: MemberType;
    memberStatus: MemberStatus;
    memberNick: string;
    memberPhone:string; 
    memberPassword?:string;
    memberEmail?: string; // 이메일 필드 추가
    provider?: AuthProvider; // 소셜 로그인 제공자
    providerId?: string; // 소셜 로그인 ID
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
    memberPhone?:string; // 소셜 로그인시 선택적
    memberPassword?:string; // 소셜 로그인시 선택적
    memberEmail?: string; // 이메일 필드 추가
    provider?: AuthProvider; // 소셜 로그인 제공자
    providerId?: string; // 소셜 로그인 ID
    memberAddress?:string;
    memberDesk?:string;
    memberImage?:string;
    memberPoints?:number;
}

export interface LoginInput{
    memberNick?:string;
    memberEmail?: string; // 이메일로도 로그인 가능
    memberPassword:string;
}

// 소셜 로그인용 인터페이스 추가
export interface SocialProfile {
    id: string;
    nickname?: string;
    email?: string;
    profileImage?: string;
    provider: AuthProvider;
}

export interface MemberUpdateInput{
    _id: ObjectId;
    memberStatus?: MemberStatus;
    memberNick?: string;
    memberPhone?:string;
    memberPassword?:string;
    memberEmail?: string;
    memberAddress?:string;
    memberDesk?:string;
    memberImage?:string;
}

export interface ExtendedRequest extends Request {
    member: Member;
    // file: Express.Multer.File;
    // files: Express.Multer.File[];
}

export interface AdminRequest extends Request {
    member: Member;
    session: Session & {member: Member}
    file: Express.Multer.File;
    files: Express.Multer.File[];
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