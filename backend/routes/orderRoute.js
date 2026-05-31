import  Cart from "../models/cart.js";
import Product from "../models/products.js";
import Order from "../models/order.js";
import {authMiddleware, authorizeRoles} from "../middleware/authmiddleware.js";
import express from "express";
const router=express.Router();
import {getIO} from "../socket.js";

router
.post("/placeorder",authMiddleware,async(req,res)=>{
    try{
        const userId=req.user.userId;
        const {productId}=req.body;
        const io=getIO();

        
        const cart=await Cart.findOne({userId:userId});

        if(!cart){
            return res.status(400).json({message:"Cart is empty"});
        }
        const cartItem=cart.items.find(
            (item)=> item.productId.toString()==productId
        );
        if(!cartItem){
            return res.status(400).json({message:"Product not in cart"});
        }
        const product=await Product.findById(productId);
        if(!product || !product.inStock){
            return res.status(400).json({message:"Product not available"});
        }

        const order=new Order({
            userId:userId,
            vendor:product.owner,
            product:product._id,
            quantity:cartItem.quantity,
            totalPrice:product.price*cartItem.quantity,
            status:"Pending",
        });
        await order.save();

        cart.items=cart.items.filter(
            (item)=>item.productId.toString()!==productId
        );
        await cart.save();
        // send new order notification to vendor
        io.to(order.vendor.toString()).emit("newOrder",order);

        
        res.status(201).json({message:"Order placed successfully", order});
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

router
.get("/myorders", authMiddleware, async(req,res)=>{
    try{
        const orders=await Order.find({
            vendor:req.user.userId,
            status: {$ne: "Delivered"}
        }).populate("product").populate("vendor","username email").populate("userId","username email").sort({createdAt:-1});
        res.json(orders);
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

router 
.get("/userorders", authMiddleware, authorizeRoles("user","admin"), async(req,res)=>{
    try{
        const userId=req.user.userId;
        const orders=await Order.find({
            userId:userId,}).populate("product").populate("userId","username email").populate("vendor","username email").sort({createdAt:-1});
        res.json(orders);
    }catch(error){
        res.status(500).json({message:error.message});
    }});

router.put("/update-status/:orderId", authMiddleware, authorizeRoles("vendor","admin","user"), async(req,res)=>{
    try{
        const {orderId}=req.params;
        const {status}=req.body;
        const order=await Order.findById(orderId)
            .populate("product")
            .populate("userId","username email")
            .populate("vendor","username email");

        if(!order){
            return res.status(404).json({message:"Order not found"});
        }

        const vendorId = order.vendor && order.vendor._id ? order.vendor._id.toString() : order.vendor.toString();
        const userId = order.userId && order.userId._id ? order.userId._id.toString() : order.userId.toString();
        if(vendorId !== req.user.userId && userId !== req.user.userId && req.user.role !== 'admin'){
            return res.status(403).json({message:"Access denied"});
        }

        order.status = status;
        await order.save();

        const io = getIO();
        io.to(order.userId._id.toString()).emit("orderStatusUpdate", order);
        io.to(vendorId).emit("orderStatusUpdate", order);

        res.json({message:"Order status updated", order});
    }catch(error){
        res.status(500).json({message:error.message});
    }
});


export default router;