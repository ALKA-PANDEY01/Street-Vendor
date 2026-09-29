import {io} from "socket.io-client";

const socketUrl=import.meta.env.DEV
    ? "http://127.0.0.1:5000"
    : import.meta.env.VITE_BACKEND_URL;

const trackingSocket=io(socketUrl,{withCredentials:true});

export default trackingSocket;