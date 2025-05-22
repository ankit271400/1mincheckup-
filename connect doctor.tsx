import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription, 
  DialogHeader, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

// Health networks available in the application
const healthNetworks = [
  {
    id: "apollo",
    name: "Apollo 24/7",
    logo: "local_hospital",
    description: "India's largest multi-channel healthcare platform",
    features: ["24/7 Availability", "Online Consultations", "Integrated Health Records"],
    ihisIntegrated: true
  },
  {
    id: "practo",
    name: "Practo",
    logo: "medication",
    description: "Leading healthcare platform connecting patients with doctors",
    features: ["Verified Specialists", "Digital Prescriptions", "Health Articles"],
    ihisIntegrated: true
  },
  {
    id: "general",
    name: "General Practices",
    logo: "health_and_safety",
    description: "Local healthcare providers and clinics",
    features: ["In-person Consultations", "Urgent Care", "Preventive Care"],
    ihisIntegrated: false
  }
];

const specializations = [
  {
    id: 1,
    name: "Endocrinology",
    icon: "bloodtype",
    description: "Specialists in diabetes, thyroid disorders, and hormone-related conditions"
  },
  {
    id: 2,
    name: "Cardiology",
    icon: "favorite",
    description: "Heart and cardiovascular system specialists"
  },
  {
    id: 3,
    name: "Internal Medicine",
    icon: "healing",
    description: "General adult healthcare and chronic disease management"
  },
  {
    id: 4,
    name: "Nephrology",
    icon: "water_drop",
    description: "Kidney health and blood pressure management specialists"
  },
  {
    id: 5,
    name: "Dietetics",
    icon: "restaurant",
    description: "Nutrition specialists for diabetes and heart health"
  },
  {
    id: 6,
    name: "General Practice",
    icon: "medical_services",
    description: "Primary care physicians for regular health checkups"
  }
];

// Apollo 24/7 doctors - Elderly Care Specialists
const apolloDoctors = [
  {
    id: 1,
    name: "Dr. Rajneesh Khattar",
    specialization: "Geriatric Medicine",
    experience: 17,
    rating: 4.9,
    image: null,
    availableToday: true,
    nextAvailable: "Today, 3:00 PM",
    hospital: "Apollo Hospitals, Delhi",
    fee: "₹900",
    network: "apollo",
    ihisEnabled: true
  },
  {
    id: 2,
    name: "Dr. Subhash Thakur",
    specialization: "Geriatric Medicine",
    experience: 20,
    rating: 4.8,
    image: null,
    availableToday: true,
    nextAvailable: "Today, 5:30 PM",
    hospital: "Apollo Hospitals, Chennai",
    fee: "₹1000",
    network: "apollo",
    ihisEnabled: true
  },
  {
    id: 3,
    name: "Dr. Annapurna Rao",
    specialization: "Geriatric Medicine",
    experience: 15,
    rating: 4.7,
    image: null,
    availableToday: false,
    nextAvailable: "Tomorrow, 10:00 AM",
    hospital: "Apollo Clinic",
    fee: "$40",
    network: "apollo",
    ihisEnabled: true
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialization: "Internal Medicine",
    experience: 20,
    rating: 4.9,
    image: null,
    availableToday: true,
    nextAvailable: "Today, 4:15 PM",
    hospital: "Apollo Medical Center",
    fee: "$55",
    network: "apollo",
    ihisEnabled: true
  },
  {
    id: 5,
    name: "Dr. Priya Sharma",
    specialization: "Nephrology",
    experience: 10,
    rating: 4.6,
    image: null,
    availableToday: false,
    nextAvailable: "Tomorrow, 2:30 PM",
    hospital: "Apollo Hospitals",
    fee: "$50",
    network: "apollo",
    ihisEnabled: false
  },
  {
    id: 6,
    name: "Dr. Robert Lee",
    specialization: "Dietetics",
    experience: 7,
    rating: 4.8,
    image: null,
    availableToday: true,
    nextAvailable: "Today, 6:00 PM",
    hospital: "Apollo Health",
    fee: "$35",
    network: "apollo",
    ihisEnabled: true
  },
];

