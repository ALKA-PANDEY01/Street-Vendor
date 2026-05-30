import axios from "axios";
import {useState} from "react";
import {toast} from "react-toastify";
import {Container, Form, Button,Row,Col} from 'react-bootstrap';
import {useNavigate,useParams} from 'react-router-dom';

export default function signup(){
    const[formData,setFormData]=useState({
        username:"",
        email:"",
        password:"",
        role:"",
    });
    const navigate=useNavigate();
    const handleChange=async(e)=>{
            setFormData({
                ...formData,
                [e.target.name]:e.target.value,
            });
        };
    const handleSubmit=async (e)=>{
        e.preventDefault();
            console.log("sending data: ",formData);
        try{
            const res=await axios.post("/user/signup",formData);
            console.log("sending user data",formData);
            toast.success(res.data.message || "Registerd successfully");
            navigate("/products"); 
        }catch(err){
            toast.error(err.response?.data?.message || "Registration failed");
        }
    }
    

    return(
        <>
        <Container className="mt-5" >
                    <Row className="justify-content-center"><Col md={6} lg={8}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Your good name</Form.Label>
                            <Form.Control type="text" value={formData.username} name="username" onChange={handleChange} required></Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Gopniya Email</Form.Label>
                            <Form.Control type="text" value={formData.email} name="email" onChange={handleChange} required></Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Easy Password</Form.Label>
                            <Form.Control type="text" value={formData.password} name="password" onChange={handleChange} required></Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                    <Form.Label>Aapka role</Form.Label>
                    <Form.Select type="text" value={formData.role} name="role" onChange={handleChange} >
                    <option value="" disabled hidden>Select role</option>
                    <option value="user">User</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                    </Form.Select>   
                </Form.Group>
                        <Row className="justify-content-center">
                            <Button varient="warning"  type="submit" style={{backgroundColor:"#f15f20", border:"none" , width:"25%"}} className="mb-5 submitbtn">Sign-Up</Button>
                        </Row>
                        
                        </Form>
                        </Col>
                        </Row>
                        </Container>
                        </>
    )
};


 