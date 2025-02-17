import e from "express";
import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const genarateTokens = (userId) =>{
    const accessToken = jwt.sign({userId},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"15m",
    })

    const refreshToken = jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:"7d",
    })
    return{accessToken,refreshToken};

};

const storeRefreshToken = async(userId,refreshToken) =>{
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*24*60*60);
}

const setCookies = (res, accessToken,refreshToken) =>{
    res.cookie("accessToken", accessToken,{
        httpOnly: true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge:15*60*1000,//expires in 15 min

    })

    

    res.cookie("refreshToken", refreshToken,{
        httpOnly: true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge:7*24*60*60*1000,//expires in 7 days
        
    })
}


export const signup = async(req, res) =>{
    
    const {email,password,name} = req.body;

    try {
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "user already exist"});
        }
        const user = await User.create({name,email,password})

        //authenticating

        const{accessToken,refreshToken}=genarateTokens(user._id)
        await storeRefreshToken(user._id,refreshToken);

        setCookies(res,accessToken,refreshToken);

        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,

        });
    } catch (error) {
        console.log("error in signup controller",error.message);
        res.status(500).json({message:error.message})
    }
    }

export const login = async (req, res) =>{
    try {
        const {email,password} = req.body
    const user = await User.findOne({email})
    if(user && (await user.comparePassword(password))){
        const {accessToken,refreshToken} = genarateTokens(user._id)
        await storeRefreshToken(user._id,refreshToken)
        setCookies(res,accessToken,refreshToken)

        res.json(
           {
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
           }
        )
    }else{
        res.status(401).json({message:"invalid email or pw"})
    }
    } catch (error) {
        console.log("error in login controller",error.message);
        res.status(500).json({message:error.message});
    }
    
}

export const logout = async (req, res) =>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
            await redis.del(`refresh_token:${decoded.userId}`)
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({message:"loged out"});//
    } catch (error) {
        console.log("error in logout controller",error.message);
       res.status(500).json({message:"server error",error:error.message});
    }
}

//will refresh the access token

export const refreshToken = async(req, res) =>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({message:"no refresh token"});
        }

        const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
    } catch (error) {
        
    }
}