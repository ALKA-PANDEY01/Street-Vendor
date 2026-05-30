import express from 'express';
const router=express.Router();

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2000&q=90&dpr=2",
    title: "Happy Farmers",
    subtitle: "Find perfect farmers for your raw material",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=2000&q=90&dpr=2",
    title: "Fast Ordering",
    subtitle: "Easy and quick ordering system",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=2000&q=90&dpr=2",
    title: "Support Vendors",
    subtitle: "Helping local street vendors grow",
  },
];

router.get("/",(req,res)=>{
    res.json(slides);
})

export default router;