// Practo doctors - Elderly Care Specialists
const practoDoctors = [
  {
    id: 7,
    name: "Dr. Raman Sharma",
    specialization: "Geriatric Medicine",
    experience: 18,
    rating: 4.8,
    image: null,
    availableToday: true,
    nextAvailable: "Today, 2:15 PM",
    hospital: "Practo Care",
    fee: "$50",
    network: "practo",
    ihisEnabled: true
  },
  {
    id: 8,
    name: "Dr. David Kim",
    specialization: "Cardiology",
    experience: 18,
    rating: 4.7,
    image: null,
    availableToday: true,
    nextAvailable: "Today, 4:00 PM",
    hospital: "Practo Health Center",
    fee: "$65",
    network: "practo",
    ihisEnabled: true
  },
  {
    id: 9,
    name: "Dr. Ravi Kumar",
    specialization: "Internal Medicine",
    experience: 9,
    rating: 4.5,
    image: null,
    availableToday: false,
    nextAvailable: "Tomorrow, 11:30 AM",
    hospital: "Practo Clinic",
    fee: "$40",
    network: "practo",
    ihisEnabled: true
  },
  {
    id: 10,
    name: "Dr. Lisa Wong",
    specialization: "Dietetics",
    experience: 11,
    rating: 4.8,
    image: null,
    availableToday: true,
    nextAvailable: "Today, 6:30 PM",
    hospital: "Practo Wellness",
    fee: "$35",
    network: "practo",
    ihisEnabled: false
  },
  {
    id: 11,
    name: "Dr. Arun Gupta",
    specialization: "Nephrology",
    experience: 16,
    rating: 4.9,
    image: null,
    availableToday: false,
    nextAvailable: "Tomorrow, 3:15 PM",
    hospital: "Practo Specialty",
    fee: "$60",
    network: "practo",
    ihisEnabled: true
  },
  {
    id: 12,
    name: "Dr. Sofia Martinez",
    specialization: "General Practice",
    experience: 7,
    rating: 4.6,
    image: null,
    availableToday: true,
    nextAvailable: "Today, 7:00 PM",
    hospital: "Practo Family Clinic",
    fee: "$30",
    network: "practo",
    ihisEnabled: true
  }
];

// Combine all doctors
const allDoctors = [...apolloDoctors, ...practoDoctors];

