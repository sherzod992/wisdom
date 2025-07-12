import express from 'express';
import adminController from './controller/admin.controller';

import makeUploader from './libs/utils/uploader';
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
routerAdmin.post(
  "/lesson/create",
  adminController.verifyAdmin,
  makeUploader("products").array("productImages", 5),
  lessonController.createLesson
);
routerAdmin.post("/user/edit",adminController.updateChosenUser);
routerAdmin.get('/student/recent', adminController.getRecentActiveStudents);
routerAdmin.get('/teacher/recent', adminController.getRecentActiveTeacher);
export default routerAdmin;