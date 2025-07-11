import express from 'express';
const router = express.Router();
import memberController from "./controller/member.controller";
import lessonController from "./controller/lesson.controller";
import orderController from './controller/order.controller';
// import orderController from './controller/order.controller';

/** Students Router */
router.post("/member/login", memberController.login);
router.post("/member/signup", memberController.signup);
router.post("/member/logout", memberController.verifyAuth, memberController.logout);
router.get("/student/member/detail",memberController.verifyAuth, memberController.getMemberDetail);
router.post("/member/update", memberController.verifyAuth,
    memberController.updateMember
   );

   router.post("/order/create",
    memberController.verifyAuth,
   orderController.createOrder
   );
   
router.get("/order/all",
    memberController.verifyAuth,
    orderController.getMyOrders);
   
router.post("/order/update",
    memberController.verifyAuth,
    orderController.updateOrder  );

  
router.get("/member/top-users", memberController.getTopUsers);
// /** Lesson Routes */
router.get('/lesson/all', lessonController.showAllLessons);
      
      

/** Teacher Create Lessons */       
router.post('/teacher/lesson/create', lessonController.createLesson);
router.post('/teacher/lesson/update', lessonController.updateLesson);





export default router; 
