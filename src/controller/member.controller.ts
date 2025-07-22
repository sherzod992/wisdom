import { T } from "../models/libs/types/common";
import { NextFunction, Request, Response } from "express";
import MemberService from "../models/Member.service";
import { AdminRequest, ExtendedRequest, LoginInput ,MemberInput,} from "../models/libs/types/member";
import { MemberType } from "../models/libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../models/libs/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../models/libs/config";

const memberService = new MemberService();
const memberController:T ={}
const authService = new AuthService(); 
/** STUDENTS API */

memberController.getTeacher = async (req:Request, res:Response)=> {
  try{
    console.log("getTeacher");
    const result = await memberService.getTeacher()
    res.status(HttpCode.OK).json(result);

  }catch(err){
    console.log("ERROR, getRestaurant", err);
    if( err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard )
  }
}
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
    if(req.file) input.memberImage = req.file.path.replace(/\\/, "/");
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

// 소셜 로그인 처리 (프론트엔드용)
memberController.socialLogin = (provider: string) => {
  return async (req: Request, res: Response) => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // 환경변수 확인
      const clientIdKey = `${provider.toUpperCase()}_CLIENT_ID`;
      if (!process.env[clientIdKey]) {
        return res.status(400).json({
          error: true,
          message: `${provider} 로그인이 설정되지 않았습니다.`
        });
      }

      // 소셜 로그인 URL로 리다이렉트
      const authUrl = `${baseUrl}/auth/${provider}`;
      res.redirect(authUrl);
      
    } catch (err) {
      console.log(`ERROR, ${provider} login:`, err);
      res.status(500).json({
        error: true,
        message: `${provider} 로그인 중 오류가 발생했습니다.`
      });
    }
  };
};

// 비밀번호 재설정 요청 (프론트엔드용)
memberController.forgotPassword = async (req: Request, res: Response) => {
  try {
    const { memberEmail } = req.body;

    if (!memberEmail) {
      return res.status(400).json({
        error: true,
        message: '이메일을 입력해주세요.'
      });
    }

    // 실제 구현에서는 이메일 발송 로직 추가
    // 현재는 임시 응답
    res.status(200).json({
      error: false,
      message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.'
    });

  } catch (err) {
    console.log("ERROR, forgotPassword:", err);
    res.status(500).json({
      error: true,
      message: '비밀번호 재설정 요청 중 오류가 발생했습니다.'
    });
  }
};

// 비밀번호 재설정 (프론트엔드용)
memberController.resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: true,
        message: '토큰과 새 비밀번호를 입력해주세요.'
      });
    }

    // 실제 구현에서는 토큰 검증 및 비밀번호 업데이트 로직 추가
    res.status(200).json({
      error: false,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (err) {
    console.log("ERROR, resetPassword:", err);
    res.status(500).json({
      error: true,
      message: '비밀번호 재설정 중 오류가 발생했습니다.'
    });
  }
};

export default memberController;