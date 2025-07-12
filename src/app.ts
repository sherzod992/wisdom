import cors from "cors"
import express from 'express';
import path, { dirname } from 'path';
import router from './router';
import routerAdmin from "./router-admin"
import morgan from "morgan"
import cookieParser from "cookie-parser";
import { MORGAN_FORMAT } from "./libs/config";


import session from 'express-session';
import ConnectMongoDB from 'connect-mongodb-session';
import { T } from './libs/types/common';

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
    uri: String(process.env.MONGO_URI), // mongo url qabul qilish 
    collection: 'sessions' // collection nomi 
});
/** 1-ENTRACE **/ 
 
const app = express(); 
app.use(express.static(path.join(__dirname, 'public'))); 
app.use("/uploads", express.static("./uploads"))
console.log(__dirname);
console.log("__dirname",__dirname); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(cors({ credentials: true, origin: true}))
app.use(morgan(MORGAN_FORMAT)) // login mexanizimini ishlatish
//

//sessionni yaratish
app.use(session({  // yuqoridagi sessionsni ichiga optionlarni yozamiz
    secret: String(process.env.SESSION_SECRET), // sessionni shifrlash (.env faylidan olib kelamiz)
    cookie: { maxAge: 1000 * 3600 * 3 }, // cookilarni saqlanish vaqtini belgilash
    store: store,  //sessionni saqlash uchun 
    resave: true, // har bir sorovda sessionni yangilash
    saveUninitialized: true, // har bitta foydalanuvchiga sessionni yaratadi 
}));


app.use(function(req, res, next){
    const sessionInterface = req.session as T;
    res.locals.member = sessionInterface.member;
    next(); 
});
/** 3- VIEWS **/ 

app.set("views",path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** 4-ROUTERS **/
app.use("/admin", routerAdmin);
app.use("/", router) // burak SPA: react 



// SSR: EJS
export default app;  