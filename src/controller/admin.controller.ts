import { NextFunction, Request, Response } from "express";
import { AdminRequest, LoginInput, MemberInput } from "../models/libs/types/member";
import { MemberType } from "../models/libs/enums/member.enum";
import MemberService from "../models/Member.service";
import Errors,{HttpCode,Message} from "../models/libs/Errors";
import { T } from "../models/libs/types/common";
import LessonService from "../models/Lesson.service";



const adminController:T={};
const memberService = new MemberService();
const lessonService = new LessonService();
adminController.goHome = async (req: AdminRequest, res: Response) => {
  try {
    console.log("home");
    const member = req.session.member || null;
    const stats = await memberService.getDashboardStats();
    const lessonstats = await lessonService.getLessonData();
    res.render("home",{ member, ...stats, ...lessonstats });   
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


  adminController.getLogin=(req: Request, res: Response) => {
    try {
      console.log("Admin getLogin");
      res.render("login")
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }

  adminController.getSignup=(req: Request, res: Response) => {
    try {
      console.log("Admin getSignup");
      res.render("signup")
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }

  adminController.postSignup=async (req: AdminRequest, res: Response) => {
    try {
      console.log("processSignup");

      const newMember: MemberInput = req.body;
      newMember.memberType = MemberType.ADMIN;
      const result = await memberService.postSignup(newMember);
      req.session.member = result
      req.session.save(function(){
        res.redirect("/admin")
      })
    } catch (err:any) {
      console.error("Error, processSignup:", err);
      res.status(err.code || 500).send({ error: err.message || "Something went wrong!" });
    }
  };
  adminController.postLogin = async (req:AdminRequest, res: Response)=>{
    try{
      console.log("processLogin");
      const input: LoginInput = req.body;
      const result = await memberService.postLogin(input)
      req.session.member = result
      req.session.save(function(){
        res.redirect("/admin")
      })
    }catch(err:any){
      console.error("Error, processSignup:", err);
      res.status(err.code || 500).send({ error: err.message || "Something went wrong!" });
    }
  }
  adminController.checkAuthSession = (req: AdminRequest, res: Response) => {
    try {
        console.log("checkAuthSession");
        if (req.session?.member) {
            res.send(`<script>alert("${req.session.member.memberNick}")</script>`);
        } else {
            res.send(`<script>alert("${Message.NOT_AUTHENTICATED}")</script>`);
        }
    } catch (err) {
        console.log("Error, checkAuthSession", err);
        res.send(err);
    }
};

adminController.getAllStudents = async (req:AdminRequest, res: Response)=>{
  try {
    console.log("getUsers");
    const result = await memberService.getAllStudents();
    console.log("result", result);
    res.render("students", {students: result,
      member: req.session.member, });
  } catch (err) {
    console.log("ERROR, getUsers", err);
  }
}
adminController.getAllTeacher = async(req:AdminRequest, res: Response)=>{
  try {
    console.log("getAllTeacher");
    const teacher = await memberService.getAllTeacher();
    console.log("result", teacher);
    res.render("teachers", { teachers: teacher, member: req.session.member });
  } catch (err) {
    console.log("ERROR, getUsers", err);
  }
}
adminController.updateChosenUser = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenUser");
    const result = await memberService.updateChosenUser(req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenUser", err);
    if (err instanceof Errors)
      res.status(err.code).json(err);
    else
      res.status(Errors.standard.code).json(Errors.standard);
  }
};

adminController.verifyAdmin = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.session?.member?.memberType === MemberType.ADMIN) {
      req.member = req.session.member;
      next();
  } else {
      const message = Message.NOT_AUTHENTICATED;
      res.send(`<script>alert("${message}"); window.location.replace('admin/login')</script>`);
  }
};
adminController.logout = (req: AdminRequest, res: Response) => {
  try {
      console.log("logout");
      req.session.destroy((err) => {
          res.redirect("/admin");
      });
  } catch (err) {
      console.log("Error, logout", err);
      res.redirect("/admin");
  }
};
/** Yangi qisimlar **/

adminController.dashboard = async (req:Request, res:Response)=>{
  try {
    const stats = await memberService.getDashboardStats();
    res.render("dashboard", stats);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Dashboard yuklanmadi");
  }
}
adminController.getRecentActiveStudents = async(req:AdminRequest, res:Response)=>{
  try {
    const students = await memberService.getRecentActiveStudents(); 
    console.log("Recent active students:", students);
    res.render("newStudents", {students: students,
      member: req.session.member, });
  } catch (err) {
    console.log("ERROR, getUsers", err);
  }
}
adminController.getRecentActiveTeacher = async(req:AdminRequest, res:Response)=>{
  try {
    const teacher = await memberService.getRecentActiveTeacher(); 
    console.log("Recent active students:", teacher);
    res.render("newTeacher", {teachers: teacher,
      member: req.session.member, });
  } catch (err) {
    console.log("ERROR, getUsers", err);
  }
}

export default adminController;
