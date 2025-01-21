import { useState } from "react";
import VesselSearch from "@/components/tracking/vessel-search";
import VesselMap from "@/components/tracking/vessel-map";

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

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900">Vessel Tracking</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Track the real-time location of vessels across the globe
          </p>
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
