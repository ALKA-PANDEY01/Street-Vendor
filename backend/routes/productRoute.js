import express from 'express';
const router=express.Router();
import Product from '../models/products.js';
import {authMiddleware, authorizeRoles} from "../middleware/authmiddleware.js"
import User from '../models/user.js';
import axios from "axios";
import upload from "../middleware/upload.js";

router
.get("/",async (req , res)=>{
    try{
        const {category,lat,lng}=req.query;
        let filter={};
        if(category){
            filter.category=category;
        }
        if(lat && lng){
            filter.location={
                $near:{
                    $geometry:{
                        type:"Point",
                        coordinates:[
                            parseFloat(lng),
                            parseFloat(lat),
                        ]
                    },
                    $maxDistance:50000,
                }
            }
        }
        const allProducts=await Product.find(filter).populate("owner","username");
        res.status(200).json(allProducts);
        console.log(allProducts);
    }
    catch(err){
        res.status(500).json({message:"could not fetch products", error:err.message});
    }
})

// router.get("/nearby", async(req,res)=>{
//     try{
//         const {lat,lng}=req.query;
//         const products=await Product.find({
//             location:{
//                 $near:{
//                     $geometry:{
//                         type:"Point",
//                         coordinates:[
//                             parseFloat(lng),
//                             parseFloat(lat),
//                         ]
//                     },
//                     $maxDistance:50000,
//                 }
//             }
//         }).populate("owner","username");
//         res.json(products);
//     }catch(err){
//         console.error("Error fetching nearby products",err);
//         res.status(500).json({message:"Server error fetching nearby products",error:err.message});
//     }
// });


router.get("/mydashboard", authMiddleware, async(req,res)=>{
    try{
        const products=await Product.find({ owner:req.user.userId });
        console.log("mydash info");
        return res.json(products);
    }catch(err){
        console.log("error in mydash backend",err);
        res.status(500).json({message:"server error fetching dashboard backend",err});
    }
})

router.post("/addproduct", authMiddleware, authorizeRoles("vendor","admin"),upload.single("image"), async(req,res)=>{
    try{
        console.log("Add product request received");
        console.log("File uploaded:", req.file ? "Yes" : "No");
        
        if(!req.file){
            console.log("No file uploaded");
            return res.status(400).json({message:"Image file is required"});
        }
        
        const {
            name,
            price,
            category,
            description,
            vendorName,
            quantity,
            inStock,
            address,
            lat,
            lng,
            useLiveLocation
        }=req.body;

        // Validate required fields
        if(!name || !price || !category || !description || !vendorName || !quantity){
            console.log("Missing required fields");
            return res.status(400).json({message:"Missing required fields: name, price, category, description, vendorName, quantity"});
        }

        let url=req.file ? req.file.path : null;
        let filename=req.file ? req.file.filename : null;

        console.log("Image URL from Cloudinary:", url);
        console.log("Using live location:", useLiveLocation);

        let finalLat;
        let finalLng;

        if(useLiveLocation === "true" || useLiveLocation === true){
            if(!lat || !lng){
                console.log("Live location enabled but coordinates not provided");
                return res.status(400).json({message:"Live location enabled but coordinates not available"});
            }
            finalLat=lat;
            finalLng=lng;
        }
        else{
            if(!address){
                console.log("Address not provided and live location disabled");
                return res.status(400).json({message:"Address is required when live location is disabled"});
            }
            
            try{
                const geoRes=await axios.get(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
                    {
                        headers: {
                            'User-Agent': 'StreetFoodApp/1.0 (contact@streetfood.local)'
                        }
                    }
                );

                if(geoRes.data.length>0){
                    finalLat=geoRes.data[0].lat;
                    finalLng=geoRes.data[0].lon;
                    console.log("Geocoded address:", finalLat, finalLng);
                }else{
                    console.log("Invalid address for geocoding:", address);
                    return res.status(400).json({message:"Invalid address. Could not geocode."});
                }
            }catch(geoError){
                console.error("Geocoding error:", geoError.message);
                return res.status(400).json({message:"Error geocoding address: "+geoError.message});
            }
        }

        const newProduct=new Product({
            name,
            price:Number(price),
            category,
            description,
            image: {
                url: url,
                filename: filename
            },
            vendorName,
            quantity,
            inStock: inStock === "true" || inStock === true,
            address,
            location: {
                type: "Point",
                coordinates: [
                    parseFloat(finalLng),
                    parseFloat(finalLat)
                ]
            }
        });
        
        newProduct.owner=req.user.userId || req.user._id;
        
        console.log("Saving product:", newProduct);
        await newProduct.save();
        console.log("Product saved successfully");
        
        res.status(201).json({message:"Product added successfully", product: newProduct});
    }catch(err){
        console.error("Error adding product:", err);
        res.status(500).json({message:"Server error adding product", error:err.message});
    }
})
router.get("/addproduct", authMiddleware, authorizeRoles("vendor","admin"), async(req,res)=>{
    res.json({message:"This is the add product page"});
})

router.get("/:id",async(req,res)=>{
    try{
        const product=await Product.findById(req.params.id);
        res.json(product);
    }catch(err){
        res.status(500).send(err);
    }
})

router.put("/toggle-stock/:id", authMiddleware, authorizeRoles("vendor","admin"), async(req,res)=>{
    try{
        const product=await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        if(product.owner?.toString()!==req.user.userId && req.user.role !== 'admin'){
            return res.status(403).json({message:"Forbidden"});
        }
        product.inStock=!product.inStock;
        await product.save();
        res.json(product);
    }catch(err){
        res.status(500).json({message:err.message});
    }
})
router.put("/:id" , authMiddleware,upload.single("image"), authorizeRoles("vendor","admin"), async(req,res)=>{
    console.log("body data",req.body);
    console.log("id of product",req.params.id)
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        if(product.owner?.toString() !== req.user.userId && req.user.role !== 'admin'){
            return res.status(403).json({message:"Forbidden"});
        }
        Object.assign(product, req.body);
        await product.save();
        res.status(200).json({message:"Product updated successfully", product});      
    }catch(error){
        res.status(500).json({error:error.message});
    }
})
router.delete("/:id", authMiddleware, authorizeRoles("vendor","admin"), async(req,res)=>{
    const{id}=req.params;
    try{
        const product=await Product.findById(id);
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        if(product.owner?.toString() !== req.user.userId && req.user.role !== 'admin'){
            return res.status(403).json({message:"Forbidden"});
        }
        await product.deleteOne();
        res.status(200).json({message:"Product deleted successfully"});
    }catch(error){
        console.error("Debug errror",error);
        res.status(500).json({error:error.message});
    }
});


// Multer/Upload error handling middleware
router.use((err, req, res, next) => {
    console.error("Router error middleware caught:", err.message);
    
    // Handle multer errors
    if (err.name === 'MulterError') {
        console.error("Multer error:", err.code);
        if (err.code === 'FILE_TOO_LARGE') {
            return res.status(400).json({message:"File is too large"});
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({message:"Too many files"});
        }
        return res.status(400).json({message:"File upload error: " + err.message});
    }
    
    // Handle Cloudinary/other upload errors
    if (err.message && err.message.includes('cloudinary')) {
        console.error("Cloudinary error:", err.message);
        return res.status(500).json({message:"Image upload service error. Please try again.", error: err.message});
    }
    
    // Generic error
    console.error("Unexpected error:", err);
    res.status(500).json({message:"Server error", error: err.message});
});

// router
// .get("/new", async(req,res)=>{
//     try{

//     }
// })
export default router;