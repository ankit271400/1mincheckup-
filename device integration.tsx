import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DeviceIntegration = () => {
  const [activeTab, setActiveTab] = useState("bluetooth");

  const compatibleDevices = [
    {
      id: 1,
      name: "Accu-Check Guide",
      type: "glucose",
      connectivity: "bluetooth",
      manufacturer: "Roche",
      image: null,
      features: ["Real-time readings", "Automatic syncing", "Historical data"]
    },
    {
      id: 2,
      name: "Omron Platinum",
      type: "blood_pressure",
      connectivity: "bluetooth",
      manufacturer: "Omron",
      image: null,
      features: ["Dual user mode", "Morning hypertension indicator", "Advanced accuracy"]
    },
    {
      id: 3,
      name: "OneTouch Verio Flex",
      type: "glucose",
      connectivity: "bluetooth",
      manufacturer: "LifeScan",
      image: null,
      features: ["ColorSure technology", "Compact design", "7-day averages"]
    },
    {
      id: 4,
      name: "iHealth Clear BPM1",
      type: "blood_pressure",
      connectivity: "bluetooth",
      manufacturer: "iHealth",
      image: null,
      features: ["Large display", "Multi-user support", "Irregular heartbeat detection"]
    },
    {
      id: 5,
      name: "Smartphone Camera",
      type: "blood_pressure",
      connectivity: "camera",
      manufacturer: "Your phone",
      image: null,
      features: ["No additional hardware needed", "Quick readings", "Portable"]
    }
  ];
  
  const filteredDevices = compatibleDevices.filter(device => {
    if (activeTab === "bluetooth") {
      return device.connectivity === "bluetooth";
    } else if (activeTab === "camera") {
      return device.connectivity === "camera";
    }
    return true;
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "glucose":
        return "bloodtype";
      case "blood_pressure":
        return "favorite";
      default:
        return "device_unknown";
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="gradient-heading">Device Integration</CardTitle>
        <CardDescription>Connect external devices or use smartphone features for measurements</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bluetooth" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
            <TabsTrigger value="bluetooth">Bluetooth Devices</TabsTrigger>
            <TabsTrigger value="camera">Smartphone Camera</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bluetooth" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDevices.map(device => (
                <div key={device.id} className="border border-neutral-200 rounded-lg p-4 card-hover">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-icons text-primary">{getDeviceIcon(device.type)}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-700">{device.name}</h3>
                      <p className="text-xs text-neutral-500">{device.manufacturer}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {device.type === "glucose" ? "Blood Sugar" : "Blood Pressure"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-neutral-600 mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {device.features.map((feature, index) => (
                        <li key={index} className="text-xs text-neutral-600 flex items-center gap-1">
                          <span className="material-icons text-secondary text-xs">check_circle</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Connect Device
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="camera" className="mt-4">
            <div className="bg-neutral-50 p-6 rounded-lg mb-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow-md flex items-center justify-center">
                  <div className="relative w-40 h-40 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center">
                    <span className="material-icons text-neutral-400 text-5xl">photo_camera</span>
                    <div className="absolute -bottom-3 -right-3 bg-primary text-white rounded-full p-2">
                      <span className="material-icons">favorite</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3">
                  <h3 className="text-lg font-medium text-neutral-700 mb-2">Smartphone Camera Blood Pressure</h3>
                  <p className="text-neutral-600 mb-4">
                    Our app can use your smartphone's camera and flash to measure blood pressure by analyzing the blood flow through your fingertip.
                  </p>
                  
                  <div className="bg-primary/5 p-3 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-neutral-700 mb-2">How it works:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-600">
                      <li>Place your fingertip gently on the camera lens</li>
                      <li>Keep your finger still during the 30-second measurement</li>
                      <li>The app will analyze blood flow using the camera and flash</li>
                      <li>Results appear within 60 seconds</li>
                    </ol>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="bg-white rounded-lg px-3 py-2 text-sm flex items-center gap-1 shadow-sm">
                      <span className="material-icons text-secondary text-sm">check_circle</span>
                      <span>No Additional Hardware</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 text-sm flex items-center gap-1 shadow-sm">
                      <span className="material-icons text-secondary text-sm">check_circle</span>
                      <span>60-Second Results</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 text-sm flex items-center gap-1 shadow-sm">
                      <span className="material-icons text-secondary text-sm">check_circle</span>
                      <span>Camera-Based Monitoring</span>
                    </div>
                  </div>
                  
                  <Button className="bg-gradient-to-r from-primary to-secondary text-white">
                    Start Camera Measurement
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <span className="material-icons text-yellow-500">info</span>
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">Important Note</h4>
                  <p className="text-sm text-neutral-600">
                    Camera-based measurements provide approximate readings and should not replace medical-grade equipment for clinical diagnosis. Always consult with healthcare professionals for accurate medical advice.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DeviceIntegration;
