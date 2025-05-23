import { useQuery } from "@tanstack/react-query";
import MetricCard from "./MetricCard";
import ChartPanel from "./ChartPanel";
import DevicePanel from "./DevicePanel";
import ReadingsPanel from "./ReadingsPanel";
import AIAssistant from "./AIAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

interface DashboardProps {
  onNewReading: () => void;
}

export default function Dashboard({ onNewReading }: DashboardProps) {
  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['/api/readings/summary'],
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Dashboard Overview */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="section-title">Health Dashboard</h2>
            <p className="text-neutral-400">Track and monitor your vital health metrics in just 1 minute</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onNewReading}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-sm hover:bg-primary/90 transition flex items-center gap-1"
            >
              <span className="material-icons text-sm">add</span>
              <span>New Reading</span>
            </button>
            <button className="px-4 py-2 bg-white text-neutral-500 rounded-lg shadow-sm hover:bg-neutral-100 transition flex items-center gap-1">
              <span className="material-icons text-sm">download</span>
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingSummary ? (
            // Loading skeleton
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-2/3">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-1/2">
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              <MetricCard
                title="Blood Sugar"
                value={summaryData?.bloodSugar?.latest?.value || 118}
                unit="mg/dL"
                icon="bloodtype"
                iconBgClass="bg-secondary/10"
                iconClass="text-secondary"
                lastReading={summaryData?.bloodSugar?.latest?.time || "Today, 9:34 AM"}
                status={summaryData?.bloodSugar?.status || "Normal"}
                statusType={summaryData?.bloodSugar?.statusType || "normal"}
              />
              <MetricCard
                title="Blood Pressure"
                value={summaryData?.bloodPressure?.latest?.value || "128/82"}
                unit="mmHg"
                icon="favorite"
                iconBgClass="bg-accent/10"
                iconClass="text-accent"
                lastReading={summaryData?.bloodPressure?.latest?.time || "Today, 9:45 AM"}
                status={summaryData?.bloodPressure?.status || "Elevated"}
                statusType={summaryData?.bloodPressure?.statusType || "elevated"}
              />
              <MetricCard
                title="Heart Rate"
                value={summaryData?.heartRate?.latest?.value || 72}
                unit="bpm"
                icon="favorite_border"
                iconBgClass="bg-secondary/10"
                iconClass="text-secondary"
                lastReading={summaryData?.heartRate?.latest?.time || "Today, 9:34 AM"}
                status={summaryData?.heartRate?.status || "Normal"}
                statusType={summaryData?.heartRate?.statusType || "normal"}
              />
              <MetricCard
                title="Weight"
                value={summaryData?.weight?.latest?.value || 168}
                unit="lbs"
                icon="monitor_weight"
                iconBgClass="bg-neutral-200"
                iconClass="text-neutral-400"
                lastReading={summaryData?.weight?.latest?.time || "Yesterday, 8:15 AM"}
                status={summaryData?.weight?.change || "-2 lbs"}
                statusType="neutral"
              />
            </>
          )}
        </div>
      </section>
      
      {/* Doctor Connect Section */}
      <section className="mb-8">
        <h2 className="section-title">Connect with Specialists</h2>
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-secondary material-icons">verified</span>
                  <h3 className="text-xl font-semibold text-neutral-700">Apollo 24/7 Healthcare Network</h3>
                </div>
                <p className="text-neutral-600 mb-4">Connect with certified doctors for personalized consultations based on your health readings.</p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="bg-white rounded-lg px-3 py-2 text-sm flex items-center gap-1 shadow-sm">
                    <span className="material-icons text-secondary text-sm">check_circle</span>
                    <span>Certified Specialists</span>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 text-sm flex items-center gap-1 shadow-sm">
                    <span className="material-icons text-secondary text-sm">check_circle</span>
                    <span>Secure Consultations</span>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 text-sm flex items-center gap-1 shadow-sm">
                    <span className="material-icons text-secondary text-sm">check_circle</span>
                    <span>Quick Appointments</span>
                  </div>
                </div>
                <Link href="/connect-doctor">
                  <a className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-secondary/80 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <span className="material-icons text-sm">local_hospital</span>
                    <span>Find a Specialist Now</span>
                  </a>
                </Link>
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-md card-hover">
                  <div className="flex items-center gap-4 mb-4 border-b pb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-icons text-primary text-3xl">person</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-700">Dr. Sarah Johnson</h4>
                      <p className="text-sm text-neutral-500">Endocrinologist</p>
                      <div className="flex items-center text-yellow-500 mt-1">
                        <span className="material-icons text-sm">star</span>
                        <span className="material-icons text-sm">star</span>
                        <span className="material-icons text-sm">star</span>
                        <span className="material-icons text-sm">star</span>
                        <span className="material-icons text-sm">star_half</span>
                        <span className="text-xs text-neutral-500 ml-1">4.8</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">Next available: <span className="text-primary font-medium">Today, 3:00 PM</span></p>
                  <button className="w-full bg-secondary/10 text-secondary rounded-lg py-2 text-sm hover:bg-secondary/20 transition-colors">
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Readings and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2">
          <ChartPanel />
          <DevicePanel />
        </div>

        {/* Recent Readings and AI Assistant */}
        <div>
          <ReadingsPanel />
          <AIAssistant />
        </div>
      </div>
    </main>
  );
}
