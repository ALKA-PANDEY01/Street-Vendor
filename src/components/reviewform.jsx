import {useState} from "react";
import axios from "axios";
import {Button, Form} from "react-bootstrap";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {toast} from "react-toastify";
import "./review.css";

export default function ReviewForm({targetType,targetId,orderId,onSuccess}){
    const [rating,setRating]=useState(0);
    const [comment,setComment]=useState("");
    const [submitting,setSubmitting]=useState(false);

    if(!orderId || !targetId){
        return null;
    }

    const handleSubmit=async(event)=>{
        event.preventDefault();
        if(!rating){
            toast.error("Please select a rating");
            return;
        }

        setSubmitting(true);
        try{
            const res=await axios.post("/api/reviews",{
                targetType,
                targetId,
                orderId,
                rating,
                comment:comment.trim(),
            });
            toast.success("Review added successfully");
            setRating(0);
            setComment("");
            onSuccess?.(res.data.review);
        }catch(error){
            toast.error(error.response?.data?.message || "Unable to add review");
        }finally{
            setSubmitting(false);
        }
    };

    return (
        <Form className="review-form" onSubmit={handleSubmit}>
            <h3 className="review-form-title">Share your experience</h3>
            <div className="review-rating-input" aria-label="Choose a rating">
                {[1,2,3,4,5].map((star)=>(
                    <button
                        type="button"
                        className={`review-star-button ${rating >= star ? "active" : ""}`}
                        key={star}
                        onClick={()=>setRating(star)}
                        aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    >
                        {rating >= star ? <StarIcon/> : <StarBorderIcon/>}
                    </button>
                ))}
            </div>
            <Form.Group className="mb-3" controlId={`${targetType}-review-comment`}>
                <Form.Label>Comment</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={comment}
                    maxLength={1000}
                    onChange={(event)=>setComment(event.target.value)}
                    placeholder="Tell other customers about it"
                />
            </Form.Group>
            <Button className="cardbtn" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit review"}
            </Button>
        </Form>
    );
}
