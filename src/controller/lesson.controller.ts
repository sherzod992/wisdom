import { NextFunction, Request, Response } from "express";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import MemberService from "../models/Member.service";
import Errors, { HttpCode, Message } from "../libs/utils/Errors";
import { T } from "../libs/types/common";
import { lessonService } from "../libs/types/member";

const lessonController:T={};

lessonController.createLesson = async (req: AdminRequest, res: Response) => {
    try {
        const { title, description, videoUrl } = req.body;
        const teacherId = req.session.member._id.toString(); // ObjectId를 string으로 변환
  
        await lessonService.createLesson({ title, description, videoUrl, teacherId });
        res.redirect('/admin/lesson/all');
    } catch (err) {
        console.error('Lesson creation failed:', err);
        res.status(500).send('Server error');
    }
}
lessonController.showAllLessons = async (req: AdminRequest, res: Response) => {
    try {
        const lessons = await lessonService.getAllLessons();
        res.render('admin/allLessons', { lessons, member: req.session.member });
      } catch (err) {
        console.error('Fetching lessons failed:', err);
        res.status(500).send('Server error');
      }
}


export default lessonController;