import { NextFunction, Request, Response } from "express";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import MemberService from "../models/Member.service";
import Errors, { HttpCode, Message } from "../libs/utils/Errors";
import { T } from "../libs/types/common";
import LessonService from "../models/Lesson.service";


const lessonController:T={};
const lessonService = new LessonService();
lessonController.showAllLessons = async (req: Request, res: Response) => {
    try {
      const lessons = await lessonService.getAllLessons(); // ✅ () qo‘yildi
      res.status(200).json({ lessons }); // ✅ JSON qaytarish
    } catch (err) {
      console.error('Fetching lessons failed:', err);
      res.status(500).json({ error: 'Failed to fetch lessons' });
    }
  };
  
  lessonController.createLesson = async (req: AdminRequest, res: Response) => {
    try {
      const { title, description, videoUrl } = req.body;
      const teacherId = req.session.member._id.toString();
  
      await lessonService.createLesson({ title, description, videoUrl, teacherId });
      res.status(201).json({ message: "Lesson created" }); // yoki res.redirect agar EJS bo‘lsa
    } catch (err) {
      console.error('Lesson creation failed:', err);
      res.status(500).json({ error: 'Lesson creation failed' });
    }
  };
  
  lessonController.updateLesson = async (req: AdminRequest, res: Response) => {
    try {
      const id = req.params.id;
      const input = req.body;
      const result = await lessonService.updateChosenLesson(id, input);
      res.status(200).json({ lesson: result });
    } catch (err) {
      console.error('Lesson update failed:', err);
      res.status(500).json({ error: 'Lesson update failed' });
    }
  };
  
  export default lessonController;