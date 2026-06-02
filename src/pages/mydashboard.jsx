import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Container, Form, Button, Row, Col, Badge} from 'react-bootstrap';
import Table from 'react-bootstrap/Table'
import axios from 'axios';
import {io} from 'socket.io-client';
import './show.css';
import {useParams, Link} from "react-router-dom";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
    withCredentials: true,
});

socket.on("connect", () => {
    console.log("Dashboard socket connected:", socket.id);
});

socket.on("disconnect", () => {
    console.log("Dashboard socket disconnected");
});

export default function mydasboard({ user }){
    const [products,setProducts]=useState([]);
    const [unseenorders,setUnseenorders]=useState([]);
    const navigate=useNavigate();

    const fetchProducts=async()=>{
        try{
            const res=await axios.get("/products/mydashboard");
            setProducts(res.data);
        }catch(err){
            console.log("its dashboard.jsx errorr you know2",err);
        }
    }
    useEffect(()=>{
        fetchProducts();
    },[]);

    useEffect(()=>{
        if(!user?.userId) {
            console.log("User not available in dashboard", user);
            return;
        }

        console.log("Dashboard: Joining vendor room with ID:", user.userId);
        socket.emit("joinVendorRoom", user.userId);
        
        socket.on("newOrder", (order)=>{
            console.log("Dashboard: New order received", order);
            setUnseenorders((prevOrders)=>[...prevOrders, order]);
        });

        return ()=>{
            socket.off("newOrder");
        };
    }, [user]);
    const handleDelete=async(id)=>{
        try{
            const res=await axios.delete(`/products/${id}`);
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
                <h2>My Dashboard</h2>
                <p>Total Products : {products.length}</p>
                <Link to="/addProduct"><Button className="cardbtn" style={{margin:"1.5rem"}}>Add Product</Button></Link>
                <Link to="/orders/myorders" onClick={()=>setUnseenorders([])}>
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
          <td><Button onClick={()=>handleDelete(product._id)} className="delbtn" style={{backgroundColor:"#4F5D75"}}>Delete</Button></td>
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