import { Button } from "@/components/ui/button";
import { SiWhatsapp } from "react-icons/si";

export default function WhatsAppButton() {
  const phoneNumber = "233303955950"; // Convert Ghana number to international format
  const message = encodeURIComponent("Hi, I need assistance with shipping services.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <Button
      variant="default"
      size="lg"
      className="fixed bottom-6 right-6 rounded-full bg-[#25D366] hover:bg-[#128C7E] shadow-lg z-50 p-4"
      onClick={() => window.open(whatsappUrl, '_blank')}
      aria-label="Contact us on WhatsApp"
    >
      <SiWhatsapp className="w-6 h-6" />
    </Button>
  );
}
