import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {io} from 'socket.io-client';
import {toast} from 'react-toastify';
import Table from 'react-bootstrap/Table';
import {Container,Row,Col,Button} from 'react-bootstrap';  
import './show.css'; 


const socket=io(import.meta.env.VITE_SERVER_URL,{
    withCredentials:true,
});

export default function VendorOrder({user}){
    const [orders,setOrders]=useState([]);
    
    
    const fetchOrders=async()=>{
       const res=await axios.get("/orders/myorders");
        const visibleOrders = res.data.filter((order)=>order.status !== "Delivered");
        setOrders(visibleOrders);
        console.log("Vendor orders",visibleOrders);
    };
    useEffect(()=>{
        const vendorId = user?.userId ? user.userId : null;
        if(!vendorId) {
            console.log("Vendor ID not available, cannot fetch orders");
            return;
        }
        if(vendorId) {
        fetchOrders();
        // Join vendor room for real-time updates
        socket.emit("joinVendorRoom", vendorId);

        // New order notification
        socket.on("newOrder",(order)=>{
            console.log("New order received in dashboard", order);
            toast.info("New order received!");
            setOrders((prevOrders)=>[order,...prevOrders]);
        })}}, [user]);

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

    useEffect(()=>{
        socket.on("orderStatusUpdate",(updatedOrder)=>{
            if(updatedOrder.status === "Delivered"){
                setOrders((prevOrders)=>prevOrders.filter((order)=>order._id!==updatedOrder._id));
                return;
            }
            setOrders((prevOrders)=>prevOrders.map((order)=>order._id===updatedOrder._id ? updatedOrder : order));
        });

        return ()=>{
            socket.off("orderStatusUpdate");
        };
    }, []);

    return(
        <>
        <Container className="mt-5" >
            <Row className="justify-content-center"><Col md={6} lg={8}>
                <h2>My Orders</h2>
                <p>Total Orders : {orders.length}</p>
        <Table striped bordered hover>
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
                                <Button className="deldbtn" style={{ backgroundColor: '#57b8d3', borderColor: '#2b6362' }} onClick={()=>updateStatus(order._id,"Accepted")}>Accept</Button>
                            )}
                        
                            {order.status==="Accepted" && (
                                <Button  className="deldbtn" style={{ backgroundColor: '#ab3ddf', borderColor: '#451364' }} onClick={()=>updateStatus(order._id,"Preparing")}>Mark as Preparing</Button>
                            )}  
                            {order.status==="Preparing" && (
                                <Button className="delbtn" style={{ backgroundColor: '#7ae714', borderColor: '#1f761a' }} onClick={()=>updateStatus(order._id,"Delivered")}>Mark as Delivered</Button>
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