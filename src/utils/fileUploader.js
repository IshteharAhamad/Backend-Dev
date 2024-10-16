import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const UploadFile = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    // upload file here
    const image_upload = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File Uploaded on cloudinary: ", image_upload.url);
    fs.unlinkSync(localFilePath);
    return image_upload;
  } catch (error) {
    fs.unlinkSync(localFilePath); //rremove the save the file failedcase
    return null;
  }
};
export { UploadFile };
