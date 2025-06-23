import express from "express"

const router = express.Router();

import studentController from "./controller/member.controller"
import memberController from "./controller/member.controller";
/** Students Router */
router.post("/student/login", studentController.login);
router.post("/student/signup", studentController.signup);
router.post("/member/logout", memberController.verifyAuth, memberController.logout);
router.get("/member/detail",memberController.verifyAuth, memberController.getMemberdetail);



export default router; 