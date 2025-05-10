import express from 'express';
import adminController from './controller/admin.controller';
import e from 'express';
const routerAdmin = express.Router();


routerAdmin.get("/", adminController.goHome);  
routerAdmin.get("/getlogin", adminController.getLogin);  
routerAdmin.get("/getsignup", adminController.getSignup);



export default routerAdmin;