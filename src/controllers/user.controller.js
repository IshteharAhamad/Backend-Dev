import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { UploadFile } from "../utils/fileUploader.js";
import sendMail from "../utils/sentEmail.js";
import crypto from "crypto";
// import bcrypt from "bcrypt"

const options = {
  httpOnly: true,
  secure: true,
};
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false }); // save in database
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Refresh Token!"
    );
  }
};
const RegisterUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validate - not empty
  // check user is already existed
  // avatar validate and upload on cloudinary
  //create user object in database
  //remove password and refresh toke from response
  //check usercreated
  // return response
  // if(fullName.trim()===""){
  //     throw new ApiError(400,"Fullname is required !")
  // }
  const { fullName, email, username, password } = req.body;
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }
  const existeduser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existeduser) {
    throw new ApiError(409, "username or email already exists!");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path//// optional file is failed then
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image file is required");
  }

  const avatar = await UploadFile(avatarLocalPath);
  // console.log(avatar);

  if (!avatar) {
    throw new ApiError(400, "Avatar vnvb file is required");
  }
  const coverImage = await UploadFile(coverImageLocalPath);

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createduser) {
    throw new ApiError(500, " User is not regiseterd!");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createduser, "User registered successfully"));
});
const LoginUser = asyncHandler(async (req, res) => {
  //take data and valid these
  const { username, email, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }
  // if(!email && !username){
  //     throw new ApiError(400,"Username or Email is required!")
  // }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  // optional db call
  const LoggedIn = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: LoggedIn,
          accessToken,
          refreshToken,
        },
        "User Logged In successfully!"
      )
    );
  /////// no need to DB call
  // return res.status(200)
  // .cookie("AccessToken",AccessToken,options)
  // .cookie("RefreshToken",refreshToken,options)
  // .json(
  //     new ApiResponse(200,
  //         {
  //             user:user,
  //             AccessToken,
  //             refreshToken
  //         },
  //         "User Logged In successfully!"
  //     )
  // )
});
const LogoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out successfully"));
});
const ChangePassword = asyncHandler(async (req, res) => {
  const { password, newPassword } = req.body;
  // if(newPassword!==confirmPassword){
  //     throw new ApiError(400,"Password and confirm password is not matched!")
  // }
  const user = await User.findById(req.user?._id);
  const isvalidPassword = await user.isPasswordCorrect(password);
  if (!isvalidPassword) {
    throw new ApiError(400, "Current password is invalid!");
  }
  // user.password = await bcrypt.hash(newPassword, 10)
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully!"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details fetched successfully!"));
});
const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!(fullName || email)) {
    throw new ApiError(400, "All fields are required!");
  }
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing!");
  }
  const coverImage = await UploadFile(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Failed uploading image!");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email: email,
        coverImage: coverImage?.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully!"));
});
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing!");
  }
  const avatar = await UploadFile(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Failed uploadig Avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});
const DeleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Account deleted successfully!"));
});
const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User not found!");
    }
    const resetToken = await user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl =
      await `${req.protocol}://${req.get("host")}/api/v1/user/reset-password/${resetToken}`;
    console.log(resetUrl)

    const message = `Forgot Password? Click on this this link to reset your Password: ${resetUrl}`;
    await sendMail(
      user.email,
      "Your Password reset token. (valid for 5 mins)",
      message
    );
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email sent successfully!"));
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save();

    res.status(500).json({
      status: "error",
      message:
        "There was an error in sending the email. Please Try again later",
    });
  }
});
const resetPassword = asyncHandler(async (req, res) => {
  try {
    const  {password} = req.body;
    if (!password) {
      return res.status(400).send({ message: 'Password is required' });
    }
    
    const token = req.params.token;
    const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
    // console.log("Hashed Token:", hashedToken); // This should log the bcrypt hashed token
    
  const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Token is invalid or has expired.",
      });
    };
    user.password=await bcrypt.hash(password,10);
    user.passwordResetToken = undefined; 
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave:false});
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {}, "Your password has been reset successfully"));
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "There was an error in resetting your password. Please try again later.",
    });
  }
});

export {
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
};
