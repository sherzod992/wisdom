import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import MemberService from "../models/Member.service";
import { AdminRequest, ExtendedRequest, LoginInput ,MemberInput,} from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/utils/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";

const memberService = new MemberService();
const memberController:T ={}
const authService = new AuthService(); 
/** STUDENTS API */
memberController.signup=async (req: Request, res: Response) => {
    try {
      console.log("processSignup");
      const input: MemberInput = req.body;

      if (!input.memberNick || !input.memberPhone || !input.memberPassword) {
        return res
          .status(HttpCode.BAD_REQUEST)
          .json({ message: "All fields (nick, phone, password) are required!" });
      }

      const result = await memberService.signup(input);
      const token = await authService.createToken(result);
      res.cookie("accessToken", token, {
        maxAge: AUTH_TIMER * 3600 * 1000,
        httpOnly: false,
      });
  
      res
        .status(HttpCode.CREATED)
        .json({ member: result, accessToken: token });
    } catch (err) {
      console.log(err);
      res.send(err)
    }
  };
memberController.login = async (req:Request, res: Response)=>{
    try{
      console.log("processLogin");
      const input: LoginInput = req.body;

    // === VALIDATSIYA QO‘SHILDI ===
    if (!input.memberNick || !input.memberPassword) {
      return res
        .status(HttpCode.BAD_REQUEST)
        .json({ message: "Username and password are required" });
    }

    const result = await memberService.login(input);
    const token = await authService.createToken(result);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({ member: result, accessToken: token });
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
memberController.getMemberDetail = async (req: AdminRequest, res: Response) => {
  try{
    console.log("getMemberdetail");
    const result =  await memberService.getMemberDetail(req.member);
    res.status(HttpCode.OK).json(result);
} catch(err){
    console.log("Error, getMemberDetail:", err);
    if( err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard )
}
}
memberController.updateMember = async (req: ExtendedRequest, res:Response ) => {
  try{
      console.log("updateMember")
      const input: MemberInput = req.body;
      const result = await memberService.updateMember(req.member, input);

      res.status(HttpCode.OK).json(result) 
  } catch(err){
      console.log("Error, updateMember:", err);
      if( err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard )
  }
}
memberController.getTopUsers = async (req:Request, res: Response) => {
  try{
      console.log("getTopUsers")
      const result = await memberService.getTopUsers();

      res.status(HttpCode.OK).json(result)
  } catch(err){
      console.log("Error, getTopUsers:", err);
      if( err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard )
  }
}
memberController.retrieveAuth = async (req: ExtendedRequest, res:Response, next: NextFunction) => {
  try{
     const token = req.cookies["accessToken"];
     if (token) req.member = await authService.checkAuth(token);
  next();
  } catch(err) {
      console.log("ERROR, retrieveAuth", err);
      next();
  }
  }

export default memberController;