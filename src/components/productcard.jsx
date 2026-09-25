import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './productcard.css';
import {Link} from 'react-router-dom';
import AdjustIcon from '@mui/icons-material/Adjust';
import RatingSummary from './ratingsummary.jsx';


export default function productCard({product}) {
  const vendorId=product.owner?._id || product.owner;

  return (
    <div className="product-card-wrap">
      <Link to={`/products/${product._id}`} style={{textDecoration:"none"}}>
        <Card className="productcard" >
          <Card.Img className="cardimage " variant="top" src={product.image.url} />
          <Card.Body className="cardbody">
            <Card.Title className="cardtitle doc">{product.name}</Card.Title>
            <Card.Text  className="productprice doc" >&#8377;{product.price}/{product.quantity}</Card.Text>
            <Card.Text  className="productvendor doc" >{product.vendorName}&nbsp; &nbsp; &nbsp;<AdjustIcon className={product.inStock ? "status-instock" : "status-outofstock"} /></Card.Text> 
          </Card.Body>
        </Card>
      </Link>
      <div className="product-card-ratings">
        <RatingSummary targetType="product" targetId={product._id} compact />
        {vendorId && <RatingSummary targetType="vendor" targetId={vendorId} compact />}
      </div>
    </div>
  );
}















