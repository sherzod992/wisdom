/** kirish */
import express from 'express';
import path from 'path'; 
import routerAdmin from './router-admin';
import morgan from 'morgan';
import { MORGAN_FORMAT } from './libs/config';
import session from 'express-session';
/** 1 ENTRAMCE */
import ConnectMongoDB from 'connect-mongodb-session';
import { T } from './libs/types/common';
// import router from './router';
const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
    uri: String(process.env.MONGO_URI), 
    collection: 'sessions' 
});


const app = express();

app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(MORGAN_FORMAT))


/** 2 SESSION */
app.use(session({  
    secret: String(process.env.SESSION_SECRET), 
    cookie: { maxAge: 1000 * 3600 * 3 }, 
    store: store,  
    resave: true, 
    saveUninitialized: true, 
}));



/** 3 VIEVS */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/** 4 ROUTES */
app.use("/admin", routerAdmin);
// app.use("/",router)

export default app;  

