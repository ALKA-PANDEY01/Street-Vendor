import { useState,useEffect } from 'react'
import Navbar from './components/navbar.jsx';
import AddProduct from './pages/addproduct.jsx';
import Product from './pages/products.jsx';
import Show from './pages/show.jsx';
import '@fontsource/roboto/300.css';
import {BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Signup from './pages/signup.jsx';
import Login from './pages/login.jsx';
import axios from 'axios';
import MydashBoard from './pages/mydashboard.jsx';
import Cart from './pages/cart.jsx';
import HeroCrousel from './pages/herocrousel.jsx';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import VendorOrder from './pages/vendorOrder.jsx';
import UserDashboard from './pages/userdashboard.jsx';

import './App.css'

function App() {
  const [user,setUser]=useState(null);
  const [cartCount, setCartCount]=useState(0);
  const [cart, setCart]=useState(null);
  // console.log("user info from app.jsx",user);
  const getUser=async()=>{
    try{
      const res=await axios.get("/user/profile",{
        withCredentials:true
      });
      setUser(res.data);
      console.log("User synced in App",res.data);
      return res.data;
    }catch(err){
      setUser(null);
      console.log("something is wrong in app.jsx",err)
      return null;
    }
  };
  const refreshCart=async()=>{
    try{
      const res=await axios.get("/cart");
      const data=res.data;
      const totalQuantity=data.items.reduce((acc,item)=>acc+item.quantity,0);
      setCartCount(totalQuantity);
      setCart(data);
      console.log("cart data",data)
      
    }catch(error){
      console.log(error);
    }
  }
   useEffect(()=>{
    getUser();
   },[]);

   useEffect(()=>{
    if(user){
      refreshCart();
    }
   },[user])

  return (
    <>
    <Router>
        <Navbar user={user} setUser={setUser} cartCount={cartCount}></Navbar>
      {user  && (
        <h2 className="text-center mt-3" style={{color:"#182b4f"}}>
         <WavingHandIcon /> Hello {user.name} !!
        </h2>
      )}
      <div><ToastContainer></ToastContainer></div>
      <Routes>
        <Route path="/" element={<HeroCrousel></HeroCrousel>}></Route>
        {/* <Route path="/" element={<h1 >All products</h1>}></Route> */}
        <Route path="/products" element={<> <Product user={user}></Product></>}></Route>
        <Route path="/addProduct" element={<><h2 className="text-center mt-3" style={{color:"#182b4f"}}>Add New Product</h2><AddProduct></AddProduct></>}></Route>
        <Route path="/products/:id" element={<><h2 className="text-center mt-3" style={{color:"#182b4f"}}>Viewing Product Details</h2><Show  user={user} refreshCart={refreshCart} ></Show></>}></Route>
        <Route path="/products/:id/edit" element={<><h2 className="text-center mt-3" style={{color:"#182b4f"}}>Editing </h2><AddProduct/></>}></Route>
        <Route path="/user/signup" element={<><h2 className="text-center mt-3" style={{color:"#182b4f"}}>Sign-Up </h2><Signup></Signup></>}></Route>
        <Route path="/user/login" element={<><h2 className="text-center mt-3" style={{color:"#182b4f"}}>Login</h2><Login getUser={getUser}></Login></>}></Route>
        {/* <Route path="/logout" element={<><h2 className="text-center mt-3" style={{color:"#182b4f"}}>Logout</h2></>}></Route> */}
        <Route path="products/mydashboard" element={<MydashBoard user={user}></MydashBoard>}></Route>
        <Route path="/cart" element={<Cart cart={cart} refreshCart={refreshCart}></Cart>}></Route>
        <Route path="/orders/myorders" element={<><VendorOrder user={user}></VendorOrder></>}></Route>
        <Route path="/orders/userorders" element={<><UserDashboard user={user}></UserDashboard></>}></Route>
      </Routes>
    </Router>
     
    </>
  )
}

export default App
