import { LessonModel } from "../schema/Lesson.model";
import lessonController from "../controller/lesson.controller";
import { lessonService } from "../libs/types/member";
import Errors from "../libs/utils/Errors";
import { HttpCode, Message } from "../libs/utils/Errors";
import { shapeIntoMongooseObjectId } from "../libs/utils/config";


class LessonService{
    private readonly lessonModel;
    constructor() {
        this.lessonModel = LessonModel;
      }


    public async createLesson(input: {
        title: string;
        description?: string;
        videoUrl: string;
        teacherId: string;
      }): Promise<any> {
        // 🛡️ 1. Tekshiruv
        if (!input.title || !input.videoUrl || !input.teacherId) {
          throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
        }
    
        try {
          // ✅ 2. Saqlash
          const result = await this.lessonModel.create({
            title: input.title,
            description: input.description,
            videoUrl: input.videoUrl,
            teacher: input.teacherId,
          });
    
          return result.toJSON();
        } catch (err) {
          console.error('Lesson create error:', err);
          throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
        }
      }
      public async getAllLessons(): Promise<any[]> {
        try {
          const lessons = await this.lessonModel
            .find()
            .populate('teacher')
            .sort({ createdAt: -1 });
    
          if (!lessons || lessons.length === 0) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
          }
    
          return lessons.map(lesson => lesson.toJSON());
        } catch (err) {
          console.error('Get lessons error:', err);
          throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.UPDATE_FAILED);
        }
    }
}