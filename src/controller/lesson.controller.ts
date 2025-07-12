import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { LessonInput } from "../libs/types/lesson";
import { AdminRequest } from "../libs/types/member";
import LessonService from "../models/Lesson.service";

const lessonService = new LessonService();
const lessonController: T = {};

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

    const data: LessonInput = req.body;

    if (!req.files || !Array.isArray(req.files)) {
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
    }

    data.lessonImages = req.files.map((file: any) => file.path.replace(/\\/g, "/"));

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

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(`<script>alert("${message}"); window.location.replace('/admin/lesson/all')</script>`);
  }
};

export default lessonController;
