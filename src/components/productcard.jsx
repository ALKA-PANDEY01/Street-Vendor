import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './productcard.css';
import {Link} from 'react-router-dom';
import AdjustIcon from '@mui/icons-material/Adjust';


export default function productCard({product}) {
  return (
    <Link to={`/products/${product._id}`} style={{textDecoration:"none"}}>
      <Card className="productcard" >
      <Card.Img className="cardimage " variant="top" src={product.image.url} />
      <Card.Body className="cardbody" style={{ width: '50rem' }}>
        <Card.Title className="cardtitle doc">{product.name}</Card.Title>
           <Card.Text  className="productprice doc" >&#8377;{product.price}/{product.quantity}</Card.Text>
            <Card.Text  className="productvendor doc" >{product.vendorName}</Card.Text>
            <Card.Text  className="productinstock doc" ><AdjustIcon  sx={product.inStock?{color:"green"}: {color:"red"}}></AdjustIcon></Card.Text> 
      </Card.Body>
    </Card>
    </Link>
  );
}















