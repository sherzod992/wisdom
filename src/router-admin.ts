import express from 'express';
import adminController from './controller/admin.controller';

const routerAdmin = express.Router();

routerAdmin.get("/", adminController.goHome);

routerAdmin 
  .get("/signup", adminController.getSignup)
  .post("/signup", adminController.postSignup);
routerAdmin
  .get("/login",adminController.getLogin)
  .post("/login",adminController.postLogin)
export default routerAdmin;
