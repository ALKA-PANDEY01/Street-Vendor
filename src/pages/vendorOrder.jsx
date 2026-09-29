import {useEffect, useState} from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';
import Table from 'react-bootstrap/Table';
import {Container,Row,Col,Button} from 'react-bootstrap';  
import './show.css'; 
import socket from '../api/trackingSocket.js';

function DeliveryLocationShare({orderId}){
    const [sharing,setSharing]=useState(false);

    useEffect(()=>{
        if(!sharing){
            return;
        }
        const watchId=navigator.geolocation.watchPosition(
            (position)=>{
                socket.emit("deliveryLocationUpdate",{
                    orderId,
                    latitude:position.coords.latitude,
                    longitude:position.coords.longitude,
                },(response)=>{
                    if(!response?.ok){
                        setSharing(false);
                        toast.error(response?.message || "Unable to share delivery location");
                    }
                });
            },
            (error)=>{
                setSharing(false);
                toast.error(error.message || "Unable to get delivery location");
            },
            {enableHighAccuracy:true,maximumAge:5000,timeout:15000}
        );
        return ()=>navigator.geolocation.clearWatch(watchId);
    },[orderId,sharing]);

    const toggleSharing=()=>{
        if(!navigator.geolocation){
            toast.error("Location is not available in this browser.");
            return;
        }
        setSharing((current)=>!current);
    };

    return (
        <Button
            size="sm"
            variant={sharing ? "outline-danger" : "outline-success"}
            onClick={toggleSharing}
        >
            {sharing ? "Stop sharing" : "Share live location"}
        </Button>
    );
}

export default function VendorOrder({user}){
    const [orders,setOrders]=useState([]);

    useEffect(()=>{
        let active=true;
        const vendorId = user?.userId ? user.userId : null;
        if(!vendorId) {
            console.log("Vendor ID not available, cannot fetch orders");
            return ()=>{active=false;};
        }

        axios.get("/orders/myorders")
            .then((res)=>{
                if(active){
                    const visibleOrders=res.data.filter((order)=>order.status !== "Delivered");
                    setOrders(visibleOrders);
                    console.log("Vendor orders",visibleOrders);
                }
            })
            .catch((error)=>{
                if(active){
                    console.error("Vendor orders fetching error",error);
                    toast.error("Unable to load orders");
                }
            });
        
        // Join vendor room for real-time updates
        socket.emit("joinVendorRoom", vendorId);
        console.log("Vendor joined room:", vendorId);

        // New order notification
        const handleNewOrder = (order) => {
            console.log("New order received in vendor dashboard", order);
            toast.info("New order received!");
            setOrders((prevOrders)=>[order,...prevOrders]);
        };

        // Order status update notification
        const handleOrderStatusUpdate = (updatedOrder) => {
            console.log("Order status updated in vendor dashboard", updatedOrder);
            if(updatedOrder.status === "Delivered"){
                setOrders((prevOrders)=>prevOrders.filter((order)=>order._id!==updatedOrder._id));
                return;
            }
            setOrders((prevOrders)=>prevOrders.map((order)=>order._id===updatedOrder._id ? updatedOrder : order));
        };

        socket.on("newOrder", handleNewOrder);
        socket.on("orderStatusUpdate", handleOrderStatusUpdate);

        return () => {
            active=false;
            socket.off("newOrder", handleNewOrder);
            socket.off("orderStatusUpdate", handleOrderStatusUpdate);
        };
    }, [user]);

    const updateStatus=async(orderId,status)=>{
        try{
            const res=await axios.put(`/orders/update-status/${orderId}`, {status});
            console.log("Updated order",res.data);
            toast.success("Order status updated");

            if(status === "Delivered"){
                setOrders((prevOrders)=>prevOrders.filter((order)=>order._id!==orderId));
                return;
            }

            const updatedOrder=res.data.order;
            setOrders((prevOrders)=>prevOrders.map((order)=>order._id===updatedOrder._id ? updatedOrder : order));
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status");
        }
    }

    return(
        <>
        <Container className="mt-5" >
            <Row className="justify-content-center"><Col md={6} lg={8}>
                <h2>My Orders</h2>
                <p>Total Orders : {orders.length}</p>
        <Table responsive striped bordered hover>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {orders.length===0 ? (
                    <tr>
                        <td colSpan="6" style={{textAlign:"center"}}>No orders yet</td>
                    </tr>
                ) : (
                    orders.map((order)=>(
                    <tr key={order._id}>
                        <td>{order.product.name}</td>
                        <td>{order.quantity}</td>
                        <td>₹{order.totalPrice}</td>
                        <td>{order.userId.username} ({order.userId.email})</td>
                        <td>{order.status}</td>
                        <td>
                            {order.status==="Pending" && (
                                <Button className="status-btn accept-btn" onClick={()=>updateStatus(order._id,"Accepted")}>Accept</Button>
                            )}
                        
                            {order.status==="Accepted" && (
                                <Button className="status-btn preparing-btn" onClick={()=>updateStatus(order._id,"Preparing")}>Mark as Preparing</Button>
                            )}  
                            {order.status==="Preparing" && (
                                <>
                                    <DeliveryLocationShare orderId={order._id}/>
                                    <Button className="status-btn delivered-btn" onClick={()=>updateStatus(order._id,"Delivered")}>Mark as Delivered</Button>
                                </>
                            )}
                            </td>
                            
                    </tr>
                    ))
                )}
                
            </tbody>
        </Table>
        </Col></Row>
        </Container>
            
        </>
    )}