import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import MemberService from "../models/Member.service";
import { ExtendedRequest, LoginInput ,MemberInput,} from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/utils/Errors";
import AuthService from "../models/Auth.service";
const memberService = new MemberService();
const memberController:T ={}
const authService = new AuthService(); 
/** STUDENTS API */
memberController.signup=async (req: Request, res: Response) => {
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
memberController.login = async (req:Request, res: Response)=>{
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
memberController.logout = (req: ExtendedRequest, res:Response) =>{
    try{
        console.log("logout");
        res.cookie("accessToken", null, {maxAge: 0, httpOnly: true});
        res.status(HttpCode.OK).json({ logout: true })
    } catch(err){
        if( err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard )
    }
  };
memberController.verifyAuth = async (req: ExtendedRequest, res:Response, next: NextFunction) => {
    try{
       const token = req.cookies["accessToken"];
       if (token) req.member = await authService.checkAuth(token);
       if(!req.member)
         throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
       next();
    
    } catch(err) {
        console.log("ERROR, verifyAuth", err)
            if( err instanceof Errors) res.status(err.code).json(err);
            else res.status(Errors.standard.code).json(Errors.standard )
    }
    
  };
memberController.getMemberdetail = async (req:Request , res: Response)=>{
  try{
    console.log("getMemberdetail");
    const result =  await memberService.getMemberDetail(req.body);
    res.status(HttpCode.OK).json(result);
  }catch(err){
    console.log("Error, getMemberDetail:", err);
    if( err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard )
}
}
memberController.getTopStudents = async (req:Request, res:Response)=>{
  
}





export default memberController;