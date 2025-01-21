import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function About() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              About MSG Logistics
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              As a leading logistics provider in Ghana, we combine local expertise
              with global reach to deliver exceptional cargo and freight services
              across Ghana. Our commitment to reliability, efficiency, and customer 
              satisfaction sets us apart in the industry.
            </p>
            <Button className="mt-8" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
          <div className="mt-10 lg:mt-0">
            <img
              src="https://images.unsplash.com/photo-1642626284600-079ffea2a7cb"
              alt="Ghana port operations"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}