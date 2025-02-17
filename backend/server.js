import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app  =  express();

const PORT = process.env.PORT || 5001

app.use(express.json()
);  //allows to parse the body of request

app.use(cookieParser());

//authnication

app.use("/api/auth", authRoutes)


app.listen(PORT, ()=>{
    console.log("sever is running on http://localhost:"+ PORT);

    connectDB()
})

// FmLzW70FElLLkB8p

//aHeDfQrML6CYY8d2