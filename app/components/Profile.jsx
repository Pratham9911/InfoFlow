import { CameraIcon, EnvelopeIcon, PhoneIcon, BriefcaseIcon, CalendarIcon, IdentificationIcon, MapPinIcon, AcademicCapIcon } from "@heroicons/react/24/solid";

export default function ProfilePage() {
  const employee = {
    name: "Ravi Kumar",
    designation: "Senior Engineer",
    department: "Operations",
    email: "ravi.kumar@kmrl.in",
    phone: "+91 98765 43210",
    location: "Kochi, Kerala",
    employeeId: "K-10293",
    role: "Admin",
    joiningDate: "January 15, 2015",
    workExperience: "8 years",
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
  };

  const timelineEvents = [
    { year: 2015, description: "Joined KMRL as Junior Engineer" },
    { year: 2016, description: "Successfully completed project 'Metro Phase 1 Expansion'" },
    { year: 2017, description: "Promoted to Engineer, led a team of 3" },
    { year: 2018, description: "Received 'Innovation Award' for process optimization" },
    { year: 2019, description: "Became Senior Engineer, mentored junior staff" },
    { year: 2021, description: "Implemented new operations management system" },
    { year: 2023, description: "Currently managing critical infrastructure projects" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-xl overflow-hidden p-8 md:p-10">

        {/* Header Section with Photo and Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 pb-6 border-b border-gray-200 mb-8">
          <div className="relative">
            <img
              src={employee.photo}
              alt={employee.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-300 shadow-sm"
            />
            <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700 transition-colors">
              <CameraIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-800">{employee.name}</h1>
            <p className="text-xl text-gray-600 mt-1">{employee.designation}</p>
            <p className="text-md text-gray-500">{employee.department}</p>
          </div>
        </div>

        {/* Main Content Sections in a Single Column */}
        <div className="space-y-10">

          {/* Details Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-indigo-500 pb-2">Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center text-gray-700">
                <EnvelopeIcon className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
<a href={`mailto:${employee.email}`} className="text-indigo-600 hover:underline text-base font-medium">
  {employee.email}
</a>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <PhoneIcon className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <span className="text-gray-800 text-base font-medium">{employee.phone}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <MapPinIcon className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <span className="text-gray-800 text-base font-medium">{employee.location}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <IdentificationIcon className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <span className="text-gray-800 text-base font-medium">{employee.employeeId}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <AcademicCapIcon className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <span className="text-gray-800 text-base font-medium">{employee.role}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <CalendarIcon className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Joining Date</p>
                  <span className="text-gray-800 text-base font-medium">{employee.joiningDate}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <BriefcaseIcon className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Work Experience</p>
                  <span className="text-gray-800 text-base font-medium">{employee.workExperience}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-2 border-indigo-500 pb-2">Timeline</h2>
            <div className="relative pl-4">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300 rounded-full"></div>
              {timelineEvents.map((event, index) => (
                <div key={index} className="mb-6 flex items-start">
                  <div className="absolute left-0 w-3 h-3 bg-indigo-600 rounded-full mt-1 -ml-1.5 z-10"></div>
                  <div className="ml-8">
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full uppercase mb-1">
                      {event.year}
                    </span>
                    <p className="text-gray-700 text-lg">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}