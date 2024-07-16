import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {UploadFile} from "../utils/fileUploader.js"
const options={
    httpOnly:true,
    secure:true
}
const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const AccessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        
        user.refreshToken=refreshToken
        
        await user.save({validateBeforeSave:false})  // save in database
        return {refreshToken,AccessToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Refresh Token!")
    }

}
const RegisterUser=asyncHandler(async(req,res)=>{
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
    const{fullName,email,username,password}=req.body
    if([fullName,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400, "All fields are required!")
    }
    const existeduser= await User.findOne({
        $or:[{username},{email}]
    })
    if(existeduser){
        throw new ApiError(409,"username or email already exists!")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path//// optional file is failed then
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length >0) {
        coverImageLocalPath=req.files.coverImage[0].path
    } 

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await UploadFile(avatarLocalPath)
    const coverImage = await UploadFile(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createduser=await User.findById(user._id).select("-password -refreshToken")
    if(!createduser){
        throw new ApiError(500," User is not regiseterd!")
    }
    return res.status(201).json(
        new ApiResponse(201,createduser,"User registered successfully")
    )
})
const LoginUser=asyncHandler(async(req,res)=>{
    //take data and valid these
    const {username,email,password}=req.body
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }
    // if(!email && !username){
    //     throw new ApiError(400,"Username or Email is required!")
    // }
    const user= await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist!")
    }
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }
    const {AccessToken,refreshToken}= await generateAccessAndRefreshToken(user._id)
    // optional db call
    const LoggedIn= await User.findById(user._id).select("-password -refreshToken")
    return res.status(200)
    .cookie("AccessToken",AccessToken,options)
    .cookie("RefreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            {
                user:LoggedIn,
                AccessToken,
                refreshToken
            },
            "User Logged In successfully!"
        )
    )
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
})
const LogoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    return res
    .status(200)
    .clearCookie("AccessToken",options)
    .clearCookie("RefreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged Out successfully")
    )
})

export {RegisterUser,LoginUser,LogoutUser}