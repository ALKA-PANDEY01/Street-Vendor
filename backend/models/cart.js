import mongoose from "mongoose";
import User from './user.js';
import Product from './products.js';

const cartSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    items:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product",
            },
            quantity:{
                type:Number,
                default:1,
            }
        }
    ]
})

const Cart=mongoose.model("Cart",cartSchema);
export default Cart;