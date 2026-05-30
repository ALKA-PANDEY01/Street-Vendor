import mongoose from 'mongoose';
const { Schema } = mongoose;
import bcrypt from 'bcryptjs';

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        trim:true,
    },
    email:{
        type:String,
        unique:true,
        // lowercase:true
    },
    password:{
        type:String,
        minlength:4,
    },
    role:{
        type:String,
        enum:["user","vendor","admin"],
        default:"user"
    } 
},
{timestamps:true}
);

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return ;
    this.password=await bcrypt.hash(this.password,10);
    
})

userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
};

export default mongoose.model("User",userSchema);