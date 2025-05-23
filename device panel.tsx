import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function DevicePanel() {
  const { data: devices, isLoading } = useQuery({
    queryKey: ['/api/devices'],
  });

  const defaultDevices = [
    {
      id: 1,
      name: "Accu-Check Guide",
      type: "glucometer",
      icon: "bloodtype",
      lastSync: "Today, 9:34 AM",
      status: "connected",
      battery: 72
    },
    {
      id: 2,
      name: "Omron Platinum",
      type: "blood_pressure",
      icon: "favorite",
      lastSync: "Today, 9:45 AM",
      status: "connected",
      battery: 85
    }
  ];
  
  const getDeviceTypeLabel = (type: string) => {
    switch(type) {
      case "glucometer":
        return "Blood Sugar Monitor";
      case "blood_pressure":
        return "Blood Pressure Monitor";
      default:
        return type;
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium gradient-heading">Connected Devices</h2>
          <Link href="/devices">
            <a className="text-primary text-sm hover:underline">Manage All</a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="border border-neutral-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {(devices || defaultDevices).map(device => (
                <div key={device.id} className="border border-neutral-200 rounded-lg p-4 card-hover">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-icons text-primary">{device.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-neutral-700 font-medium">{device.name}</h3>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-secondary/10 rounded-full">
                          <span className="w-2 h-2 bg-secondary rounded-full"></span>
                          <span className="text-xs text-secondary">Connected</span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{getDeviceTypeLabel(device.type)}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-neutral-500">Last synced: {device.lastSync}</p>
                        <div className="flex items-center gap-1">
                          <span className="material-icons text-xs text-neutral-400">battery_charging_full</span>
                          <span className="text-xs text-neutral-500">{device.battery}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between">
                    <Button variant="outline" size="sm" className="text-xs">
                      <span className="material-icons text-xs mr-1">sync</span>
                      Sync Now
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <span className="material-icons text-xs mr-1">settings</span>
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Add device button */}
              <Link href="/devices">
                <a className="border border-dashed border-neutral-300 rounded-lg p-4 flex items-center justify-center h-full hover:bg-neutral-50 transition-colors">
                  <div className="flex flex-col items-center text-neutral-400">
                    <span className="material-icons text-2xl mb-1">add_circle_outline</span>
                    <span className="text-sm">Connect New Device</span>
                  </div>
                </a>
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DevicePanel;
