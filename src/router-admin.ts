import express from 'express';
import adminController from './controller/admin.controller';

import makeUploader from './models/libs/utils/uploader';
import lessonController from './controller/lesson.controller';


const routerAdmin = express.Router();

routerAdmin.get("/", adminController.goHome);

routerAdmin 
  .get("/signup", adminController.getSignup)
  .post("/signup", adminController.postSignup);

routerAdmin
  .get("/login",adminController.getLogin)
  .post("/login",adminController.postLogin)

routerAdmin.get("/logout", adminController.logout);

routerAdmin.get("/check-me", adminController.checkAuthSession);
routerAdmin.get(
  "/student/all",
  adminController.getAllStudents
);
routerAdmin.get(
  "/teacher/all",
  adminController.getAllTeacher
);
routerAdmin.get(
  "/dashboard",adminController.dashboard
);

routerAdmin.post("/user/edit",adminController.updateChosenUser);
routerAdmin.get('/student/recent', adminController.getRecentActiveStudents);
routerAdmin.get('/teacher/recent', adminController.getRecentActiveTeacher);

/**Lessons  */

routerAdmin.get(
  "/lesson/all",
  adminController.verifyAdmin,
  lessonController.getAllLessons);
routerAdmin.post(
  "/lesson/create",
  adminController.verifyAdmin,
  makeUploader("lessons").array("lessonImages", 5),
  lessonController.createLesson
);
routerAdmin.post(
  "/lesson/:id",
  adminController.verifyAdmin,
  lessonController.updateChusenLesson
)
export default routerAdmin;