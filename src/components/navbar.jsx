import { Navbar, Nav, Container } from 'react-bootstrap';
import { useState ,useEffect} from 'react'
import "./navbar.css";
import axios from 'axios';
import {Link} from "react-router-dom";
import{useNavigate} from "react-router-dom";
import BrunchDiningIcon from '@mui/icons-material/BrunchDining';
import { toast } from 'react-toastify';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';


export default function navbar({user,setUser,cartCount}){
const [expanded, setExpanded] = useState(false);
const navigate= useNavigate();

  const closeMenu = () => setExpanded(false);

  const handleLogout=async()=>{
    closeMenu();
    try{
      const res=await axios.post("/user/logout");
      toast.success(res.data.message);
      setUser(null);
      navigate("/user/login");
      return;
    }catch(err){
      console.log("logout error",err);
      toast.error("Logout failed");
    }
  }
  

    return(
        <>
        
        <Navbar expanded={expanded} onToggle={setExpanded} expand="lg" className="bg-body-tertiary navbarmain sticky-top" >
      <Container fluid>
        <Navbar.Brand className="links"  href="#home">
            <BrunchDiningIcon  className="nav-icon" ></BrunchDiningIcon>
           <span className="span-text">Street-Vendor</span> 
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="custom-mobile-menu">
          <Nav className="me-auto nav-links-container">
            
            <Nav.Link  className="links" as={Link} to="/products" onClick={closeMenu}>All products</Nav.Link>
             
              {user ? (
              
               <>
               <Nav.Link className="links"   onClick={handleLogout}>Logout</Nav.Link>
               {user.role==="vendor" && (
                 <Nav.Link  className="links" as={Link} to="/products/mydashboard" onClick={closeMenu}>My Dashboard</Nav.Link>
               )}
               {user.role==="user" && (
                <Nav.Link className="links" as={Link} to="/orders/userorders" onClick={closeMenu}>My Orders</Nav.Link>
               )}
               {user.role==="user" && (
                <Nav.Link className="links" as={Link} to="/cart" onClick={closeMenu}><ShoppingCartIcon></ShoppingCartIcon>({cartCount})</Nav.Link>
               )}
              </> 
              ):(
              <>
             <Nav.Link  className="links" as={Link} to="/user/signup" onClick={closeMenu}>Sign-Up /</Nav.Link>
             <Nav.Link  className="links link1" as={Link} to="/user/login" onClick={closeMenu}>Login</Nav.Link>
             
             </>
            )}
           
           
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
        </>
    )
}