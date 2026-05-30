import {useEffect, useState} from "react";
import Table from 'react-bootstrap/Table';
import Cartitem from "../components/cartitem.jsx";
import {Container, Form, Button,Row,Col} from 'react-bootstrap';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';


export default function Cart({cart,refreshCart}){
  if(!cart){
    return <p>Loading cart...</p>
  }
  return(
    <>
    <Container className="mt-5" >
            <Row className="justify-content-center"><Col md={9} lg={6} xs={12} >
        <Table striped bordered hover>
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