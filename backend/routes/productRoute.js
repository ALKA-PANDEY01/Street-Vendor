import express from 'express';
const router=express.Router();
import Product from '../models/products.js';
import {authMiddleware, authorizeRoles} from "../middleware/authMiddleware.js"
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

        let url=req.file ? req.file.path : null;
        let filename=req.file ? req.file.filename : null;

        let finalLat;
        let finalLng;

        if(useLiveLocation === "true" || useLiveLocation === true){
            finalLat=lat;
            finalLng=lng;
        }

        else{
            const geoRes=await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(req.body.address)}&format=json&limit=1`,
                {
                    headers: {
                        'User-Agent': 'StreetFoodApp/1.0 (contact@streetfood.local)'
                    }
                }
            );

            if(geoRes.data.length>0){
                finalLat=geoRes.data[0].lat;
                finalLng=geoRes.data[0].lon;
            }else{
                return res.status(400).json({message:"Invalid address. Could not geocode."});
            }
        }
        const newProduct=new Product({
            name,
            price,
            category,
            description,
            image: {
                url: url,
                filename: filename
            },
            vendorName,
            quantity,
            inStock,
            address,
            location: {

        type: "Point",

        coordinates: [
          parseFloat(finalLng),
          parseFloat(finalLat)
        ]

      }

        });
        newProduct.owner=req.user.userId;
        await newProduct.save();
        res.status(201).json(newProduct);
    }catch(err){
        res.status(400).json({message:"validation error" ,error:err.message});
    }
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



// router
// .get("/new", async(req,res)=>{
//     try{

//     }
// })
export default router;