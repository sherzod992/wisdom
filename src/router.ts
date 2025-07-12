import express from "express";
import makeUploader from "./libs/utils/uploader";

const router = express.Router();
import memberController from "./controller/member.controller";
import orderController from "./controller/order.controller";
import lessonController from "./controller/lesson.controller";



router.get('/member/getTeacher', memberController.getTeacher);
router.post("/member/login", memberController.login);
router.post("/member/signup", memberController.signup);
router.post("/member/logout", memberController.verifyAuth, memberController.logout);
router.get("/member/detail",memberController.verifyAuth, memberController.getMemberDetail);
router.post("/member/update", memberController.verifyAuth,
    makeUploader("members").single("memberImage"),
    memberController.updateMember
   );
router.get("/member/top-users", memberController.getTopUsers);
router.get("/product/all", lessonController.getLessons);
router.get("/product/:id",
    memberController.retrieveAuth,
    lessonController.getLesson);
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
export default router;