import {useState,useEffect} from 'react';
import {Container, Form, Button,Row,Col} from 'react-bootstrap';
import axios from 'axios';
import {useNavigate,useParams} from 'react-router-dom';
import './addproduct.css';
import { toast } from 'react-toastify';
export default function addproduct(){
    const{id}=useParams();
    const isEdit=!!id;
    const[formData,setFormData]=useState({
            name: '',
            price: '',
            category:'',
            description:'',
            image:'',
            vendorName:'',
            quantity:'',
            inStock:true,
            address:"",
            lat:"",
            lng:"",
        });
        const navigate=useNavigate();
        const [useLiveLocation, setUseLiveLocation]=useState(false);

        const handleLiveLocation=()=>{
            navigator.geolocation.getCurrentPosition(
                (position)=>{
                    setFormData((prev)=>({
                        ...prev,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }));
                    setUseLiveLocation(true);
                },
                (error)=>{
                    console.error("Geolocation error", error);
                    setUseLiveLocation(false);
                    toast.error("Unable to get live location. Please allow location access or enter an address.");
                }
            )
        }
        useEffect(()=>{
            if(isEdit && id){
                axios.get(`/products/${id}`)
                .then((res)=>setFormData(res.data))
                .catch((err)=>console.error("Error fetching3 product :",err))
            }
        },[id,isEdit])

        const handleChange=async(e)=>{
            const{name,value,type}=e.target;
            setFormData((prevData)=>({
                ...prevData,
                [name]:type==="number"? Number(value):value,
            }));
        };
        const handleSubmit=async(e)=>{
            e.preventDefault();
            console.log("sending data: ",formData);
            if(!formData.name || !formData.image || !formData.price || !formData.description || !formData.vendorName || !formData.category || !formData.quantity){
                toast.error("Please fill in all required fields before submitting.");
                return;
            }
            if(!useLiveLocation && !formData.address){
                toast.error("Please enter an address or enable live location.");
                return;
            }
            if(useLiveLocation && (!formData.lat || !formData.lng)){
                toast.error("Unable to get live location. Please allow locati  on access or enter address.");
                return;
            }
            try{
                const data=new FormData();
                Object.keys(formData).forEach((key)=>{
                    data.append(key, formData[key]);
                });
                if(useLiveLocation){
                    data.append("useLiveLocation", typeof useLiveLocation ==="object" ?
                        JSON.stringify(useLiveLocation) : useLiveLocation.toString()
                    );
                }
                if(isEdit){
                    await axios.put(`/products/${id}`,data,{
                        headers:{
                            "Content-Type":"multipart/form-data"
                        }
                    });
                    toast.success("Product updated successfully!");
                    console.log("updated");
                }else{
                    await axios.post("/products/addproduct",data , {
                        headers:{
                            "Content-Type":"multipart/form-data"
                        }
                    });
                    toast.success("Product added successfully!");
                }
                console.log("navigating to the all products");
                navigate("/products");           
            }
            catch(error){
                console.error("erro adding product ", error?.response?.data?.message || error.message);
                toast.error("Something went wrong. Please try again.",error.message);
            }};

        

    return(
        <>
        <Container className="mt-5" >
            <Row className="justify-content-center"><Col md={6} lg={8}>
            <Form onSubmit={handleSubmit} encType="multipart/form-data">
                <Form.Group className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control type="text" value={formData.name} name="name" onChange={handleChange} required></Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Put image url</Form.Label>
                    <Form.Control type="file" name="image" placeholder="Paste image url" onChange={(e)=>handleChange({target:{name:"image", value:e.target.files[0]}})}  required></Form.Control>
                </Form.Group>

                    <Row className="mb-3">
                        <Col md={6}>
                    <Form.Group >
                    <Form.Label>Price(&#8377;)</Form.Label>
                    <Form.Control type="number" name="price" onChange={handleChange} value={formData.price} required></Form.Control>
                </Form.Group></Col>
                <Col md={6}>
                <Form.Group>
                    <Form.Label>Quantity type</Form.Label>
                    <Form.Select type="text" value={formData.quantity} name="quantity" onChange={handleChange} required>
                    <option value="" disabled hidden>Select type</option>
                    <option value="kg">kg</option>
                    <option value="psc">psc</option>
                    <option value="dzn">dzn</option>
                    <option value="pac">pac</option>
                    <option value="lt">Lt</option>
                    </Form.Select>   
                </Form.Group>
                </Col></Row>
                
                <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select type="text" value={formData.category} name="category" onChange={handleChange} required>
                    <option value="" disabled hidden>Select Category</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Street Food">Street Food</option>
                    <option value="dairy">Dairy</option>
                    </Form.Select>
                    
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} required></Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Your Name (Vendor)</Form.Label>
                    <Form.Control type="text" name="vendorName" value={formData.vendorName}onChange={handleChange} required></Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control type="text" value={formData.address} name="address" disabled={useLiveLocation} onChange={handleChange}></Form.Control>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Check type="switch" label="is this in stock?" name="inStock" checked={formData.inStock} onChange={(e)=>{
                        setFormData({
                            ...formData, inStock: e.target.checked
                        })
                    }} style={{color:"#f15f20"}}/>              
                    </Form.Group>
                    <Form.Group className="mb-3">
                    <Form.Check type="switch" label="Use Live Location" name="useLiveLocation" disabled={formData.address} checked={useLiveLocation} onChange={(e)=>{
                        if(e.target.checked){
                            handleLiveLocation();
                        }else{
                            setUseLiveLocation(false);
                            setFormData((prev)=>({
                                ...prev,
                                lat:"",
                                lng:"",
                            }))
                        }
                    }} style={{color:"#f15f20"}}/>              
                    </Form.Group>
                <Row className="justify-content-center">
                    <Button varient="warning"  type="submit" style={{backgroundColor:"#f15f20", border:"none" , width:"30%"}} className="mb-5 submitbtn">{isEdit ? "Save changes" : "Add Product"}</Button>
                </Row>
                
                </Form>
           
            </Col></Row>
            </Container>
            
        </>
    )
}