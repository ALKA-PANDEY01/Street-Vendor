import mongoose from 'mongoose';
import User from './user.js';
import Product from './products.js';

const orderSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    vendor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    quantity:{
        type:Number,
        min:1,
        required:true
    },
    totalPrice:{
        type:Number,
        min:0,
        required:true
    },
    status:{
        type:String,
        enum:["Pending","Accepted","Rejected","Preparing","Delivered"],

},

},
{timestamps:true}
);

export default mongoose.model("Order",orderSchema);