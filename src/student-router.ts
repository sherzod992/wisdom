import express from "express"

const studentRouter = express.Router()

import studentController from "./controller/student.controller"

studentRouter.post("/member/login", studentController.login);
studentRouter.post("/member/signup", studentController.signup);





export default studentRouter; 