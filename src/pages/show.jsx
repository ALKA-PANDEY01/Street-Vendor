import {useState,useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import {useParams, Link} from "react-router-dom";
import axios from 'axios';
import {Card,Button,Container,Row,Col} from 'react-bootstrap';
import './show.css';
import { toast } from 'react-toastify';
import AdjustIcon from '@mui/icons-material/Adjust';
import AddToCartModal from "../components/addtocartmodal.jsx";

export default function show({refreshCart,user}){
    const {id}=useParams();
    const [product, setProduct]=useState(null);
    const[loading,setLoading]=useState(true);
    const[openModal,setOpenModal]=useState(false);
    const navigate=useNavigate();

    useEffect(()=>{
        axios.get(`/products/${id}`)
        .then((res)=>{
            setProduct(res.data);
            console.log("fetched product details :",res.data);
            setLoading(false);
            return;
        })
        .catch((err)=>{
            toast.error("Error fetching product details");
            console.error("Error fetching product details :", err);
            setLoading(false);
        })
    },[id]);
    // const handleDelete=async(id)=>{
    //     console.log(product);
    //     console.log("type of id being passed :", typeof id);
    //     if(!id || typeof id ==='undefined'){
    //         console.log("criticlal error ur trying to delete an invalid id ")
    //     }
    //     const userConfirmed=window.confirm("Are you sure to delete this product?? This action cannot be undone")
    //     if(!userConfirmed){
    //         return;
    //     }
    //     try{
    //         await axios.delete(`/api/products/${id}`);
    //         toast.success("Product deleted sucessfully !!");
    //         navigate("/products");
    //     }catch(error){
    //         toast.error(`error deleting product ${error.message}`);
    //     }
    // }

    if (loading) return <div>Loading...</div>
    if(!product) return <div>No product existed</div>

    return(
        <>
        <Container  className="mt-4 container " >
            <Row className="justify-content-center"><Col md={6} lg={7}>
                <Card style={{width:"100%", height:"55vh" }} className="card">
                    <Row className="justify-content-center">
                        <Card.Img className="cardimg" variant="top" src={product.image} style={{width:"83%",height:"17rem"}}/>
                    </Row>
      <Card.Body>
        <Card.Title className="mt-2">{product.name}</Card.Title>
        <Card.Text className="doc">{product.description}</Card.Text>
        <Card.Text className="doc">&#8377;{product.price}/{product.quantity}</Card.Text>
        <Card.Text className="doc">{product.category}</Card.Text>
        <Card.Text className="doc">inStock:<AdjustIcon  sx={product.inStock?{color:"green"}: {color:"red"}}></AdjustIcon></Card.Text>
        <Card.Text className="doc">{product.vendorName}</Card.Text>
        <Button onClick={()=> setOpenModal(true)}
            className="cardbtn">Add to cart
        </Button>
        
        {openModal && (
            <div className="modaloverlay">
            < div className="modalbox">
            <AddToCartModal user={user} product={product} closeModal={()=>setOpenModal(false)} refreshCart={refreshCart}></AddToCartModal>
            </div>
            </div>
        )}
        
      </Card.Body>
    </Card>
    </Col>
            </Row></Container>
        
        </>
    )
}