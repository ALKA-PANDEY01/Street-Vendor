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
    const[reviewedTargets,setReviewedTargets]=useState({product:false,vendor:false});
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
        if(!user || user.role !== "user" || !product){
            return;
        }

        const vendorId=product.owner?._id || product.owner;
        let active=true;
        axios.get("/orders/userorders")
            .then(async(res)=>{
                const deliveredOrder=res.data.find((order)=>{
                    const orderProductId=order.product?._id || order.product;
                    return order.status === "Delivered" && orderProductId?.toString() === product._id.toString();
                });

                if(!deliveredOrder){
                    if(active){
                        setEligibleOrder(null);
                        setReviewedTargets({product:false,vendor:false});
                    }
                    return;
                }

                const targets=[
                    axios.get(`/api/reviews/product/${product._id}/mine`,{params:{orderId:deliveredOrder._id}}),
                ];
                if(vendorId){
                    targets.push(axios.get(`/api/reviews/vendor/${vendorId}/mine`,{params:{orderId:deliveredOrder._id}}));
                }
                const responses=await Promise.all(targets);
                if(active){
                    setEligibleOrder(deliveredOrder);
                    setReviewedTargets({
                        product:Boolean(responses[0].data.review),
                        vendor:Boolean(responses[1]?.data.review),
                    });
                }
            })
            .catch(()=>{
                if(active){
                    setEligibleOrder(null);
                    setReviewedTargets({product:false,vendor:false});
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
    const handleReviewSuccess=(targetType)=>{
        setReviewedTargets((current)=>({...current,[targetType]:true}));
        setReviewVersion((version)=>version+1);
    };

    const renderReviewForm=(targetType,targetId)=>{
        if(!user){
            return <ReviewForm targetType={targetType} targetId={targetId} user={user}/>;
        }
        if(user.role !== "user"){
            return null;
        }
        if(!eligibleOrder){
            return <p className="review-eligibility-message">You can review this after your delivered order.</p>;
        }
        if(reviewedTargets[targetType]){
            return <p className="review-eligibility-message">You already reviewed this {targetType} for this order.</p>;
        }
        return (
            <ReviewForm
                targetType={targetType}
                targetId={targetId}
                orderId={eligibleOrder._id}
                user={user}
                onSuccess={()=>handleReviewSuccess(targetType)}
            />
        );
    };

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
    </Col>
            </Row></Container>
        <Container className="review-section">
            <div className="review-section-heading">
                <h2>Product reviews</h2>
                <RatingSummary targetType="product" targetId={product._id} showEmpty />
            </div>
            {renderReviewForm("product",product._id)}
            <ReviewList
                targetType="product"
                targetId={product._id}
                refreshKey={reviewVersion}
            />
            {vendorId && (
                <>
                    <div className="review-section-heading vendor-review-heading">
                        <h2>Vendor reviews</h2>
                        <RatingSummary targetType="vendor" targetId={vendorId} showEmpty />
                    </div>
                    {renderReviewForm("vendor",vendorId)}
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