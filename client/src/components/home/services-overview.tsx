import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ship, Plane, Warehouse, FileCheck } from "lucide-react";

const services = [
  {
    title: "Sea Freight",
    description: "Efficient container shipping services via Ghana's major ports",
    icon: Ship,
  },
  {
    title: "Air Freight",
    description: "Fast and reliable air cargo solutions worldwide",
    icon: Plane,
  },
  {
    title: "Warehousing",
    description: "Secure storage facilities across Ghana",
    icon: Warehouse,
  },
  {
    title: "Customs Clearance",
    description: "Expert handling of all customs documentation and procedures",
    icon: FileCheck,
  },
];

export default function ServicesOverview() {
  return (
    <section className="py-16 bg-sky-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive logistics solutions tailored to your needs
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Card key={service.title} className="border-2 hover:border-primary/50 transition-colors bg-white">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}