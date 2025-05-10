import { Request, Response } from "express";
import {T} from "../libs/types/common";


const adminController: T={};

adminController.goHome = (req: Request, res: Response) => {
    try {
        console.log("Admin Home");
        res.send("<h1>Admin Home</h1>");
    }
    catch(err){
        console.log(err)
    }
}
adminController.getLogin = (req: Request, res: Response) => {
    try {
        console.log("Admin getLogin");
        res.send("Admin getLogin");
    }
    catch(err){
        console.log(err)
    }
}
adminController.getSignup = (req: Request, res: Response) => {
    try {
        console.log("Admin getSignup");
        res.send("Admin getSignup ");
    }
    catch(err){
        console.log(err)
    }
}


export default adminController;