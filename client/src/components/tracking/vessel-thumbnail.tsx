import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

type Vessel = {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  trackingUrl: string;
  thumbnailUrl: string;
};

type VesselThumbnailProps = {
  vessel: Vessel;
};

export default function VesselThumbnail({ vessel }: VesselThumbnailProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={vessel.thumbnailUrl}
              alt={`${vessel.name} vessel`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{vessel.name}</h3>
            <p className="text-sm text-gray-500">IMO: {vessel.imo}</p>
            <p className="text-sm text-gray-500">MMSI: {vessel.mmsi}</p>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => window.open(vessel.trackingUrl, '_blank')}
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