import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
 const verifyJWT=asyncHandler(async(req,res,next)=>{
    // take access token from user side 
    // verify the access token is valid
    // get user details from DB
    //send the user to controller
    try {
        const Token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!Token){
            throw new ApiError(401, "Unauthrized request!")
        }
        const decodedToken=jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
       
        const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"Invalid Access Token!")
        }
        
        req.user=user
        
        next()
    } catch (error) {
       throw new ApiError(401,error?.message || "Invalid Access Token") 
    }
 })
 export {verifyJWT}