import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Globe, Users, Shield, Award } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connected to major shipping routes worldwide"
  },
  {
    icon: Users,
    title: "Expert Team",
    description: "Dedicated professionals with years of experience"
  },
  {
    icon: Shield,
    title: "Secure Handling",
    description: "Your cargo's safety is our top priority"
  },
  {
    icon: Award,
    title: "Quality Service",
    description: "Committed to excellence in every delivery"
  }
];

export default function About() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              About MSG Logistics
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              As a leading logistics provider in Ghana, we combine local expertise
              with global reach to deliver exceptional cargo and freight services
              across Ghana. Our commitment to reliability, efficiency, and customer 
              satisfaction sets us apart in the industry.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="shadow-lg" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-lg"></div>
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d"
                alt="Ghana port operations"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}