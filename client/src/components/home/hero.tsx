import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative bg-gray-900">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1494961104209-3c223057bd26"
          alt="Cargo containers"
          className="w-full h-full object-cover opacity-40"
        />
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Your Trusted Logistics Partner in Ghana
        </h1>
        <p className="mt-6 text-xl text-gray-300 max-w-3xl">
          MSG Ghana provides comprehensive shipping, logistics, and cargo solutions across Ghana. From sea freight to warehousing, we deliver excellence in every service.
        </p>
        <div className="mt-10 flex space-x-4">
          <Button size="lg" asChild>
            <Link href="/contact">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-white/10" asChild>
            <Link href="/services">Our Services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}