import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, TrendingUp, Calendar, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

type HeatmapCell = {
  hour: number;
  day: number;
  count: number;
  intensity: number;
};

type HeatmapData = {
  heatmapData: HeatmapCell[];
  weeklyPattern: number[];
  hourlyPattern: number[];
  dailyTotals: Record<string, number>;
  totalSearches: number;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function SearchHeatmap() {
  const [selectedDays, setSelectedDays] = useState("30");

  const { data: heatmapData, isLoading, error, refetch } = useQuery<HeatmapData>({
    queryKey: ["/api/search-heatmap", selectedDays],
    queryFn: async () => {
      const response = await fetch(`/api/search-heatmap?days=${selectedDays}`);
      if (!response.ok) {
        throw new Error("Failed to fetch heatmap data");
      }
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 border border-gray-200';
    if (intensity < 0.2) return 'bg-blue-100 border border-blue-200';
    if (intensity < 0.4) return 'bg-blue-200 border border-blue-300';
    if (intensity < 0.6) return 'bg-blue-300 border border-blue-400';
    if (intensity < 0.8) return 'bg-blue-400 border border-blue-500';
    return 'bg-blue-500 border border-blue-600';
  };

  const getHeatmapCell = (hour: number, day: number) => {
    return heatmapData?.heatmapData.find(cell => cell.hour === hour && cell.day === day) || { count: 0, intensity: 0 };
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const getBusiestHour = () => {
    if (!heatmapData?.hourlyPattern) return null;
    const maxIndex = heatmapData.hourlyPattern.indexOf(Math.max(...heatmapData.hourlyPattern));
    return maxIndex;
  };

  const getBusiestDay = () => {
    if (!heatmapData?.weeklyPattern) return null;
    const maxIndex = heatmapData.weeklyPattern.indexOf(Math.max(...heatmapData.weeklyPattern));
    return DAYS_OF_WEEK[maxIndex];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Search Activity Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading heat map...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Search Activity Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Failed to load heat map data</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const busiestHour = getBusiestHour();
  const busiestDay = getBusiestDay();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Search Activity Heat Map
          </CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedDays} onValueChange={setSelectedDays}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {heatmapData?.totalSearches || 0} total searches
          </span>
          {busiestHour !== null && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Peak: {formatHour(busiestHour)}
            </span>
          )}
          {busiestDay && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Busiest: {busiestDay}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Heat Map Grid */}
          <div>
            <h4 className="font-medium mb-3">Hourly Activity Pattern</h4>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Days header */}
                <div className="flex mb-1">
                  <div className="w-12"></div>
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="w-8 text-xs text-center text-muted-foreground font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Heat map rows */}
                {HOURS.map(hour => (
                  <div key={hour} className="flex mb-1 items-center">
                    <div className="w-12 text-xs text-right text-muted-foreground mr-1">
                      {formatHour(hour)}
                    </div>
                    {DAYS_OF_WEEK.map((_, dayIndex) => {
                      const cell = getHeatmapCell(hour, dayIndex);
                      return (
                        <div
                          key={`${hour}-${dayIndex}`}
                          className={`w-7 h-7 mr-1 rounded-sm ${getIntensityColor(cell.intensity)} 
                                     hover:scale-110 transition-transform cursor-pointer group relative`}
                          title={`${DAYS_OF_WEEK[dayIndex]} ${formatHour(hour)}: ${cell.count} searches`}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            {cell.count > 0 && (
                              <span className="text-xs font-medium opacity-75">
                                {cell.count > 99 ? '99+' : cell.count > 0 ? cell.count : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>Less active</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded-sm"></div>
                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded-sm"></div>
                <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded-sm"></div>
                <div className="w-4 h-4 bg-blue-300 border border-blue-400 rounded-sm"></div>
                <div className="w-4 h-4 bg-blue-400 border border-blue-500 rounded-sm"></div>
                <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded-sm"></div>
              </div>
              <span>More active</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekly Pattern */}
            <div>
              <h4 className="font-medium mb-3">Weekly Pattern</h4>
              <div className="space-y-2">
                {DAYS_OF_WEEK.map((day, index) => {
                  const count = heatmapData?.weeklyPattern[index] || 0;
                  const maxWeekly = Math.max(...(heatmapData?.weeklyPattern || [1]));
                  const percentage = maxWeekly > 0 ? (count / maxWeekly) * 100 : 0;
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <div className="w-8 text-xs font-medium">{day}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 relative overflow-hidden">
                        <div
                          className="bg-blue-500 h-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-8 text-xs text-muted-foreground text-right">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Peak Hours */}
            <div>
              <h4 className="font-medium mb-3">Peak Hours</h4>
              <div className="space-y-2">
                {heatmapData?.hourlyPattern
                  .map((count, hour) => ({ hour, count }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 6)
                  .map(({ hour, count }) => (
                    <div key={hour} className="flex items-center justify-between">
                      <span className="text-sm">{formatHour(hour)}</span>
                      <Badge variant="secondary" className="ml-2">
                        {count} searches
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}