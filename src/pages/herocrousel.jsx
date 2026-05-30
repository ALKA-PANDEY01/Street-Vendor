import axios from "axios";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "./herocrousel.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function HeroCrousel() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await axios.get("/");
        setSlides(res.data);
      } catch (error) {
        console.error("error in carousel", error);
      }
    };

    fetchSlides();
  }, []);

  return (
    <div className="hero-container">
      {slides.length > 0 ? (
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          grabCursor
          slidesPerView={1}
          spaceBetween={24}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          className="hero-swiper"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="hero-slide">
              <div className="slide">
                <img src={slide.image} alt={slide.title} className="slide-image" />
                <div className="overlay">
                  <h2>{slide.title}</h2>
                  <p>{slide.subtitle}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="loading">Loading carousel...</div>
      )}
    </div>
  );
}