import React, {useState} from "react";
import Modal from 'react-bootstrap/Modal';
import axios from "axios";
import {toast} from "react-toastify";
import '../pages/show.css';
import Button from 'react-bootstrap/Button';
import {useNavigate,useParams} from 'react-router-dom';



export default function addToCartModal({product ,closeModal,refreshCart ,user}){
    const[quantity,setQuantity]=useState(1);
    const totalprice=product.price * quantity;

    const[loading,setLoading]=useState(false);
    const navigate=useNavigate();
    
    const increaseQuantity=()=>{
        setQuantity((prev)=>prev+1);
    };

    const decreaseQuantity=()=>{
        if(quantity>1){
        setQuantity((prev)=>prev-1);
    }};


    const handleAddToCart=async (e)=>{
     if(!user){
      toast.error("You have not logged in yet!!");
      navigate("/user/login");
      return;
     }
     if(user.role === "vendor"){
      toast.info("You have to be a user for adding product to cart");
      return;
     }
     else if(product.inStock===false){
      toast.error("Sorry!! Product is not in stock")
     }else{
      
        try{
            setLoading(true);

            await axios.post("/cart/add",
                {
                    productId:product._id,
                    quantity,
                }
            );
            toast.success(`${quantity}${product.quantity} ${product.name} added to cart`);
            refreshCart();
            closeModal();
        }catch(error){
            toast.error("failed to add item",error)
        }
        finally{
            setLoading(false);
        }
    }}
  

    return(
        <div
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
    >
      <Modal.Dialog>
        <Modal.Header >
          <Modal.Title>Add To Cart</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Price :-&#8377;{product.price}*{quantity} =&#8377;{totalprice}</p>
          <Button className="cardbtn" onClick={decreaseQuantity} style={{marginRight:"8rem"}}>-1</Button>
          <Button className="cardbtn" onClick={increaseQuantity}>+1</Button>
        </Modal.Body>

        <Modal.Footer>
          <Button className="delbtn" style={{backgroundColor:"#4F5D75"}} onClick={closeModal}>cancel</Button>
          <Button className="delbtn" style={{backgroundColor:"#4F5D75"}} disabled={loading} onClick={handleAddToCart}>{loading? "Adding..." : "Confirm"}</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
    )}
