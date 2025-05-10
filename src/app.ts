/** kirish */
import express from 'express';
import path from 'path'; 
import routerAdmin from './router-admin';
import morgan from 'morgan';
import { MORGAN_FORMAT } from './libs/utils/config';


/** 1 ENTRAMCE */
const app = express();

app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(MORGAN_FORMAT))


/** 2 SESSION */



/** 3 VIEVS */
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');

/** 4 ROUTES */
app.use("/admin", routerAdmin);

export default app;  