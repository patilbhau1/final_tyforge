import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar as CalendarIcon, Clock, AlertCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/api";
import { handleApiError, handleApiSuccess } from "@/utils/errorHandler";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, isBefore, isAfter, startOfDay, setHours, setMinutes } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_BASE = `${API_BASE_URL}/api`;
const getToken = () => localStorage.getItem("tyforge_token");

const Meet = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [userJoinedDate, setUserJoinedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [isNightRequest, setIsNightRequest] = useState(false);

  // Generate time slots from 7 AM to 11 PM
  const timeSlots = Array.from({ length: 33 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // Fetch User for joined date
        const userRes = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (userRes.status === 401 || userRes.status === 403) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          // Reset time to midnight for accurate comparisons
          setUserJoinedDate(startOfDay(new Date(userData.created_at)));
        }

        // Fetch Meetings
        const meetingsRes = await fetch(`${API_BASE}/meetings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meetingsRes.ok) {
          const meetingsData = await meetingsRes.json();
          setMeetings(meetingsData);
        }
      } catch (error) {
        handleApiError(error, "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      
      if (!res.ok) throw new Error('Delete failed');
      
      handleApiSuccess('Meeting deleted successfully!');
      
      // Refresh meetings
      const newRes = await fetch(`${API_BASE}/meetings`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (newRes.ok) {
        setMeetings(await newRes.json());
      }
    } catch (error) {
      handleApiError(error, 'Failed to delete meeting');
    }
  };

  const handleBook = async () => {
    if (!date) return;

    setIsBooking(true);
    try {
      console.log('🔍 Debug - Selected Date:', date);
      console.log('🔍 Debug - Selected Time:', selectedTime);
      console.log('🔍 Debug - Is Night Request:', isNightRequest);
      
      // Create date in LOCAL timezone (not UTC)
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      
      let meetingDateTime: Date;
      
      if (selectedTime && !isNightRequest) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        console.log('🔍 Debug - Parsed Hours:', hours, 'Minutes:', minutes);
        
        // Create new Date with local year, month, day, hours, minutes
        meetingDateTime = new Date(year, month, day, hours, minutes, 0, 0);
        console.log('🔍 Debug - Combined DateTime (Local):', meetingDateTime);
      } else {
        meetingDateTime = new Date(year, month, day, 18, 30, 0, 0); // Default 6:30 PM
      }
      
      const isoString = meetingDateTime.toISOString();
      console.log('🔍 Debug - ISO String being sent to backend:', isoString);
      console.log('🔍 Debug - This will be stored in DB and shown as:', new Date(isoString).toLocaleString());
      
      const res = await fetch(`${API_BASE}/meetings/`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${getToken()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: "One-on-One Session",
          description: isNightRequest 
            ? "Night service requested - Initial project consultation" 
            : "Initial project consultation",
          meeting_date: isoString
        }),
      });

      if (!res.ok) throw new Error("Booking failed");
      
      handleApiSuccess("Meeting booked successfully!");
      setDate(undefined);
      setSelectedTime(null);
      setIsNightRequest(false);
      
      // Refresh meetings
      const newRes = await fetch(`${API_BASE}/meetings`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMeetings(await newRes.json());
    } catch (error) {
      handleApiError(error, "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  // Calculate valid date range
  const startDate = userJoinedDate || new Date();
  const endDate = userJoinedDate ? addDays(userJoinedDate, 7) : addDays(new Date(), 7);
  
  // Disable dates outside [joinedDate, joinedDate + 7 days]
  const isDateDisabled = (day: Date) => {
    if (!userJoinedDate) return true;
    return isBefore(day, startDate) || isAfter(day, endDate);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20">
          <Card className="border-2 border-red-100 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Login Required</CardTitle>
              <CardDescription>
                You need to be logged in to schedule a one-on-one session with our team.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700 px-8">
                Login Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">One-on-One Meet</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Booking Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Book Your Session
              </CardTitle>
              <CardDescription>
                You can schedule a free consultation within 7 days of joining.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              {loading ? (
                <div className="py-8 text-gray-500">Loading availability...</div>
              ) : (
                <>
                  <div className="border rounded-md p-4 bg-white shadow-sm w-full flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        setDate(d);
                        setSelectedTime(null); // Reset time when date changes
                      }}
                      disabled={isDateDisabled}
                      initialFocus
                      className="p-0"
                    />
                  </div>
                  
                  {userJoinedDate && isAfter(new Date(), endDate) && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded flex items-start gap-2 w-full">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p>Your 7-day introductory booking period has ended. Please contact support.</p>
                    </div>
                  )}

                  {/* Time Selection Section */}
                  {date && !isAfter(new Date(), endDate) && (
                    <div className="w-full space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Select Time (7am - 11pm)</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-xs ${isNightRequest ? "text-blue-600 bg-blue-50" : "text-gray-500"}`}
                          onClick={() => {
                            setIsNightRequest(!isNightRequest);
                            setSelectedTime(null);
                          }}
                        >
                          {isNightRequest ? "Back to Slots" : "Request Night Service?"}
                        </Button>
                      </div>

                      {!isNightRequest ? (
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTime(time)}
                                className="w-full"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-center">
                          <div className="flex justify-center mb-2">
                            <div className="p-2 bg-indigo-100 rounded-full">
                              <Clock className="w-5 h-5 text-indigo-600" />
                            </div>
                          </div>
                          <h4 className="font-medium text-indigo-900 mb-1">Night Service Request</h4>
                          <p className="text-sm text-indigo-700">
                            Need a session after 11 PM? We can arrange a special late-night consultation for you.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confirmation Section */}
                  <div className="w-full space-y-3 pt-4 border-t">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-blue-800">
                        {date ? (
                          <>
                            <span className="font-bold">{format(date, "PPP")}</span>
                            {isNightRequest ? (
                              <span className="block text-indigo-600 font-medium text-xs mt-1">Night Service Requested</span>
                            ) : selectedTime ? (
                              <span className="block font-bold text-lg mt-1">{selectedTime}</span>
                            ) : (
                              <span className="block text-gray-500 text-xs mt-1">Select a time below</span>
                            )}
                          </>
                        ) : (
                          "Please select a date to start"
                        )}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleBook} 
                      className={`w-full ${isNightRequest ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"}`}
                      disabled={!date || (!selectedTime && !isNightRequest) || isBooking}
                    >
                      {isBooking ? "Booking..." : isNightRequest ? "Request Night Session" : "Confirm Booking"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Guidelines / Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">What to expect:</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>30-minute one-on-one discussion</li>
                  <li>Project scope and feasibility review</li>
                  <li>Technology stack recommendation</li>
                  <li>Roadmap planning assistance</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-yellow-800">
                <p className="font-medium mb-1">📅 Booking Policy</p>
                <p>Sessions must be booked within the first week of your account creation. This ensures you get started on the right track immediately.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Existing Meetings List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Scheduled Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No upcoming meetings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((meet: any) => (
                  <div key={meet.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Video className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{meet.title || "One-on-One Session"}</p>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            if (!meet.meeting_date) return "Date pending";
                            // Parse the ISO date string - it will automatically convert from UTC to local timezone
                            const d = new Date(meet.meeting_date);
                            if (isNaN(d.getTime())) return "Date pending";
                            // This will display in user's local timezone
                            return format(d, "PPP p");
                          })()}
                        </p>
                        {meet.description && (
                          <p className="text-xs text-gray-400 mt-1">{meet.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={meet.status === "Scheduled" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-blue-100 text-blue-800 hover:bg-blue-100"}>
                        {meet.status || "Requested"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(meet.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Meet;