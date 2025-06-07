import { Request, Response } from "express";
import { LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import MemberService from "../models/Member.service";
import Errors from "../libs/utils/Errors";
import { T } from "../libs/types/common";


const adminController:T={}
 adminController.goHome =(req:Request, res:Response)  => {
    try {
      console.log("Admin Home");
      res.send("<h1>Admin Home</h1>");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  adminController.getLogin=(req: Request, res: Response) => {
    try {
      console.log("Admin getLogin");
      res.send("Admin getLogin");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  adminController.getSignup=(req: Request, res: Response) => {
    try {
      console.log("Admin getSignup");
      res.send("Admin getSignup");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  },

  adminController.postSignup=async (req: Request, res: Response) => {
    try {
      console.log("processSignup");

      const newMember: MemberInput = req.body;
      newMember.memberType = MemberType.ADMIN;

      const memberService = new MemberService();
      const result = await memberService.postSignup(newMember);

      res.status(201).send(result);
    } catch (err:any) {
      console.error("Error, processSignup:", err);
      res.status(err.code || 500).send({ error: err.message || "Something went wrong!" });
    }
  };
  adminController.postLogin = async (req:Request, res: Response)=>{
    try{
      console.log("processLogin");
      const input: LoginInput = req.body;
      const memberService = new MemberService();
      const result = await memberService.postLogin(input)
      res.send(result)
    }catch(err:any){
      console.error("Error, processSignup:", err);
      res.status(err.code || 500).send({ error: err.message || "Something went wrong!" });
    }
  }

  

export default adminController;
