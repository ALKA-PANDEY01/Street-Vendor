import {useEffect, useState} from "react";
import axios from "axios";
import {Button} from "react-bootstrap";
import {RatingStars} from "./ratingsummary.jsx";
import "./review.css";

export default function ReviewList({targetType,targetId,refreshKey=0}){
    const [reviews,setReviews]=useState([]);
    const [page,setPage]=useState(1);
    const [pagination,setPagination]=useState({total:0,totalPages:0});
    const [loading,setLoading]=useState(true);

    useEffect(()=>{
        let active=true;
        if(!targetType || !targetId){
            return ()=>{active=false;};
        }

        axios.get(`/api/reviews/${targetType}/${targetId}`,{
            params:{page,limit:5},
        })
            .then((res)=>{
                if(active){
                    setReviews(res.data.reviews || []);
                    setPagination({
                        total:res.data.total || 0,
                        totalPages:res.data.totalPages || 0,
                    });
                }
            })
            .catch(()=>{
                if(active){
                    setReviews([]);
                    setPagination({total:0,totalPages:0});
                }
            })
            .finally(()=>{
                if(active){
                    setLoading(false);
                }
            });

        return ()=>{active=false;};
    },[targetType,targetId,page,refreshKey]);

    const handlePageChange=(nextPage)=>{
        setPage(nextPage);
        window.scrollTo({top:document.querySelector(".review-list")?.offsetTop || 0,behavior:"smooth"});
    };

    return (
        <section className="review-list">
            <h3 className="review-list-title">Customer reviews</h3>
            {loading ? (
                <p className="review-loading">Loading reviews...</p>
            ) : reviews.length === 0 ? (
                <p className="review-empty">No reviews yet.</p>
            ) : (
                reviews.map((review)=>(
                    <article className="review-item" key={review._id}>
                        <div className="review-item-header">
                            <span className="review-author">{review.userId?.username || "Customer"}</span>
                            <span className="review-date">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                            </span>
                        </div>
                        <RatingStars value={Number(review.rating) || 0}/>
                        {review.comment && <p className="review-comment">{review.comment}</p>}
                    </article>
                ))
            )}
            {pagination.totalPages > 1 && (
                <div className="review-pagination">
                    <Button
                        size="sm"
                        variant="outline-primary"
                        disabled={page === 1}
                        onClick={()=>handlePageChange(page-1)}
                    >
                        Previous
                    </Button>
                    <span className="review-page-label">Page {page} of {pagination.totalPages}</span>
                    <Button
                        size="sm"
                        variant="outline-primary"
                        disabled={page === pagination.totalPages}
                        onClick={()=>handlePageChange(page+1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </section>
    );
}
