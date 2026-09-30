import {useState, useEffect, useCallback} from 'react';
import ProductCard from '../components/productcard.jsx';
import { Container, Button, Row, Col } from 'react-bootstrap';
import CategoryNavbar from '../components/categorynavbar.jsx';
import NavigationIcon from '@mui/icons-material/Navigation';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import Fab from '@mui/material/Fab';
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import NearbyVendorMap from '../components/nearbyvendormap.jsx';

const NEARBY_RADIUS_KM=10;

const getDistanceKm=(from,to)=>{
    const toRadians=(degrees)=>degrees*Math.PI/180;
    const latitudeDelta=toRadians(to.lat-from.lat);
    const longitudeDelta=toRadians(to.lng-from.lng);
    const haversine=Math.sin(latitudeDelta/2)**2+
        Math.cos(toRadians(from.lat))*Math.cos(toRadians(to.lat))*
        Math.sin(longitudeDelta/2)**2;
    return 6371*2*Math.atan2(Math.sqrt(haversine),Math.sqrt(1-haversine));
};

export default function Product({user}){
    const[products,setProduct]=useState([]);
    const[selectedcategory,setSelectedCategory]=useState("all");
    const[nearbyMode,setNearbyMode]=useState(false);
    const[userLocation,setUserLocation]=useState(null);
    const[nearbyVendors,setNearbyVendors]=useState([]);
    const[nearbyLoading,setNearbyLoading]=useState(false);
    
    const getNearbyProducts=useCallback(()=>{
        navigator.geolocation.getCurrentPosition(
            async(position)=>{
                const lat=position.coords.latitude;
                const lng=position.coords.longitude;
                const center={lat,lng};
                setUserLocation(center);
                setNearbyLoading(true);
                setNearbyVendors([]);
                try{
                    const params=new URLSearchParams({
                        lat:String(lat),
                        lng:String(lng),
                        radiusKm:String(NEARBY_RADIUS_KM),
                    });
                    if(selectedcategory !== "all"){
                        params.set("category",selectedcategory);
                    }
                    const url=`/products?${params.toString()}`;
                    const res=await axios.get(url);
                    const vendorMap=new Map();
                    const nearbyProducts=(Array.isArray(res.data) ? res.data : []).filter((product)=>{
                        const coordinates=product.location?.coordinates;
                        if(!Array.isArray(coordinates) || coordinates.length < 2){
                            return false;
                        }
                        const productLocation={
                            lng:Number(coordinates[0]),
                            lat:Number(coordinates[1]),
                        };
                        if(!Number.isFinite(productLocation.lat) || !Number.isFinite(productLocation.lng)){
                            return false;
                        }
                        const distanceKm=getDistanceKm(center,productLocation);
                        if(distanceKm > NEARBY_RADIUS_KM){
                            return false;
                        }

                        const vendor=product.owner;
                        const vendorId=vendor?._id || vendor;
                        if(!vendorId){
                            return false;
                        }
                        const key=String(vendorId);
                        if(!vendorMap.has(key)){
                            vendorMap.set(key,{
                                id:key,
                                name:vendor?.username || product.vendorName || "Vendor",
                                lat:productLocation.lat,
                                lng:productLocation.lng,
                                distanceKm,
                                products:[],
                            });
                        }
                        vendorMap.get(key).products.push({
                            id:product._id,
                            name:product.name,
                            price:product.price,
                        });
                        return true;
                    });
                    setProduct(nearbyProducts);
                    setNearbyVendors(Array.from(vendorMap.values()));
                    toast.success("Nearby products fetched successfully!");
                }catch(err){
                    console.error("Error fetching nearby products",err);
                    toast.error(err.response?.data?.message || "Error fetching nearby products");
                }finally{
                    setNearbyLoading(false);
                }
            },
            (error)=>{
                console.error("Location request failed",error);
                setNearbyLoading(false);
                setNearbyMode(false);
                toast.error("Unable to get your location. Allow location access and try again.");
            },
            {enableHighAccuracy:true,timeout:10000,maximumAge:60000}
        )
    },[selectedcategory]);

    const handleNearbyToggle=()=>{
        if(nearbyMode){
            setNearbyMode(false);
            setUserLocation(null);
            setNearbyVendors([]);
            return;
        }
        if(!navigator.geolocation){
            toast.error("Location is not available in this browser.");
            return;
        }
        setNearbyLoading(true);
        setNearbyVendors([]);
        setNearbyMode(true);
    };

    useEffect(()=>{
        let active=true;
        if(nearbyMode){
            getNearbyProducts();
        }else{
            const url=selectedcategory === "all" ? "/products" : `/products?category=${encodeURIComponent(selectedcategory)}`;
            axios.get(url)
                .then((res)=>{
                    if(active){
                        setProduct(res.data);
                    }
                })
                .catch((error)=>{
                    if(active){
                        console.error("Error fetching products",error);
                        toast.error("Error fetching products");
                    }
                });
        }
        return ()=>{active=false;};
    },[selectedcategory,nearbyMode,getNearbyProducts]);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_BACKEND_URL, {
            withCredentials: true,
        });

        socket.on("productStockUpdate", (updatedProduct) => {
            setProduct((prevProducts) => prevProducts.map((item) =>
                item._id === updatedProduct._id ? updatedProduct : item
            ));
        });

        return () => {
            socket.disconnect();
        };
    }, []);


    return (
        <>
                        <CategoryNavbar selectedCategory={selectedcategory} setSelectedCategory={setSelectedCategory}></CategoryNavbar>
                <Container className="mt-6 products-page-content">
                        {user && (
                            <h2 className="products-page-heading text-center mt-3">
                                <WavingHandIcon /> Hello {user.name} !!
                            </h2>
                        )}
            {/* <Button onClick={()=>setNearbyMode(!nearbyMode)}>{nearbyMode ? "Show All Products" : "Show Nearby Products"}</Button> */}
            {/* <h2>{user ? `Hello, ${user.username} ` : "Welcome Guest"}</h2> */}
             <Fab
               variant="extended"
               onClick={handleNearbyToggle}
               sx={{
                 position: 'fixed',
                 bottom: 16,
                 right: { xs: '50%', sm: 16 },
                 transform: { xs: 'translateX(50%)', sm: 'none' },
                 bgcolor: '#4f72ff',
                 color: '#fff',
                 px: 2.5,
                 boxShadow: '0 16px 36px rgba(79, 114, 255, 0.28)',
                 '&:hover': { bgcolor: '#3a5de6' },
                 zIndex: 1100,
               }}
             >
        <NavigationIcon sx={{ mr: 1, color: '#fff' }} />
        {nearbyMode ? "Show All Products" : "Show Nearby Products"}
      </Fab>
            {nearbyMode && userLocation && (
                <NearbyVendorMap
                    center={userLocation}
                    vendors={nearbyVendors}
                    radiusKm={NEARBY_RADIUS_KM}
                    loading={nearbyLoading}
                />
            )}
            <Row xs={1} md={2} lg={3} className="products-grid">
                
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