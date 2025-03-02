import { Button } from "@/components/ui/button";
import { SiWhatsapp } from "react-icons/si";

export default function ContactForm() {
  const phoneNumber = "233303955950"; // Convert Ghana number to international format
  const message = encodeURIComponent("Hi, I need assistance with shipping services.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Button 
        size="lg"
        className="w-full max-w-sm bg-[#25D366] hover:bg-[#128C7E] gap-2"
        onClick={() => window.open(whatsappUrl, '_blank')}
      >
        <SiWhatsapp className="w-5 h-5" />
        Send Message on WhatsApp
      </Button>
    </div>
  );
}