export default function ConnectDoctor() {
  const [selectedSpecialization, setSelectedSpecialization] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableToday, setAvailableToday] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("doctors");
  const [healthNetwork, setHealthNetwork] = useState<string | null>(null);
  const [ihisEnabled, setIhisEnabled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [shareIHISData, setShareIHISData] = useState({
    bloodSugar: true,
    bloodPressure: true
  });
  
  const filteredDoctors = allDoctors.filter(doctor => {
    // Apply health network filter
    if (healthNetwork && doctor.network !== healthNetwork) {
      return false;
    }
    
    // Apply IHIS integration filter
    if (ihisEnabled && !doctor.ihisEnabled) {
      return false;
    }
    
    // Apply specialization filter
    if (selectedSpecialization && 
        !specializations.find(s => s.id === selectedSpecialization)?.name.includes(doctor.specialization)) {
      return false;
    }
    
    // Apply search query filter
    if (searchQuery && 
        !doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply available today filter
    if (availableToday && !doctor.availableToday) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Healthcare Networks</h1>
          <p className="text-neutral-600">Connect with specialists based on your health data via Apollo 24/7 and Practo</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button className="bg-gradient-to-r from-secondary to-secondary/80">
            <span className="material-icons mr-2">phone</span>
            24/7 Helpline
          </Button>
          <a href="https://www.apollo247.com/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-primary text-primary">
              <span className="material-icons mr-2 text-sm">open_in_new</span>
              Apollo24/7
            </Button>
          </a>
        </div>
      </div>
      
      {/* Health Networks Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-neutral-700 mb-4">Select Healthcare Provider</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {healthNetworks.map(network => (
            <Card 
              key={network.id}
              className={`cursor-pointer transition-all ${
                healthNetwork === network.id 
                  ? 'ring-2 ring-primary' 
                  : 'hover:shadow-md card-hover'
              }`}
              onClick={() => setHealthNetwork(healthNetwork === network.id ? null : network.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    healthNetwork === network.id 
                      ? 'bg-primary text-white' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <span className="material-icons">{network.logo}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-700">{network.name}</h3>
                    {network.ihisIntegrated && (
                      <div className="flex items-center gap-1 text-xs text-secondary">
                        <span className="material-icons text-xs">verified</span>
                        <span>IHIS Integrated</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-3">{network.description}</p>
                <div className="flex flex-wrap gap-2">
                  {network.features.map((feature, idx) => (
                    <span key={idx} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Tabs defaultValue="doctors" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full md:w-[400px] mb-6">
          <TabsTrigger value="doctors">Find a Doctor</TabsTrigger>
          <TabsTrigger value="appointments">My Appointments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="doctors" className="space-y-6">
        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="search" className="mb-2 block">Search</Label>
                <div className="relative">
                  <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">search</span>
                  <Input 
                    id="search"
                    placeholder="Search by doctor name, specialization, or hospital..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Filter</Label>
                <div className="space-y-2">
                  <div className="flex items-center bg-neutral-50 p-2 rounded-md cursor-pointer" onClick={() => setAvailableToday(!availableToday)}>
                    <div className={`w-5 h-5 rounded ${availableToday ? 'bg-secondary' : 'bg-white border border-neutral-300'} flex items-center justify-center mr-2`}>
                      {availableToday && <span className="material-icons text-white text-sm">check</span>}
                    </div>
                    <span className="text-neutral-700">Available Today</span>
                  </div>
                  
                  <div className="flex items-center bg-neutral-50 p-2 rounded-md cursor-pointer" onClick={() => setIhisEnabled(!ihisEnabled)}>
                    <div className={`w-5 h-5 rounded ${ihisEnabled ? 'bg-secondary' : 'bg-white border border-neutral-300'} flex items-center justify-center mr-2`}>
                      {ihisEnabled && <span className="material-icons text-white text-sm">check</span>}
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-secondary text-sm mr-1">verified</span>
                      <span className="text-neutral-700">IHIS Integration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Specializations */}
        <div>
          <h2 className="text-lg font-medium text-neutral-700 mb-4">Select Specialization</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specializations.map((specialization) => (
              <Card 
                key={specialization.id}
                className={`cursor-pointer transition-all ${selectedSpecialization === specialization.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                onClick={() => setSelectedSpecialization(selectedSpecialization === specialization.id ? null : specialization.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${selectedSpecialization === specialization.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                    <span className="material-icons">{specialization.icon}</span>
                  </div>
                  <h3 className="text-sm font-medium">{specialization.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Doctors List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-neutral-700">Available Doctors</h2>
            <span className="text-sm text-neutral-500">{filteredDoctors.length} doctors found</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className={`card-hover ${selectedDoctor === doctor.id ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-primary text-3xl">person</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-neutral-800">{doctor.name}</h3>
                          <p className="text-sm text-neutral-500">{doctor.specialization} | {doctor.experience} years exp.</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center text-yellow-500">
                              <span className="material-icons text-sm">star</span>
                              <span className="text-xs text-neutral-500 ml-1">{doctor.rating}</span>
                            </div>
                            <span className="text-xs text-neutral-400">•</span>
                            <div className="flex items-center">
                              {doctor.network === "apollo" ? (
                                <span className="text-xs text-blue-600 font-medium">Apollo 24/7</span>
                              ) : (
                                <span className="text-xs text-emerald-600 font-medium">Practo</span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-400">•</span>
                            <span className="text-xs text-neutral-500">{doctor.hospital}</span>
                          </div>
                          {doctor.ihisEnabled && (
                            <div className="flex items-center mt-1 text-secondary">
                              <span className="material-icons text-xs mr-1">verified</span>
                              <span className="text-xs">IHIS Integrated</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">{doctor.fee}</p>
                          <p className="text-xs text-neutral-500">per consultation</p>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-neutral-600">
                            Next available: 
                            <span className={`font-medium ml-1 ${doctor.availableToday ? 'text-secondary' : 'text-neutral-500'}`}>
                              {doctor.nextAvailable}
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {doctor.ihisEnabled && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs border-secondary text-secondary hover:bg-secondary/5"
                            >
                              <span className="material-icons text-xs mr-1">share</span>
                              Share IHIS Data
                            </Button>
                          )}
                          <Button 
                            className={`text-white bg-gradient-to-r ${
                              doctor.network === "apollo" 
                                ? "from-blue-600 to-blue-500"
                                : "from-emerald-600 to-emerald-500"
                            }`}
                            onClick={() => setSelectedDoctor(doctor.id)}
                          >
                            <span className="material-icons text-sm mr-1">calendar_month</span>
                            Book Appointment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredDoctors.length === 0 && (
              <div className="col-span-full bg-neutral-50 rounded-lg p-8 text-center">
                <span className="material-icons text-neutral-400 text-4xl mb-2">search_off</span>
                <h3 className="text-lg font-medium text-neutral-700 mb-1">No doctors found</h3>
                <p className="text-neutral-500">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
          
          {/* Appointment Booking Dialog */}
          {selectedDoctor && (
            <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Book Appointment</DialogTitle>
                  <DialogDescription>
                    Select a time slot to book your appointment
                  </DialogDescription>
                </DialogHeader>
                
                {/* Doctor Info */}
                {(() => {
                  const doctor = allDoctors.find(d => d.id === selectedDoctor);
                  if (!doctor) return null;
                  
                  return (
                    <div className="border border-neutral-200 rounded-lg p-3 mt-2 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-primary text-xl">person</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-700">{doctor.name}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-neutral-500">{doctor.specialization}</span>
                          <span className="text-xs text-neutral-400">•</span>
                          <div className="flex items-center text-xs">
                            {doctor.network === "apollo" ? (
                              <span className="text-blue-600 font-medium">Apollo 24/7</span>
                            ) : (
                              <span className="text-emerald-600 font-medium">Practo</span>
                            )}
                          </div>
                          {doctor.ihisEnabled && (
                            <>
                              <span className="text-xs text-neutral-400">•</span>
                              <div className="flex items-center text-xs text-secondary">
                                <span className="material-icons text-xs mr-1">verified</span>
                                <span>IHIS</span>
                              </div>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {doctor.experience} years exp. • {doctor.hospital}
                        </p>
                      </div>
                      <div className="text-right self-start">
                        <p className="text-sm font-medium text-primary">{doctor.fee}</p>
                        <p className="text-xs text-neutral-500">per visit</p>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="grid gap-4 py-4">
                  <div>
                    <Label className="mb-2 block text-neutral-700">Select Date</Label>
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <Calendar 
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="border-none shadow-none"
                        disabled={(date) => date < new Date() || date > new Date(new Date().setDate(new Date().getDate() + 14))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block text-neutral-700">Available Time Slots</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"].map((time) => (
                        <Button 
                          key={time} 
                          variant={selectedTimeSlot === time ? "default" : "outline"} 
                          className={selectedTimeSlot === time ? "text-white" : "text-neutral-700"}
                          onClick={() => setSelectedTimeSlot(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* IHIS Data Sharing */}
                  {allDoctors.find(d => d.id === selectedDoctor)?.ihisEnabled && (
                    <div className="p-3 border border-secondary/20 bg-secondary/5 rounded-lg">
                      <h3 className="font-medium text-secondary flex items-center gap-1 mb-2">
                        <span className="material-icons text-sm">verified</span>
                        IHIS Data Sharing
                      </h3>
                      <p className="text-sm text-neutral-600 mb-3">
                        Share your health records securely with this healthcare provider through Integrated Health Information System (IHIS).
                      </p>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-icons text-primary text-sm">bloodtype</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-sm">Blood Sugar Readings</span>
                              <Label className="flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="rounded text-secondary focus:ring-secondary" 
                                  checked={shareIHISData.bloodSugar}
                                  onChange={e => setShareIHISData({...shareIHISData, bloodSugar: e.target.checked})}
                                />
                              </Label>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-icons text-primary text-sm">favorite</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-sm">Blood Pressure Readings</span>
                              <Label className="flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="rounded text-secondary focus:ring-secondary"
                                  checked={shareIHISData.bloodPressure}
                                  onChange={e => setShareIHISData({...shareIHISData, bloodPressure: e.target.checked})}
                                />
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    className={`w-full text-white ${
                      allDoctors.find(d => d.id === selectedDoctor)?.network === "apollo" 
                        ? "bg-gradient-to-r from-blue-600 to-blue-500"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-500"
                    }`}
                    disabled={!selectedTimeSlot}
                    onClick={() => setSelectedDoctor(null)}
                  >
                    Confirm Booking
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </TabsContent>
        
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>View and manage your upcoming and past appointments</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-neutral-50 rounded-lg p-8 text-center">
                <span className="material-icons text-neutral-400 text-4xl mb-2">calendar_today</span>
                <h3 className="text-lg font-medium text-neutral-700 mb-1">No appointments yet</h3>
                <p className="text-neutral-500 mb-4">Book your first consultation with a specialist</p>
                <Button onClick={() => setActiveTab("doctors")} className="bg-primary">Find a Doctor</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
