import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../models/libs/Errors";
import { T } from "../models/libs/types/common";
import { LessonInput, LessonInquiry } from "../models/libs/types/lesson";
import { AdminRequest, ExtendedRequest } from "../models/libs/types/member";
import LessonService from "../models/Lesson.service";
import { LessonCollection } from "../models/libs/enums/lesson.enum";

const lessonService = new LessonService();
const lessonController: T = {};
lessonController.getLessons = async (req: Request, res:Response) => {
  try{
      console.log("getProducts");       
      const {page, limit, order, productCollection, search} = req.query;//So‘rov (query) parametrlarini ajratib olish
      const inquiry: LessonInquiry = {
          order: String(order),
          page: Number(page),
          limit: Number(limit),
      };
      //ProductInquiry tipidagi obyektni yaratish va so‘rovdan olingan parametrlarni shu obyektga joylashtirish.
      if(productCollection) inquiry.lessonCollection = productCollection as LessonCollection;
      // Agar productCollection bo‘lsa, uni ProductCollection turiga kiritib, inquiryga qo‘shish.

      if(search) inquiry.search = String(search);
      // Agar search bo‘lsa, uni stringga aylantirib, inquiryga qo‘shish.

      const result = await lessonService.getLessons(inquiry)
      res.status(HttpCode.OK).json(result)
  } catch(err){
      console.log("ERROR, getProducts", err);
      if( err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard )
      // res.json({})
  }
}
lessonController.getLesson= async (req: ExtendedRequest, res:Response) => {
  try{
      console.log("getProduct");       
      const {id} = req.params;
      console.log(req.member)
      const memberId = req.member?._id ?? null;
      const result = await lessonService.getLesson(memberId, id)

      res.status(HttpCode.OK).json(result)
  } catch(err){
      console.log("ERROR, getProduct", err);
      if( err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard )
  }
}
// SSR - Barcha darslarni admin panelda ko‘rish
lessonController.getAllLessons = async (req: Request, res: Response) => {
  try {
    console.log("getAllLessons");
    const data = await lessonService.getAllLessons();
    res.render("lessons", { lessons: data });
  } catch (err) {
    console.log("ERROR, getAllLessons", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// SSR - Yangi dars yaratish
lessonController.createLesson = async (req: AdminRequest, res: Response) => {
  try {
    console.log("createLesson");
    console.log("req.body", req.body);
    console.log("req.files", req.files);

    if (!req.files || !Array.isArray(req.files)) {
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
    }

    // 폼 데이터를 올바른 타입으로 변환
    const data: LessonInput = {
      lessonName: req.body.lessonName,
      lessonTitle: req.body.lessonTitle || req.body.lessonName,
      lessonDesc: req.body.lessonDesc,
      lessonPrice: Number(req.body.lessonPrice),
      lessonCollection: req.body.lessonCollection,
      lessonStatus: req.body.lessonStatus || "PAUSE",
      lessonVideo: Array.isArray(req.body.lessonVideo) ? req.body.lessonVideo : (req.body.lessonVideo ? [req.body.lessonVideo] : []),
      lessonImages: req.files.map((file: any) => file.path.replace(/\\/g, "/")),
      lessonViews: 0
    };

    console.log("Processed data:", data);

    await lessonService.createLesson(data);

    res.send(
      `<script> alert("Dars yaratildi"); window.location.replace('/admin/lesson/all') </script>`
    );
  } catch (err) {
    console.log("ERROR, createLesson", err);
    const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(`<script> alert("${message}"); window.location.replace('/admin/lesson/all') </script>`);
  }
};

// SSR - Darsni yangilash
lessonController.updateChusenLesson = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenLesson");
    const id = req.params.id;
    const input = req.body;
    const result = await lessonService.updateChusenLesson(id, input);

    res.status(HttpCode.OK).json({ success: true, data: result });
  } catch (err) {
    console.log("ERROR, updateChosenLesson", err);
    if (err instanceof Errors) {
      res.status(err.code).json({ success: false, message: err.message });
    } else {
      res.status(Errors.standard.code).json({ success: false, message: Message.SOMETHING_WENT_WRONG });
    }
  }
};

export default lessonController;
