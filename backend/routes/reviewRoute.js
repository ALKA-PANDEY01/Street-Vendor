import express from "express";
import mongoose from "mongoose";
import Review from "../models/review.js";
import Order from "../models/order.js";
import Product from "../models/products.js";
import User from "../models/user.js";
import {authMiddleware, authorizeRoles} from "../middleware/authmiddleware.js";

const router=express.Router();

const isValidObjectId=(id)=>mongoose.Types.ObjectId.isValid(id);
const isValidTargetType=(targetType)=>["product","vendor"].includes(targetType);

router.post("/",authMiddleware,authorizeRoles("user"),async(req,res)=>{
    try{
        const {targetType,targetId,orderId,rating,comment}=req.body;

        if(!isValidTargetType(targetType)){
            return res.status(400).json({message:"targetType must be product or vendor"});
        }
        if(!isValidObjectId(targetId) || !isValidObjectId(orderId)){
            return res.status(400).json({message:"Invalid target or order id"});
        }

        const numericRating=Number(rating);
        if(!Number.isInteger(numericRating) || numericRating<1 || numericRating>5){
            return res.status(400).json({message:"Rating must be an integer between 1 and 5"});
        }

        const target = targetType === "product"
            ? await Product.findById(targetId)
            : await User.findOne({_id:targetId,role:"vendor"});
        if(!target){
            return res.status(404).json({message:`${targetType} not found`});
        }

        const orderFilter={
            _id:orderId,
            userId:req.user.userId,
            status:"Delivered",
            [targetType === "product" ? "product" : "vendor"]:targetId,
        };
        const order=await Order.findOne(orderFilter);
        if(!order){
            return res.status(403).json({message:"You can review only items from your delivered orders"});
        }

        const existingReview=await Review.findOne({
            userId:req.user.userId,
            targetType,
            targetId,
            orderId,
        });
        if(existingReview){
            return res.status(409).json({message:"You have already reviewed this item for this order"});
        }

        const review=await Review.create({
            userId:req.user.userId,
            targetType,
            targetId,
            orderId,
            rating:numericRating,
            comment:comment || "",
        });

        res.status(201).json({message:"Review created successfully",review});
    }catch(error){
        if(error.code===11000){
            return res.status(409).json({message:"You have already reviewed this item for this order"});
        }
        res.status(500).json({message:error.message});
    }
});

router.get("/:targetType/:targetId/summary",async(req,res)=>{
    try{
        const {targetType,targetId}=req.params;
        if(!isValidTargetType(targetType) || !isValidObjectId(targetId)){
            return res.status(400).json({message:"Invalid review target"});
        }

        const [summary]=await Review.aggregate([
            {$match:{targetType,targetId:new mongoose.Types.ObjectId(targetId)}},
            {$group:{_id:null,averageRating:{$avg:"$rating"},count:{$sum:1}}},
        ]);

        res.json({
            averageRating:summary ? Number(summary.averageRating.toFixed(2)) : 0,
            count:summary ? summary.count : 0,
        });
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

router.get("/:targetType/:targetId",async(req,res)=>{
    try{
        const {targetType,targetId}=req.params;
        if(!isValidTargetType(targetType) || !isValidObjectId(targetId)){
            return res.status(400).json({message:"Invalid review target"});
        }

        const page=Math.max(Number.parseInt(req.query.page,10) || 1,1);
        const limit=Math.min(Math.max(Number.parseInt(req.query.limit,10) || 10,1),50);
        const filter={targetType,targetId};
        const [reviews,total]=await Promise.all([
            Review.find(filter)
                .populate("userId","username")
                .sort({createdAt:-1})
                .skip((page-1)*limit)
                .limit(limit),
            Review.countDocuments(filter),
        ]);

        res.json({
            reviews,
            page,
            limit,
            total,
            totalPages:Math.ceil(total/limit),
        });
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

router.put("/:id",authMiddleware,authorizeRoles("user"),async(req,res)=>{
    try{
        const {rating,comment}=req.body;
        const review=await Review.findById(req.params.id);
        if(!review){
            return res.status(404).json({message:"Review not found"});
        }
        if(review.userId.toString()!==req.user.userId){
            return res.status(403).json({message:"Forbidden"});
        }

        if(rating !== undefined){
            const numericRating=Number(rating);
            if(!Number.isInteger(numericRating) || numericRating<1 || numericRating>5){
                return res.status(400).json({message:"Rating must be an integer between 1 and 5"});
            }
            review.rating=numericRating;
        }
        if(comment !== undefined){
            review.comment=comment;
        }
        await review.save();

        res.json({message:"Review updated successfully",review});
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

router.delete("/:id",authMiddleware,authorizeRoles("user"),async(req,res)=>{
    try{
        const review=await Review.findById(req.params.id);
        if(!review){
            return res.status(404).json({message:"Review not found"});
        }
        if(review.userId.toString()!==req.user.userId){
            return res.status(403).json({message:"Forbidden"});
        }

        await review.deleteOne();
        res.json({message:"Review deleted successfully"});
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

export default router;
