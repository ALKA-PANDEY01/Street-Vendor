import jwt from "jsonwebtoken";

export const authMiddleware=(req,res,next)=>{
    try{
        const token=req.cookies.token;
        if(!token){
            return res.status(401).json({message:"No token"});
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }catch{
        res.status(401).json({message:"Invalid token"});
    }
};

export const authorizeRoles=(...roles)=>{
    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({message:"Unauthorized"});
        }
        if(!roles.includes(req.user.role)){
            return res.status(403).json({message:"Forbidden"});
        }
        next();
    };
};