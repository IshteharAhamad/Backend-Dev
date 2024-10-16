import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    username: {
      type: String,
      index: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      required: [true, "Username is required!"],
      lowercase: true,
    },
    email: {
      type: String,
      index: true,
      trim: true,
      unique: true,
      lowercase: true,
      required: [true, "Email is required!"],
    },
    fullName: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 20,
      required: [true, "FullName is required!"],
    },
    // dateofbirth:{
    //     type:Date,
    // },
    password: {
      type: String,
      trim: true,
      minlength: 5,
      maxlength: 60,
      required: [true, "Password is required!"],
    },
    avatar: {
      type: String, // cloudinary url
      
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    refreshToken: {
      type: String,
    },
    passwordResetToken: {
        type:String
    },
    passwordResetExpires:{
        type:Date,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if password not change then return same password
  this.password = await bcrypt.hash(this.password, 10); /// hashing the password, change password, forgot password
  next();
});
// / creating custom methods
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.createPasswordResetToken=  function(){
    const resetToken = crypto.randomBytes(32).toString("hex");    
    // Corrected typo: "sha256" instead of "sh256"
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
   //// // Set the expiration time to 5 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    // Return the plain reset token
    return resetToken;

    // using bcrypt ///////////////////////////////////////////////////
  //   const resetToken = crypto.randomBytes(32).toString("hex");
  // // Hash the token using bcrypt with a salt
  // const saltRounds = 10;
  // this.passwordResetToken = await bcrypt.hash(resetToken, saltRounds);
  // // Set the expiration time for the reset token
  // this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins
  // // Return the plain reset token (unhashed)
  // return resetToken;
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    }
  );
};
export const User = mongoose.model("User", userSchema);
