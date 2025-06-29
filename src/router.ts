import express from 'express';
const router = express.Router();
import memberController from "./controller/member.controller";
import lessonController from "./controller/lesson.controller";

/** Students Router */
router.post("/login", memberController.login);
router.post("/signup", memberController.signup);
router.post("/member/logout", memberController.verifyAuth, memberController.logout);
router.get("/student/member/detail",memberController.verifyAuth, memberController.getMemberDetail);
router.post("/member/update", memberController.verifyAuth,
    memberController.updateMember
   );



  
router.get("/member/top-users", memberController.getTopUsers);
// /** Lesson Routes */
router.get('/lesson/all', lessonController.showAllLessons);



/** Teacher Create Lessons */       
router.post('/teacher/lesson/create', lessonController.createLesson);
router.post('/teacher/lesson/update', lessonController.updateLesson);





export default router; 
