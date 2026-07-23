import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Categories from "../components/Categories";
import Testimonials from "../components/Testimonials";
import FooterCTA from "../components/Footer";

export default function PharmacyLandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[120px]" dir="rtl">
      <Header />
      <Hero />
      <HowItWorks />
      <Categories />
      <Testimonials />
      <FooterCTA />
    </div>
  );
}
