import axios from "axios";

const reviewApi=axios.create({
    baseURL:import.meta.env.DEV ? "" : (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"),
    withCredentials:true,
});

export default reviewApi;