import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema=new Schema({
    username:{
        type:String,
        index:true,
        unique:true,
        trim:true,
        minlength: 3,
        maxlength: 20,
        required:[true,"Username is required!"],
        lowercase:true,
    },
    email:{
        type:String,
        index:true,
        trim:true,
        unique:true,
        lowercase:true,
        required:[true,"Email is required!"]
    },
    fullName:{
        type:String,
        trim:true,
        minlength: 3,
        maxlength: 20,
        required:[true,"FullName is required!"]
    },
    // dateofbirth:{
    //     type:Date,
    // },
    password:{
        type:String,
        trim:true,
        minlength: 5,
        maxlength: 20,
        required:[true,"Password is required!"]
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },

    refreshToken:{
        type:String,
    }
},
   {
    timestamps:true,
   }
)
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();// if password not change then return same password
    this.password= await bcrypt.hash(this.password,10)/// hashing the password, change password, forgot password 
    next()
})
/// creating custom methods 
userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRE,
        }
    )

}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRE
        }
    )
}
export const User=mongoose.model("User",userSchema)