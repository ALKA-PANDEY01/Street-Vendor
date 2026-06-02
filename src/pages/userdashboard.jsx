import {useEffect, useState} from 'react';
import {io} from 'socket.io-client';
import axios from 'axios';
import {toast} from 'react-toastify';
import Table from 'react-bootstrap/Table';
import {Container,Row,Col,Button} from 'react-bootstrap';


const socket=io(import.meta.env.VITE_BACKEND_URL,{
    withCredentials:true,
});

export default function UserDashboard({user}){
    const [orders,setOrders]=useState([]);
    
    const fetchOrders=async()=>{
        try{
            const res=await axios.get("/orders/userorders");
            setOrders(res.data);
        }catch(error){
            console.log("user orders fetching error", error);
        }};

    useEffect(()=>{
        const userId = user?.userId ? user.userId : null;   
        if(!userId) {
            console.log("User ID not available, cannot fetch orders");
            return;
        }
        
        fetchOrders();
        
        // Join user room for real-time updates
        socket.emit("joinUserRoom", userId);
        console.log("User joined room:", userId);
        
        // Listen for order status updates
        const handleOrderStatusUpdate = (updatedOrder) => {
            console.log("Order status updated in user dashboard", updatedOrder);
            setOrders((prevOrders)=>prevOrders.map((order)=>order._id===updatedOrder._id ? updatedOrder : order));
        };

        socket.on("orderStatusUpdate", handleOrderStatusUpdate);

        return () => {
            socket.off("orderStatusUpdate", handleOrderStatusUpdate);
        };
    }, [user]);
        
        
        
    return(
        <>
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col lg={6} sm={12} mb={8}>
                    <h2 className="text-center mb-4" style={{color:"#182b4f"}}>My Orders</h2>
                   {orders.length===0 ? (
                    <p className="text-center">No orders found</p>
                   ) : (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Vendor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order.product.name}</td>
                                    <td>{order.vendor.username}</td>
                                    <td>{order.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                     )}
                </Col>
            </Row>
        </Container>
        </>)}