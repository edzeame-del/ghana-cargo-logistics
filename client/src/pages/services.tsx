import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Plane, Warehouse, FileCheck, Package, Truck } from "lucide-react";

const services = [
  {
    title: "Sea Freight",
    description: "Comprehensive ocean freight services through Ghana's major ports including Tema and Takoradi. We handle FCL and LCL shipments with reliable scheduling and competitive rates.",
    icon: Ship,
    features: ["Container shipping", "Break bulk cargo", "Project cargo", "Port handling"]
  },
  {
    title: "Air Freight",
    description: "Fast and efficient air cargo solutions connecting Ghana to global destinations. Ideal for time-sensitive and high-value shipments.",
    icon: Plane,
    features: ["Express delivery", "Temperature controlled", "Dangerous goods", "Charter services"]
  },
  {
    title: "Warehousing",
    description: "Secure storage facilities across Ghana with modern inventory management systems and distribution services.",
    icon: Warehouse,
    features: ["Inventory management", "Distribution", "Cold storage", "Security"]
  },
  {
    title: "Customs Clearance",
    description: "Expert handling of all customs documentation and procedures at Ghana's ports and airports.",
    icon: FileCheck,
    features: ["Documentation", "Compliance", "Duty calculation", "Customs consulting"]
  },
  {
    title: "Project Cargo",
    description: "Specialized handling of oversized and heavy equipment for industrial projects across Ghana.",
    icon: Package,
    features: ["Heavy lift", "Special equipment", "Project planning", "Risk management"]
  },
  {
    title: "Inland Transportation",
    description: "Reliable road transport services connecting all major cities and industrial areas in Ghana.",
    icon: Truck,
    features: ["Nationwide coverage", "Door-to-door", "Track and trace", "Insurance"]
  }
];

export default function Services() {
  return (
    <div className="py-16 bg-sky-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900">Our Services</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive logistics solutions tailored to meet your cargo and freight needs in Ghana and beyond
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="border-2 hover:border-primary/50 transition-colors bg-white">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}