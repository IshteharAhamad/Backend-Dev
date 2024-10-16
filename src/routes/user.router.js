import { Router } from "express";
import { upload } from "../middelwares/multer.middelware.js";
import { verifyJWT } from "../middelwares/Auth.middelware.js";
import {
  RegisterUser,
  LoginUser,
  LogoutUser,
  ChangePassword,
  getCurrentUser,
  updateUserDetails,
  updateAvatar,
  DeleteUser,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  RegisterUser
);
router.route("/login").post(LoginUser);
router.route("/logout").post(verifyJWT, LogoutUser);
router.route("/change-password").patch(verifyJWT, ChangePassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/profile-update")
  .patch(verifyJWT, upload.single("coverImage"), updateUserDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/delete-account").post(verifyJWT, DeleteUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").patch(resetPassword);

// router.route("/refresh-token").post(refreshAccessToken)

export default router;
