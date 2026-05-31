import User from '../models/user.js';
import express from 'express';
const router=express.Router();
import jwt from "jsonwebtoken";
import {authMiddleware} from "../middleware/authmiddleware.js"

router.
post ("/signup",async(req, res)=>{
    try{
        const{username,email,password,role}=req.body;
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"user already exist"});    
        }
        const allowedRole=['user','vendor'];
        const assignedRole=allowedRole.includes(role) ? role : 'user';
        const newUser=new User({username,email,password,role:assignedRole});
        await newUser.save();
        res.json({message: "user registered"});
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

router
.post("/login",async (req,res)=>{
    try{
        const{username,password}=req.body;
        const user=await User.findOne({username});
    
    if(!user || !(await user.comparePassword(password))){
        return res.status(401).json({message:"Invalid credentials"});
    }
    const token=jwt.sign(
        {userId:user._id,name:user.username,role:user.role},
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    res.cookie("token",token,{
        httpOnly:true,
        secure:true,
        sameSite:"none",
        maxAge:480 * 60 * 60 * 1000, // 48 hours
    })
    res.json({message:"Login successfully1"});
}catch(err){
    res.status(500).json({message:err.message});
}
})

router
.post("/logout",async(req,res)=>{
    res.clearCookie("token",{
        httpOnly:true,
        sameSite:"none",
        secure:true
    });
    res.json({message:"Logged out Successfully"});
})

router
.get("/profile",authMiddleware,async(req,res)=>{
    try{
        const user=await User.findById(req.user.userId).select("-password");
        res.json(req.user);
        
    }catch{
        res.status(500).json({message:"Error fetching user"});
    }
})

export default router;