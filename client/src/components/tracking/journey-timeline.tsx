import { motion } from "framer-motion";
import { Package, Ship, Truck, Building2 } from "lucide-react";

const stages = [
  {
    icon: Package,
    title: "Pickup",
    description: "Cargo collected from sender",
  },
  {
    icon: Ship,
    title: "Transit",
    description: "Cargo in sea transit",
  },
  {
    icon: Building2,
    title: "Customs",
    description: "Customs clearance process",
  },
  {
    icon: Truck,
    title: "Delivery",
    description: "Final delivery to destination",
  },
];

interface JourneyTimelineProps {
  currentStage: number; // 0-based index of current stage
}

export default function JourneyTimeline({ currentStage }: JourneyTimelineProps) {
  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute top-[2.25rem] left-0 w-full h-1 bg-gray-200">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        {/* Timeline Points */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const isCompleted = index <= currentStage;
            const Icon = stage.icon;

            return (
              <div
                key={stage.title}
                className="flex flex-col items-center space-y-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${
                    isCompleted ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isCompleted ? "text-white" : "text-gray-500"
                    }`}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 + 0.2 }}
                  className="flex flex-col items-center"
                >
                  <span className="font-medium text-sm">{stage.title}</span>
                  <span className="text-xs text-gray-500 text-center max-w-[120px]">
                    {stage.description}
                  </span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
