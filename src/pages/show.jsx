import {useState,useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import {useParams, Link} from "react-router-dom";
import axios from 'axios';
import { io } from 'socket.io-client';
import {Card,Button,Container,Row,Col} from 'react-bootstrap';
import './show.css';
import { toast } from 'react-toastify';
import AdjustIcon from '@mui/icons-material/Adjust';
import AddToCartModal from "../components/addtocartmodal.jsx";
import RatingSummary from "../components/ratingsummary.jsx";
import ReviewForm from "../components/reviewform.jsx";
import ReviewList from "../components/reviewlist.jsx";

export default function Show({refreshCart,user}){
    const {id}=useParams();
    const [product, setProduct]=useState(null);
    const[loading,setLoading]=useState(true);
    const[openModal,setOpenModal]=useState(false);
    const[eligibleOrder,setEligibleOrder]=useState(null);
    const[reviewVersion,setReviewVersion]=useState(0);
    const navigate=useNavigate();

    const handleAddCartClick = () => {
        if (!user) {
            toast.info("You need to be a user to add products to cart");
            navigate("/user/login");
            return;
        }

        if (user.role === "vendor") {
            toast.info("You have to be a user for adding product to cart");
            return;
        }

        setOpenModal(true);
    };

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

    useEffect(()=>{
        if(!user || !product){
            return;
        }

        let active=true;
        axios.get("/orders/userorders")
            .then((res)=>{
                const deliveredOrder=res.data.find((order)=>{
                    const orderProductId=order.product?._id || order.product;
                    return order.status === "Delivered" && orderProductId?.toString() === product._id.toString();
                });
                if(active){
                    setEligibleOrder(deliveredOrder || null);
                }
            })
            .catch(()=>{
                if(active){
                    setEligibleOrder(null);
                }
            });

        return ()=>{active=false;};
    },[user,product]);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_BACKEND_URL, {
            withCredentials: true,
        });

        const handleStockUpdate = (updatedProduct) => {
            if (updatedProduct._id === id) {
                setProduct(updatedProduct);
                toast.info(`Product stock updated: ${updatedProduct.inStock ? 'In stock' : 'Out of stock'}`);
            }
        };

        socket.on("productStockUpdate", handleStockUpdate);

        return () => {
            socket.off("productStockUpdate", handleStockUpdate);
            socket.disconnect();
        };
    }, [id]);
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

    const vendorId=product.owner?._id || product.owner;
    const handleReviewSuccess=()=>setReviewVersion((version)=>version+1);

    return(
        <>
        <Container  className="mt-4 container " >
            <Row className="justify-content-center"><Col md={6} lg={7}>
                <Card style={{width:"100%"}} className="card">
                    <Row className="justify-content-center">
                        <Card.Img className="cardimg" variant="top" src={product.image.url} style={{width:"83%",height:"17rem"}}/>
                    </Row>
      <Card.Body>
        <Card.Title className="mt-2">{product.name}</Card.Title>
        <Card.Text className="doc">{product.description}</Card.Text>
        <Card.Text className="doc">&#8377;{product.price}/{product.quantity}</Card.Text>
        <Card.Text className="doc">{product.category}</Card.Text>
        <Card.Text className="doc">inStock:<AdjustIcon  sx={product.inStock?{color:"green"}: {color:"red"}}></AdjustIcon></Card.Text>
        <Card.Text className="doc">{product.vendorName}</Card.Text>
        <Button onClick={handleAddCartClick}
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
    <div className="detail-rating-panel">
        <div>
            <span className="detail-rating-label">Product rating</span>
            <RatingSummary targetType="product" targetId={product._id} />
        </div>
        {vendorId && (
            <div>
                <span className="detail-rating-label">Vendor rating</span>
                <RatingSummary targetType="vendor" targetId={vendorId} />
            </div>
        )}
    </div>
    </Col>
            </Row></Container>
        <Container className="review-section">
            <div className="review-section-heading">
                <h2>Product reviews</h2>
                <RatingSummary targetType="product" targetId={product._id} />
            </div>
            <ReviewForm
                targetType="product"
                targetId={product._id}
                orderId={eligibleOrder?._id}
                user={user}
                onSuccess={handleReviewSuccess}
            />
            <ReviewList
                targetType="product"
                targetId={product._id}
                refreshKey={reviewVersion}
            />
            {vendorId && (
                <>
                    <div className="review-section-heading vendor-review-heading">
                        <h2>Vendor reviews</h2>
                        <RatingSummary targetType="vendor" targetId={vendorId} />
                    </div>
                    <ReviewForm
                        targetType="vendor"
                        targetId={vendorId}
                        orderId={eligibleOrder?._id}
                        user={user}
                        onSuccess={handleReviewSuccess}
                    />
                    <ReviewList
                        targetType="vendor"
                        targetId={vendorId}
                        refreshKey={reviewVersion}
                    />
                </>
            )}
        </Container>
        </>
    )
}