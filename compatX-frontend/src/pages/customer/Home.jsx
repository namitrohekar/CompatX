import CustomerNavbar from "../../components/layout/CustomerNavbar";
import FeaturedCategories from "./home/FeaturedCategories";
import HeroSection from "./home/HeroSection";
import PopularProducts from "./home/PopularProducts";



export default function Home() {
  return (
    <>
   
      <HeroSection />
      

      <FeaturedCategories />


      <PopularProducts/>
    </>
  );
}
