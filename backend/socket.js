import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Order from "./models/order.js";
import process from "node:process";
import dotenv from "dotenv";
dotenv.config();

let io;
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://street-vendor-1-02x5.onrender.com",
    "https://street-vendor-nl05.onrender.com",
];
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins, // Allow requests from all whitelisted frontend URLs
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("User connected", socket.id);

        // vendor joins room with their userId
        socket.on("joinVendorRoom", (vendorId) => {
            socket.join(vendorId);
            console.log(`Vendor ${vendorId} joined room ${vendorId}`);
        });

        // user joins room with their userId
        socket.on("joinUserRoom", (userId) => {
            socket.join(userId);
        });

        socket.on("joinOrderRoom",async(payload={},ack)=>{
            const reply=typeof ack === "function" ? ack : ()=>{};
            const {orderId}=payload || {};
            const user=getSocketUser(socket);
            if(!user){
                return reply({ok:false,message:"Authentication required"});
            }
            if(!mongoose.Types.ObjectId.isValid(orderId)){
                return reply({ok:false,message:"Invalid order id"});
            }
            try{
                const order=await Order.findById(orderId)
                    .select("userId vendor deliveryLocation deliveryLocationUpdatedAt");
                if(!order){
                    return reply({ok:false,message:"Order not found"});
                }
                const userId=String(user.userId);
                if(user.role !== "admin" && userId !== String(order.userId) && userId !== String(order.vendor)){
                    return reply({ok:false,message:"You cannot access this order"});
                }
                socket.join(getOrderRoom(orderId));
                reply({
                    ok:true,
                    deliveryLocation:order.deliveryLocation,
                    updatedAt:order.deliveryLocationUpdatedAt,
                });
            }catch(error){
                console.error("Unable to join order tracking room",error);
                reply({ok:false,message:"Unable to load order tracking"});
            }
        });

        socket.on("deliveryLocationUpdate",async(payload={},ack)=>{
            const reply=typeof ack === "function" ? ack : ()=>{};
            const {orderId,latitude,longitude}=payload || {};
            const user=getSocketUser(socket);
            if(!user){
                return reply({ok:false,message:"Authentication required"});
            }
            if(!mongoose.Types.ObjectId.isValid(orderId)){
                return reply({ok:false,message:"Invalid order id"});
            }
            const lat=Number(latitude);
            const lng=Number(longitude);
            if(!Number.isFinite(lat) || lat < -90 || lat > 90 ||
                !Number.isFinite(lng) || lng < -180 || lng > 180){
                return reply({ok:false,message:"Invalid delivery coordinates"});
            }
            try{
                const order=await Order.findById(orderId);
                if(!order){
                    return reply({ok:false,message:"Order not found"});
                }
                if(user.role !== "admin" && (user.role !== "vendor" || String(order.vendor) !== String(user.userId))){
                    return reply({ok:false,message:"Only this order's vendor can share its location"});
                }
                if(["Delivered","Rejected"].includes(order.status)){
                    return reply({ok:false,message:"Tracking is closed for this order"});
                }

                order.deliveryLocation={type:"Point",coordinates:[lng,lat]};
                order.deliveryLocationUpdatedAt=new Date();
                await order.save();
                const update={
                    orderId:String(order._id),
                    deliveryLocation:order.deliveryLocation,
                    updatedAt:order.deliveryLocationUpdatedAt,
                };
                io.to(getOrderRoom(orderId)).emit("deliveryLocationUpdate",update);
                reply({ok:true,...update});
            }catch(error){
                console.error("Unable to save delivery location",error);
                reply({ok:false,message:"Unable to save delivery location"});
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        });
    });
};

const getSocketUser=(socket)=>{
    const tokenCookie=(socket.handshake.headers.cookie || "")
        .split(";")
        .map((cookie)=>cookie.trim())
        .find((cookie)=>cookie.startsWith("token="));
    if(!tokenCookie){
        return null;
    }
    try{
        return jwt.verify(decodeURIComponent(tokenCookie.slice(6)),process.env.JWT_SECRET);
    }catch{
        return null;
    }
};

const getOrderRoom=(orderId)=>`order:${orderId}`;

export const getIO = () => io;
export const sendNotificationToVendor = (vendorId, notification) => {
    if (io) {
        io.to(vendorId).emit("newOrder", notification);
    } else {
        console.error("Socket.io not initialized");
    }
};
 export const sendNotificationToUser = (userId, notification) => {
    if (io) {
        io.to(userId).emit("orderStatusUpdate", notification);
    } else {
        console.error("Socket.io not initialized");
    }
};

