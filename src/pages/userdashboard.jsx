import {Fragment,useEffect, useState} from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import {Container,Row,Col,Button} from 'react-bootstrap';
import DeliveryTrackingMap from '../components/deliverytrackingmap.jsx';
import socket from '../api/trackingSocket.js';

export default function UserDashboard({user}){
    const [orders,setOrders]=useState([]);

    useEffect(()=>{
        let active=true;
        const userId = user?.userId ? user.userId : null;   
        if(!userId) {
            console.log("User ID not available, cannot fetch orders");
            return ()=>{active=false;};
        }

        axios.get("/orders/userorders")
            .then((res)=>{
                if(active){
                    setOrders(res.data);
                }
            })
            .catch((error)=>console.error("User orders fetching error",error));
        
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
            active=false;
            socket.off("orderStatusUpdate", handleOrderStatusUpdate);
        };
    }, [user]);
        
        
        
    return(
        <>
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col lg={6} sm={12} mb={8}>
                    <h2 className="text-center mb-4 dashboard-heading">My Orders</h2>
                   {orders.length===0 ? (
                    <p className="text-center">No orders found</p>
                   ) : (
                    <Table responsive striped bordered hover>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Vendor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <Fragment key={order._id}>
                                    <tr>
                                        <td>{order.product?.name || "Product"}</td>
                                        <td>{order.vendor?.username || "Vendor"}</td>
                                        <td>{order.status}</td>
                                    </tr>
                                    {!['Delivered','Rejected'].includes(order.status) && (
                                        <tr>
                                            <td colSpan="3">
                                                <DeliveryTrackingMap
                                                    orderId={order._id}
                                                    initialLocation={order.deliveryLocation}
                                                    fallbackLocation={order.product?.location}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </Table>
                     )}
                </Col>
            </Row>
        </Container>
        </>)}