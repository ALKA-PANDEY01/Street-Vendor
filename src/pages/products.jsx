import {useState, useEffect} from 'react';
import ProductCard from '../components/productcard.jsx';
import { Container, Button, Row, Col } from 'react-bootstrap';
import CategoryNavbar from '../components/categorynavbar.jsx';
import NavigationIcon from '@mui/icons-material/Navigation';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import Fab from '@mui/material/Fab';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Product({user}){
    const[products,setProduct]=useState([]);
    const[selectedcategory,setSelectedCategory]=useState("all");
    const[nearbyMode,setNearbyMode]=useState(false);
    
    const getAllproducts=async()=>{
        try{
            let url="/products";
            if(selectedcategory !== "all"){
                url += `?category=${selectedcategory}`;
            }
            const res=await axios.get(url);
            setProduct(res.data);
            // toast.success("Products fetched successfully!");
        }catch(err){
            console.log("Error fetching products",err);
            toast.error("Error fetching products");
        }
    };

    const getNearbyProducts=()=>{
        navigator.geolocation.getCurrentPosition(
            async(position)=>{
                const lat=position.coords.latitude;
                const lng=position.coords.longitude;
                try{
                    
        let url = `/products?lat=${lat}&lng=${lng}`;
        if (selectedcategory !== "all") {
          url += `&category=${selectedcategory}`;
        }
                    const res=await axios.get(url);
                    setProduct(res.data);
                    toast.success("Nearby products fetched successfully!");
                }catch(err){
                    toast.error("Error fetching nearby products",err);
                }
            }
        )
    };

    useEffect(()=>{
        if(nearbyMode){
            getNearbyProducts();
        }else{
            getAllproducts();
        }
    },[selectedcategory, nearbyMode]);


    return (
        <>
                        <CategoryNavbar selectedCategory={selectedcategory} setSelectedCategory={setSelectedCategory}></CategoryNavbar>
                <Container className="mt-4 products-page-content" style={{paddingTop:"2rem"}}>
                        {user && (
                            <h2 className="text-center mt-3 " style={{color:"#182b4f", marginBottom:"2rem"}}>
                                <WavingHandIcon /> Hello {user.name} !!
                            </h2>
                        )}
            {/* <Button onClick={()=>setNearbyMode(!nearbyMode)}>{nearbyMode ? "Show All Products" : "Show Nearby Products"}</Button> */}
            {/* <h2>{user ? `Hello, ${user.username} ` : "Welcome Guest"}</h2> */}
             <Fab variant="extended" onClick={()=>setNearbyMode(!nearbyMode)} color={nearbyMode ? "secondary" : "primary"} sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <NavigationIcon sx={{ mr: 1 }} />
        {nearbyMode ? "Show All Products" : "Show Nearby Products"}
      </Fab>
            <Row xs={1} md={2} lg={3} className="g-4">
                
                {products.map((item)=>(
                    <Col key={item._id}>
                        <ProductCard product={item}></ProductCard>
                    </Col>
                ))}
            </Row>
        </Container>
       </>
    )
}