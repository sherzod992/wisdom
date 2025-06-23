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

routerAdmin.get("/logout", adminController.logout);

routerAdmin.get("/check-me", adminController.checkAuthSession);
routerAdmin.get(
  "/student/all",
  adminController.getAllStudents
);
routerAdmin.get(
  "/teacher/all",
  adminController.getAllTeacher
);
routerAdmin.get(
  "/dashboard",adminController.dashboard
);
// routerAdmin.post(
//   "/product/:id",// method get() 📍 Endpoint (URL) => Admin  sahifasiga kirganda
//   adminController.verifyAdmin,// 🔐 Middleware =>(Authorization) Avval `Restaurant` admin ekanligini tekshiradi 
//   productController.updateChosenProduct//Handler => Ruxsat bo‘lsa, barcha userlarni bazadan olib beradi
// );
routerAdmin.post("/user/edit",adminController.updateChosenUser);
export default routerAdmin;