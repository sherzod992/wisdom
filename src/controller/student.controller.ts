import { T } from "../libs/types/common";
import { Request, Response } from "express";
import MemberService from "../models/Member.service";
import { ExtendedRequest, LoginInput ,MemberInput,} from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode } from "../libs/utils/Errors";

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
studentController.logout = (req: ExtendedRequest, res:Response) =>{
    try{
        console.log("logout");
        res.cookie("accessToken", null, {maxAge: 0, httpOnly: true});
        res.status(HttpCode.OK).json({ logout: true })
    } catch(err){
        if( err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard )
    }
  };








export default studentController;