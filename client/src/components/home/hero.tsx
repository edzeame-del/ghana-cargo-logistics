import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Hero() {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative bg-gray-900">
      <div className="absolute inset-0">
        <img
          src={imageError 
            ? "https://images.unsplash.com/photo-1517446915321-65e972f1b494" 
            : "https://images.unsplash.com/photo-1559136560-8a9e6dfe6807"}
          alt="Container ship at port"
          className="w-full h-full object-cover opacity-40"
          onError={() => setImageError(true)}
        />
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Your Trusted Logistics Partner in Ghana
        </h1>
        <p className="mt-6 text-xl text-gray-300 max-w-3xl">
          MSG Logistics provides comprehensive shipping, logistics, and cargo solutions across Ghana. From sea freight to warehousing, we deliver excellence in every service.
        </p>
        <div className="mt-10 flex space-x-4">
          <Button size="lg" asChild>
            <Link href="/terms">Terms & Conditions</Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-white/10" asChild>
            <Link href="/services">Our Services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}