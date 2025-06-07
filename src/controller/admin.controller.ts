import { Request, Response } from "express";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import MemberService from "../models/Member.service";
import Errors, { Message } from "../libs/utils/Errors";
import { T } from "../libs/types/common";


const adminController:T={}
 adminController.goHome =(req:Request, res:Response)  => {
    try {
      console.log("home");
      res.render("home");  
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

  adminController.postSignup=async (req: AdminRequest, res: Response) => {
    try {
      console.log("processSignup");

      const newMember: MemberInput = req.body;
      newMember.memberType = MemberType.ADMIN;

      const memberService = new MemberService();
      const result = await memberService.postSignup(newMember);
      req.session.member = result
      req.session.save(function(){
        res.send(result)
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
      const memberService = new MemberService();
      const result = await memberService.postLogin(input)
      req.session.member = result
      req.session.save(function(){
        res.send(result)
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

  

export default adminController;
