import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import productRoute from './routes/productRoute.js';
import userRoute from './routes/userRoute.js';
import cartRoute from './routes/cartRoute.js';
import heroCrouselRoute from "./routes/herocrouselRoute.js";
import orderRoute from "./routes/orderRoute.js";

import {initSocket} from "./socket.js";
import http from "http";
dotenv.config();

const app=express();
const port=process.env.PORT || 5000;

import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server=http.createServer(app);
initSocket(server); // Initialize Socket.io with the Express server

server.listen(port,()=>{
    console.log(`Server is listening at port :${port} `);
});

// app.use( cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const dburl=process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("Mongoose 2 connection successfully");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dburl);
}
app.use((req,res,next)=>{
    console.log(`Request method : ${req.method}, URL:${req.url}`);
    next();
})
app.use(cors({
    origin: ["https://street-vendor-nl05.onrender.com", "https://street-vendor-1-02x5.onrender.com"],
    credentials:true,
}));




app.use("/products",productRoute);
app.use("/user",userRoute);
app.use("/cart",cartRoute);
app.use("/orders",orderRoute);

app.use("/",heroCrouselRoute);

// Error handling middleware for multer and other errors
app.use((err, req, res, next) => {
    console.error("Global error handler:", err.message);
    console.error("Error stack:", err.stack);
    
    // Handle multer errors
    if (err.name === 'MulterError') {
        console.error("Multer error code:", err.code);
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({message:"File is too large", error: err.message});
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({message:"Too many files", error: err.message});
        }
        return res.status(400).json({message:"File upload error", error: err.message});
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({message:"Validation error", error: err.message});
    }
    
    // Default error response
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// DO NOT call app.listen() - server is already listening via http.createServer()