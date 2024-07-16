import { Router } from "express";
import { RegisterUser,LoginUser,LogoutUser} from "../controllers/user.controller.js";
import {upload} from "../middelwares/multer.middelware.js"
import { verifyJWT } from "../middelwares/Auth.middelware.js";
const router=Router()
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    RegisterUser)
router.route("/login").post(LoginUser)
router.route("/logout").post(verifyJWT,LogoutUser)


export default router