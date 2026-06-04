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
        const message = error?.response?.data?.message || error?.message || "Failed to place order. Please try again.";
        toast.error(message);
      }
      
    }

    return(
        <>
        
          <tr key={item._id}>
            <td>&#10084;</td>
          <td>{item.productId.name}</td>
          <td><Button className="cardbtn" onClick={increaseQuantity}>+1</Button></td>
          <td><Button className="cardbtn" onClick={decreaseQuantity}>-1</Button></td>
          <td><Button className="delbtn" onClick={deleteItem}>Delete</Button></td>
          <td>{item.quantity}</td>
          <td><AdjustIcon  sx={item.productId.inStock?{color:"green"}: {color:"red"}}></AdjustIcon></td>
          <td>&#8377;{totalprice}</td>
          <td><Button className="submitbtn" onClick={()=>placeOrder(item.productId._id)} disabled={!item.productId.inStock}>
            {item.productId.inStock ? 'Order' : 'Out of stock'}
          </Button></td>
        </tr>
        </>
        
    )
    }

