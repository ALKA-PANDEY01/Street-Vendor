import axios from "axios";
import {useState} from "react";
import {toast} from "react-toastify";
import {Container, Form, Button,Row,Col} from 'react-bootstrap';
import {useNavigate,useParams} from 'react-router-dom';


export default function login({getUser}){
    const [formData,setFormData]=useState({
        username:"",
        password:"",
    });
    const navigate=useNavigate();
    const loginUser=async (e)=>{
        e.preventDefault();
        try{
            const res=await axios.post("/user/login",formData);
            if(res.status===200){
                console.log("waiting for login");
                await getUser();
                toast.success(res.data.message);
             navigate("/products"); 
            }    
        }catch(err){
            toast.error(err.response?.data?.message || "login failed");
        };
    }
    const handleChange=async(e)=>{
            setFormData({
                ...formData,
                [e.target.name]:e.target.value,
            });
        };

    return (
        <>
        <Container className="mt-5" >
                    <Row className="justify-content-center"><Col md={6} lg={8}>
                    <Form onSubmit={loginUser}>
                        <Form.Group className="mb-3">
                            <Form.Label>Good username</Form.Label>
                            <Form.Control type="text" value={formData.username} name="username" onChange={handleChange} required></Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" value={formData.password} name="password" onChange={handleChange} required></Form.Control>
                        </Form.Group>
                         <Row className="justify-content-center">
                            <Button varient="warning"  type="submit" style={{backgroundColor:"#f15f20", border:"none" , width:"25%"}} className="mb-5 submitbtn">Login</Button>
                        </Row>
                        </Form>
                        </Col>
                        </Row>
                        </Container>
        </>
    )
}