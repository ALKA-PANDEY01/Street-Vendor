import {useEffect} from "react";
import Table from 'react-bootstrap/Table';
import Cartitem from "../components/cartitem.jsx";
import {Container, Form, Button,Row,Col} from 'react-bootstrap';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

export default function Cart({cart,refreshCart}){
  useEffect(()=>{
      const socket = io(import.meta.env.VITE_BACKEND_URL, {
          withCredentials: true,
      });

      const handleStockUpdate = (updatedProduct) => {
          if(cart?.items?.some((item) => item.productId._id === updatedProduct._id)){
              toast.info(`Product ${updatedProduct.name} is now ${updatedProduct.inStock ? 'in stock' : 'out of stock'}`);
              refreshCart();
          }
      };

      socket.on("productStockUpdate", handleStockUpdate);

      return () => {
          socket.off("productStockUpdate", handleStockUpdate);
          socket.disconnect();
      };
  }, [cart, refreshCart]);

  if(!cart){
    return <p>Loading cart...</p>
  }
  return(
    <>
    <Container className="mt-5" >
            <Row className="justify-content-center"><Col md={9} lg={6} xs={12} >
        <Table responsive striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Product Name</th> 
          <th><ArrowUpwardIcon></ArrowUpwardIcon>Quantity</th>
          <th><ArrowDownwardIcon></ArrowDownwardIcon>Quantity</th>
          <th>Delete</th>
          <th>Quantity</th>
          <th>inStock</th>
          <th>Total price</th>
          <th>Place Order</th>
        </tr>
      </thead>
      <tbody>
        {
        cart?.items?.map(item=>(
          <Cartitem
          key={item._id}
          item={item}
          refreshCart={refreshCart}></Cartitem>
        ))
      }
      </tbody>
      </Table>
      </Col>
      </Row>
      </Container>
      
    </>
  )
}