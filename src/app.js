import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

// configuration
const app=express();
app.use(cors(
    {
      origin:process.env.CORS_ORIGIN,
      credentials:true  
    }
))
app.use(express.json({limit:"70kb"}))
app.use(express.urlencoded(
    {
        limit:"40kb",
        extended:true
    }))
app.use(cookieParser())
//// end
import userRouter from "./routes/user.router.js"
app.use("/api/v1/user", userRouter)

export {app}