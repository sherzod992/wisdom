import path from "path";
import multer from "multer";
import { v4 } from "uuid";
import fs from "fs";

function getTargetImageStorage(adress: string) {
    const uploadPath = `./uploads/${adress}`;

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const extension = path.parse(file.originalname).ext;
            const randomName = v4() + extension;
            cb(null, randomName);
        }
    });
}


const makeUploader = (adress: string) => {
    const storage = getTargetImageStorage(adress);
    return multer({ storage: storage });
};

export default makeUploader;


// const product_storage = multer.diskStorage({
//     destination: function (req,file,cb){
//         cb(null,'.uploads/products'); 
//     },
//     filename: function(req,file,cb){
//         console.log(file);
//         const extensions = path.parse(file.originalname).ext;
//         const random_name = v4()+extensions;
//         cb(null,random_name)
//     }
// });

// export const updateProductImage = multer({storage:product_storage});
