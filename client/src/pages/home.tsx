import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Save, HelpCircle, BookOpen } from "lucide-react";
import { Link } from "wouter";
import BasicInformationForm from "@/components/BasicInformationForm";
import DepartmentSelection from "@/components/DepartmentSelection";
import SubjectManagement from "@/components/SubjectManagement";
import ExamSettings from "@/components/ExamSettings";
import TimetablePreview from "@/components/TimetablePreview";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Subject } from "@shared/schema";

export interface TimetableData {
  academicYear: string;
  semester: string;
  examType: string;
  referenceNumber: string;
  selectedDepartments: string[];
  selectedYears: string[];
  subjects: Subject[];
  startDate: string;
  endDate: string;
  examDuration: string;
  excludeSundays: boolean;
  excludeSaturdays: boolean;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [timetableData, setTimetableData] = useState<TimetableData>({
    academicYear: "2024-2025",
    semester: "Odd Semester",
    examType: "Internal Assessment - II",
    referenceNumber: "CIT/COE/2025-26/ODD/04",
    selectedDepartments: [],
    selectedYears: [],
    subjects: [],
    startDate: "",
    endDate: "",
    examDuration: "08:00 AM to 09:30 AM",
    excludeSundays: true,
    excludeSaturdays: false,
  });

  const [generatedTimetable, setGeneratedTimetable] = useState<any>(null);

  const updateTimetableData = (updates: Partial<TimetableData>) => {
    setTimetableData(prev => ({ ...prev, ...updates }));
  };

  const steps = [
    { number: 1, title: "Basic Info", component: BasicInformationForm },
    { number: 2, title: "Departments", component: DepartmentSelection },
    { number: 3, title: "Subjects", component: SubjectManagement },
    { number: 4, title: "Schedule", component: ExamSettings },
  ];

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Calendar className="text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  University Exam Timetable Generator
                </h1>
                <p className="text-sm text-gray-500">Automated Scheduling System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/subject-library">
                <Button variant="outline" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Subject Library
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button className="bg-primary hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {steps.map((step, index) => (
                      <div key={step.number} className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              currentStep >= step.number
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {step.number}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              currentStep >= step.number ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className="text-gray-400 mx-2">›</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Step Component */}
            {CurrentStepComponent && (
              <CurrentStepComponent
                data={timetableData}
                updateData={updateTimetableData}
                onNext={() => setCurrentStep(prev => Math.min(prev + 1, 4))}
                onPrev={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                currentStep={currentStep}
                setIsLoading={setIsLoading}
                setGeneratedTimetable={setGeneratedTimetable}
              />
            )}
          </div>

          {/* Timetable Preview Section */}
          <div className="lg:col-span-1">
            <TimetablePreview
              data={timetableData}
              generatedTimetable={generatedTimetable}
            />
          </div>
        </div>
      </div>

      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
}
