import {useEffect, useState} from "react";
import {Container, Button, Row, Col, Badge} from 'react-bootstrap';
import Table from 'react-bootstrap/Table'
import axios from 'axios';
import {toast} from 'react-toastify';
import './show.css';
import {Link} from "react-router-dom";
import socket from "../api/trackingSocket.js";

const getSeenOrderIds=(storageKey)=>{
    try{
        return new Set(JSON.parse(localStorage.getItem(storageKey) || "[]").map(String));
    }catch{
        return new Set();
    }
};

export default function MyDashboard({ user }){
    const [products,setProducts]=useState([]);
    const [unseenorders,setUnseenorders]=useState([]);
    const [activeOrderIds,setActiveOrderIds]=useState([]);

    useEffect(()=>{
        let active=true;
        axios.get("/products/mydashboard")
            .then((res)=>{
                if(active){
                    setProducts(res.data);
                }
            })
            .catch((error)=>console.error("Unable to load dashboard products",error));
        return ()=>{active=false;};
    },[]);

    useEffect(()=>{
        const vendorId=user?.userId;
        if(!vendorId) {
            console.log("User not available in dashboard", user);
            return;
        }

        let active=true;
        const storageKey=`farmkart:seen-orders:${vendorId}`;
        const handleNewOrder=(order)=>{
            console.log("Dashboard: New order received", order);
            toast.info("New order received!");
            const orderId=String(order._id);
            setActiveOrderIds((previous)=>Array.from(new Set([...previous,orderId])));
            if(!getSeenOrderIds(storageKey).has(orderId)){
                setUnseenorders((previous)=>previous.some((item)=>String(item._id) === orderId)
                    ? previous
                    : [...previous,order]);
            }
        };
        socket.on("newOrder",handleNewOrder);
        socket.emit("joinVendorRoom",vendorId);

        axios.get("/orders/myorders")
            .then((res)=>{
                if(!active){
                    return;
                }
                const openOrders=res.data.filter((order)=>order.status !== "Delivered");
                const seenOrderIds=getSeenOrderIds(storageKey);
                setActiveOrderIds((previous)=>Array.from(new Set([
                    ...previous,
                    ...openOrders.map((order)=>String(order._id)),
                ])));
                setUnseenorders((previous)=>{
                    const unseenById=new Map(previous.map((order)=>[String(order._id),order]));
                    openOrders
                        .filter((order)=>!seenOrderIds.has(String(order._id)))
                        .forEach((order)=>unseenById.set(String(order._id),order));
                    return Array.from(unseenById.values());
                });
            })
            .catch((error)=>console.error("Unable to load vendor order notifications",error));

        return ()=>{
            active=false;
            socket.off("newOrder",handleNewOrder);
        };
    }, [user]);

    const markOrdersSeen=()=>{
        const vendorId=user?.userId;
        if(vendorId){
            const storageKey=`farmkart:seen-orders:${vendorId}`;
            const seenOrderIds=getSeenOrderIds(storageKey);
            activeOrderIds.forEach((orderId)=>seenOrderIds.add(String(orderId)));
            try{
                localStorage.setItem(storageKey,JSON.stringify(Array.from(seenOrderIds)));
            }catch(error){
                console.error("Unable to save viewed orders",error);
            }
        }
        setUnseenorders([]);
    };
    const handleDelete=async(id)=>{
        try{
            await axios.delete(`/products/${id}`);
            setProducts(products.filter((p)=>p._id !==id));
        }catch(err){
            console.log("its dashboard.jsx errorr you know",err);
        }
    };
    
    const toggleStock=async(id)=>{
        try{
            const res=await axios.put(`/products/toggle-stock/${id}`)
        
        setProducts(
            products.map((p)=>
            p._id===id ? res.data:p)
        )
    }catch(err){
        console.log("its toggle front ",err);
    }
    }

    return(
        <Container className="mt-5" >
            <Row className="justify-content-center"><Col md={6} lg={8}>
                <h2 className="dashboard-heading">My Dashboard</h2>
                <p>Total Products : {products.length}</p>
                <Link to="/addProduct"><Button className="cardbtn" style={{margin:"1.5rem"}}>Add Product</Button></Link>
                <Link to="/orders/myorders" onClick={markOrdersSeen}>
                    <Button className="cardbtn" style={{margin:"1.5rem", position:"relative"}}>
                        View Orders
                        {unseenorders.length > 0 && (
                            <Badge bg="danger" pill style={{position:"absolute", top:"4px", right:"-6px", fontSize:"0.75rem"}}>
                                {unseenorders.length}
                            </Badge>
                        )}
                    </Button>
                </Link>
                {products.length===0 ?(
                    <p>No products added yet</p>
                ):(<Table striped bordered hover>
                    
                        
      <thead>
        <tr>
          <th>#</th>
          <th>Product name</th>
          <th>Created at</th>
          <th>InStock</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
       { products.map((product)=>(
        <tr key={product._id} >
          <td>&#10084;</td>
          <td><Link to={`/products/${product._id}`} style={{textDecoration:"none", color:"#000"}}>{product.name}</Link></td>
          <td>{new Date(product.createdAt).toLocaleDateString('en-GB')}</td>
          <td><Button onClick={()=>toggleStock(product._id)} 
          style={{
                width:"53px",
                height:"25px",
                borderRadius:"30px",
                border:"none",
                cursor:"pointer",
                position:"relative",
                transition:"0.3s",
                margin:"auto",
                background:"#192a51",
                boxShadow:"0 0 5px #c7d4e1",
                
          }}><div
            style={{
                width:"20px",
                height:"20px",
                borderRadius:"50%",
                
                position:"absolute",
                top:"2.5px",
                
                left:product.inStock ? "33px" : "3px",
                transition:"0.3s",
                
                background:product.inStock ? "#78c0e0" : "#967aa1",
                boxShadow:product.inStock ? "0 1px 10px #81d5f9" : "0 0 15px #a282af"
            }}
          
          ></div></Button></td>
          <td><Button onClick={()=>handleDelete(product._id)} className="delbtn">Delete</Button></td>
          <td><Link to={`/products/${product._id}/edit`} style={{textDecoration:"none"}}><Button className="cardbtn">Edit</Button></Link></td>
        </tr>
    ))}
               </tbody>
               </Table>)}
            </Col>
            </Row>
            </Container>
    )

}