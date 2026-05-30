import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import react from 'react';
import Button from 'react-bootstrap/Button';
import "./categorynavbar.css";
// import StorefrontIcon from '@mui/icons-material/Storefront';
// import AnchorIcon from '@mui/icons-material/Anchor';
// import ApiIcon from '@mui/icons-material/Api';
// import AvTimerIcon from '@mui/icons-material/AvTimer';
// import BathroomIcon from '@mui/icons-material/Bathroom';
// import BackupIcon from '@mui/icons-material/Backup';
import {
  GiFruitBowl,
  GiWheat,
  GiMilkCarton
} from "react-icons/gi";

import {
  FaStore,
  FaCarrot
} from "react-icons/fa";

const categories=[
    {name:"Fruits", value:"Fruits", icon:<GiFruitBowl></GiFruitBowl>},
    {name:"Vegetables", value:"Vegetables", icon:<FaCarrot></FaCarrot>},
    {name:"Grains", value:"Grains", icon:<GiWheat></GiWheat>},
    {name:"Dairy", value:"dairy", icon:<GiMilkCarton></GiMilkCarton>},
    {name:"Street Food", value:"Street Food", icon:<FaStore></FaStore>}
]

export default function categorynavbar({selectedCategory, setSelectedCategory}){
    return(
        <>
      <Navbar className="bg-body-tertiary navbarmain categorynavbar" >
        <Container fluid className="px-0">
            <Nav className="me-auto category-navbar-nav">
              <Nav.Link
                className={`category-navbar-link ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Nav.Link>
              {categories.map((cat) => (
                <Nav.Link
                  key={cat.value}
                  className={`category-navbar-link ${selectedCategory === cat.value ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  <span className="category-icon">{cat.icon}</span>
                  {cat.name}
                </Nav.Link>
              ))}
            </Nav>
        </Container>
      </Navbar>
      </>
    )
}
    