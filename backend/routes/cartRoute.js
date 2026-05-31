import express from 'express';
const router=express.Router();
import Product from '../models/products.js';
import {authMiddleware, authorizeRoles} from "../middleware/authmiddleware.js"
import Cart from "../models/cart.js";

router.post("/add", authMiddleware, authorizeRoles("user","admin"), async(req,res)=>{
    try{
        const userId=req.user.userId;
        const{productId,quantity}=req.body;
        let cart=await Cart.findOne({userId});

        if(!cart){
            cart=await Cart.create({
                userId,
                items:[{productId,quantity}],
            })
            return res.status(201).json(cart);
        }
        const existingItem=cart.items.find(
            (item)=>item.productId.toString()===productId
        );
        if(existingItem){
            existingItem.quantity+=quantity;
        }else{
            cart.items.push({
                productId,
                quantity,
            });
        }
        await cart.save();

        res.status(200).json(cart);
    }catch(error){
        res.status(500).json({message:error.message});
        console.log("error adding cart",error);
    }
}
);

router.get("/", authMiddleware, authorizeRoles("user","admin"), async(req,res)=>{
    try{
        const cart=await Cart.findOne({
            userId: req.user.userId,
        }).populate("items.productId");

        if(!cart){
            return res.json({items:[]});
        }
        res.status(200).json(cart);
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

router.put("/decrease/:productId", authMiddleware, authorizeRoles("user","admin"), async(req,res)=>{
    try{
        const{productId}=req.params;
        const cart=await Cart.findOne({
            userId:req.user.userId
        })
        const item=cart.items.find(
            item => item.productId.toString()==productId
        );
        if(item.quantity>1){
            item.quantity-=1;
        }else{
            cart.items=cart.items.filter(
                item=>item.productId.toString()!==productId
            );
        }
        await cart.save();
        res.status(200).json(cart);
    }catch(error){
        res.status(500).json({
            message:error.message
        })
    }
});

router.put("/increase/:productId", authMiddleware, authorizeRoles("user","admin"), async(req,res)=>{
    try{
        const{productId}=req.params;

        const cart=await Cart.findOne({
            userId:req.user.userId
        });
        const item=cart.items.find(
            item=>item.productId.toString()==productId
        );
        if(item){
            item.quantity+=1;
        }
        await cart.save();
        res.status(200).json(cart);
    }catch(error){
        res.status(500).json({
            message:error.message
        });
    }
})

router.delete("/delete/:productId", authMiddleware, authorizeRoles("user","admin"), async(req,res)=>{
    try{
        const{productId}=req.params;
        const cart=await Cart.findOne({
            userId:req.user.userId
        });

        cart.items=cart.items.filter(
            item => item.productId.toString()!==productId
        );
        await cart.save();
        res.status(200).json(cart);
    }catch(error){
        res.status(500).json({
            message:error.message
        });
    }
})
export default router;