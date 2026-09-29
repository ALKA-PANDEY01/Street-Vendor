import {useEffect, useState} from "react";
import reviewApi from "../api/reviewApi.js";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import "./review.css";

function RatingStars({value}){
    return (
        <span className="review-stars" aria-label={`${value.toFixed(1)} out of 5 stars`}>
            {[1,2,3,4,5].map((star)=>{
                if(value >= star){
                    return <StarIcon className="review-star-icon" key={star}/>;
                }
                if(value >= star - 0.5){
                    return <StarHalfIcon className="review-star-icon" key={star}/>;
                }
                return <StarBorderIcon className="review-star-icon" key={star}/>;
            })}
        </span>
    );
}

export default function RatingSummary({targetType,targetId,compact=false,showEmpty=false,refreshKey=0}){
    const [summary,setSummary]=useState(null);

    useEffect(()=>{
        let active=true;
        if(!targetType || !targetId){
            return ()=>{active=false;};
        }

        reviewApi.get(`/api/reviews/${targetType}/${targetId}/summary`)
            .then((res)=>{
                if(active){
                    setSummary(res.data);
                }
            })
            .catch(()=>{
                if(active){
                    setSummary(null);
                }
            });

        return ()=>{active=false;};
    },[targetType,targetId,refreshKey]);

    if(!summary && !showEmpty){
        return null;
    }

    const displaySummary=summary || {averageRating:0,count:0};

    return (
        <div className={`review-summary ${compact ? "compact" : ""}`}>
            <RatingStars value={Number(displaySummary.averageRating) || 0}/>
            <span>{Number(displaySummary.averageRating || 0).toFixed(1)}</span>
            <span className="review-count">({displaySummary.count || 0})</span>
        </div>
    );
}

export {RatingStars};
