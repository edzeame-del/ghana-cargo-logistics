import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function VesselThumbnail() {
  const vesselLink = "https://www.marinetraffic.com/en/ais/details/ships/shipid:726231/mmsi:563361000/imo:9638977/vessel:KOTA_CEPAT";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src="https://photos.marinetraffic.com/ais/showphoto.aspx?shipid=726231"
              alt="KOTA CEPAT vessel"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">KOTA CEPAT</h3>
            <p className="text-sm text-gray-500">IMO: 9638977</p>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => window.open(vesselLink, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              View on MarineTraffic
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
