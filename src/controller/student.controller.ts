import { T } from "../libs/types/common";
import { Request, Response } from "express";
import MemberService from "../models/Member.service";
import { LoginInput ,Member,MemberInput} from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";

const memberService = new MemberService();
const studentController:T ={}

studentController.signup=async (req: Request, res: Response) => {
    try {
      console.log("processSignup");
      const input: MemberInput = req.body;
      const result = await memberService.signup(input);
      res.json({member:result})
    } catch (err) {
      console.log(err);
      res.send(err)
    }
  };
  studentController.login = async (req:Request, res: Response)=>{
    try{
      console.log("processLogin");
      const input: LoginInput = req.body;
      const result = await memberService.postLogin(input)
      res.json({member:result})
    }catch(err){
        console.log(err);
        res.send(err)
    }
  }









export default studentController;