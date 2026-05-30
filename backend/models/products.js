import mongoose from 'mongoose';
const { Schema } = mongoose;
import User from './user.js';

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
    },
    price:{
        type:Number,
        min:0,
    },
    description:{
        type:String,
    },
    category:{
        type:String,
        enum:["Fruits","Vegetables","Street Food","Grains","Other","dairy"],
        default:"Other"
    },
    image:{
        url:{
            type:String,
            default:"https://plus.unsplash.com/premium_photo-1683121448313-e3153e0c8e24?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDR8fHxlbnwwfHx8fHw%3D",
        set:v=>v===""?undefined:v
        },
        filename:{
            type:String,
            default:"default.jpg"
        },
        
        
    },
    vendorName:{
        type:String,
    },
    inStock:{
        type:Boolean,
        default:true,
    },
    quantity:{
        type:String,
        enum:["kg","psc","dzn","lt","pac"],
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    address:{
        type:String,
    },
    location:{
        type:{
            type:String,
            enum:["Point"],
            default:"Point"
        },
        coordinates:{
            type:[Number],
            default:[0,0],
            required:true,
        }
    }
},
{timestamps:true}
);

productSchema.index({location:"2dsphere"});

export default mongoose.model("Product",productSchema);