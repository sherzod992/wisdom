import LessonModel from "../schema/Lesson.model";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {Lesson, LessonInput, LessonInquiry, LessonUpdateInput} from  "../libs/types/lesson";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { T } from "../libs/types/common";
import { LessonStatus } from "../libs/enums/lesson.enum";
import { ObjectId } from "mongoose";

class LessonService{
    private readonly lessonModel;
    constructor(){
        this.lessonModel = LessonModel
    }
    public async getAllLessons(): Promise<Lesson[]>{
        const result = await this.lessonModel.find().exec();
        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
        return result as unknown as Lesson[];
    }
    public async createLesson(input:LessonInput):Promise<Lesson>{
        try{
            console.log("createNewLesson");
            return await this.lessonModel.create(input) as unknown as Lesson
        }catch(err){
            console.error("Error, model:createNewProduct", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED)
        }
    }
    public async updateChusenLesson(id:string,input:LessonUpdateInput):Promise<Lesson>{
        id = shapeIntoMongooseObjectId(id);
        const result = await this.lessonModel.findOneAndUpdate({ _id: id}, input, {new: true}).exec();
        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result.toObject() as Lesson
    }
}

export default LessonService