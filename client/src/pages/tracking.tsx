import { useState } from "react";
import VesselSearch from "@/components/tracking/vessel-search";
import VesselMap from "@/components/tracking/vessel-map";
import JourneyTimeline from "@/components/tracking/journey-timeline";
import VesselThumbnail from "@/components/tracking/vessel-thumbnail";
import { Button } from "@/components/ui/button";

type VesselData = {
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  lastUpdate: string;
};

export default function Tracking() {
  const [vesselData, setVesselData] = useState<VesselData | undefined>();
  const [currentStage, setCurrentStage] = useState(0);

  // Demo function to advance the timeline
  const advanceStage = () => {
    setCurrentStage((prev) => (prev < 3 ? prev + 1 : 0));
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900">Cargo Tracking</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Track your cargo journey and vessel location in real-time
          </p>
        </div>

        {/* Featured Vessel */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Featured Vessel</h2>
          <div className="max-w-md mx-auto">
            <VesselThumbnail />
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-semibold mb-6">Cargo Journey Status</h2>
          <JourneyTimeline currentStage={currentStage} />
          <div className="mt-6 text-center">
            <Button onClick={advanceStage}>
              Advance Stage (Demo)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <VesselSearch onVesselFound={setVesselData} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <VesselMap vessel={vesselData} />
          </div>
        </div>
      </div>
    </div>
  );
}