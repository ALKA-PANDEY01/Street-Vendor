import mongoose from "mongoose";

const reviewSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    targetType:{
        type:String,
        enum:["product","vendor"],
        required:true,
    },
    targetId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        required:true,
    },
    rating:{
        type:Number,
        min:1,
        max:5,
        required:true,
    },
    comment:{
        type:String,
        trim:true,
        default:"",
    },
},
{timestamps:true}
);

reviewSchema.index({targetType:1,targetId:1});
reviewSchema.index({userId:1,targetType:1,targetId:1,orderId:1},{unique:true});

export default mongoose.model("Review",reviewSchema);
