import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import axios from"axios";

axios.defaults.baseURL="https://street-vendor-nl05.onrender.com";
axios.defaults.withCredentials=true;
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
