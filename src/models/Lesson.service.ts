import LessonModel from "../schema/Lesson.model";
import Errors, { HttpCode, Message } from "./libs/Errors";
import {Lesson, LessonInput, LessonInquiry, LessonUpdateInput} from  "./libs/types/lesson";
import { shapeIntoMongooseObjectId } from "./libs/config";
import { T } from "./libs/types/common";
import { LessonStatus, ViewGroup } from "./libs/enums/lesson.enum";
import { ObjectId } from "mongoose";
import { ViewInput } from "./libs/types/view";
import ViewService from "./View.service";

class LessonService{
    private readonly lessonModel;
    viewService: ViewService;
    constructor(){
        this.lessonModel = LessonModel
        this.viewService = new ViewService();
    }
    public async getLessons(inquiry:LessonInquiry):Promise<Lesson[]>{
        const match:T ={lessonStatus:LessonStatus.ACTIVE};
        if(inquiry.lessonCollection)
            match.lessonCollection = inquiry.lessonCollection;
        // productCollection bo‘lsa, matchga qo‘shish."
        if(inquiry.search) {
            match.lessonTitle = {$regex: new RegExp(inquiry.search, "i")}; // i bu flag katta kichik harflar insensitive
        }
        //search bo‘lsa, productNameni regulyar ifoda bilan qidirish (katta kichik harflar farqini e'tiborsiz qoldirish)."
                 const sort: T = inquiry.order === "lessonPrice" // yuqoridan pastga
         ? {[inquiry.order] : 1} // yuqoridan pastga True
         : {[inquiry.order] : -1};// pastdan yuqoriga  False
    
         const result = await this.lessonModel.aggregate([
            {$match: match},
            {$sort: sort},
            {$skip: (inquiry.page * 1 - 1) * inquiry.limit},
            {$limit: inquiry.limit * 1},
         ])
         .exec();

     if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

     return result;
    
    }
    public async getLesson(memberId: ObjectId | null, id: string):Promise<Lesson>{
        const productId = shapeIntoMongooseObjectId(id);
        
        let result  = await this.lessonModel.findOne({
            _id : productId,
            lessonStatus: LessonStatus.ACTIVE  
        })
        .exec();
      
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      
        if(memberId) {
            //Check existence
            const input: ViewInput = {
                memberId: memberId,
                viewRefId: productId,
                viewGroup : ViewGroup.PRODUCT
            };
            const existView = await this.viewService.checkViewExistence(input);
            
            console.log("exist:", !!existView)
            if(!existView) {
                // Insert View
                console.log("planning to insert new view")
                await this.viewService.insertMemberView(input);
      
                // Increase Counts
                result = await this.lessonModel.findByIdAndUpdate(
                    productId,
                    { $inc: { lessonViews: +1 }},
                    { new: true }
                )
            }
      
      
        }
      
        return result as unknown as Lesson;
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
            console.error("Error, model:createLesson", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED)
        }
    }
    public async updateChusenLesson(id:string,input:LessonUpdateInput):Promise<Lesson>{
        id = shapeIntoMongooseObjectId(id);
        const result = await this.lessonModel.findOneAndUpdate({ _id: id}, input, {new: true}).exec();
        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result.toObject() as Lesson
    }

    public async getLessonData():Promise<any>{
        const activeLessons = await this.lessonModel.countDocuments({lessonStatus: LessonStatus.ACTIVE})
        const pauseLessons= await this.lessonModel.countDocuments({lessonStatus:LessonStatus.PAUSE})
        const deleteLessons= await this.lessonModel.countDocuments({lessonStatus:LessonStatus.DELETE})
        return {
            activeLessons,
            pauseLessons,
            deleteLessons,
        }
    }
}

export default LessonService