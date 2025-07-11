import env from "dotenv"; 
env.config(); //env
import mongoose from "mongoose";
import app from "./app"; 
mongoose.connect(process.env.MONGO_URI as string, {}) 
    .then((data) => { 
        console.log("Connected to MongoDB");
        const PORT = process.env.PORT
        app.listen(PORT, function(){
            console.info(`Server is running on port ${PORT}`);
            console.info(`Admin project on http://localhost:${PORT}/admin`);
        });
    })
    .catch((err) => {
        console.error("error or connection MongoDB",err);
    });
  