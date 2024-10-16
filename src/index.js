// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'
import connectDB from "./database/connection.js"
import { app } from "./app.js";
dotenv.config({
    path:"./.env"
});
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
            console.log(`server is running on port: ${process.env.PORT}`);
        })
       .on('error', (error) => {
            console.error('Server Error:', error);
            process.exit(1);
        });
})
.catch((error)=>{
    console.log("MONGO db connection failed !!! ", err);
})






















/*
DB connection in index file 
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})() */