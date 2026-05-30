import Table from 'react-bootstrap/Table';
import {Container, Form, Button,Row,Col} from 'react-bootstrap';
import axios from 'axios';
import AdjustIcon from '@mui/icons-material/Adjust';
import '../pages/show.css';
import {toast} from "react-toastify";

export default function cart({item, refreshCart}){
    const totalprice=item.productId.price * item.quantity;
    const increaseQuantity=async()=>{
       const res= await axios.put(`/cart/increase/${item.productId._id}`);
        refreshCart();
    }
    const decreaseQuantity=async()=>{
       const res= await axios.put(`/cart/decrease/${item.productId._id}`);
        refreshCart();
    }
    const deleteItem=async()=>{
       const res= await axios.delete(`/cart/delete/${item.productId._id}`);
        refreshCart();
    }
    const placeOrder=async(productId)=>{
      try{
        const res=await axios.post("/orders/placeorder",{productId});
        toast.success(`${item.productId.name}: ${res.data.message}`);
        refreshCart();
      }catch(error){
        toast.error("Failed to place order. Please try again.");
      }
      
    }

    return(
        <>
        
          <tr key={item._id}>
            <td>&#10084;</td>
          <td>{item.productId.name}</td>
          <td><Button className="cardbtn" onClick={increaseQuantity}>+1</Button></td>
          <td><Button className="cardbtn" onClick={decreaseQuantity}>-1</Button></td>
          <td><Button className="delbtn" style={{backgroundColor:"#4F5D75"}} onClick={deleteItem}>Delete</Button></td>
          <td>{item.quantity}</td>
          <td><AdjustIcon  sx={item.productId.inStock?{color:"green"}: {color:"red"}}></AdjustIcon></td>
          <td>&#8377;{totalprice}</td>
          <td><Button className="delbtn" onClick={()=>placeOrder(item.productId._id)} style={{backgroundColor:"#1896a4"}}>&#x2698;&#x273F;&#x2740;</Button></td>
        </tr>
        </>
        
    )
    }

