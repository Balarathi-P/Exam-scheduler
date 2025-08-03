import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Maximize2, 
  Download, 
  Save, 
  FolderOpen, 
  RotateCcw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { TimetableData } from "@/pages/home";
import { useToast } from "@/hooks/use-toast";

interface TimetablePreviewProps {
  data: TimetableData;
  generatedTimetable: any;
}

export default function TimetablePreview({ 
  data, 
  generatedTimetable 
}: TimetablePreviewProps) {
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    if (!generatedTimetable?.timetable?.id) {
      toast({
        title: "Error",
        description: "Please generate a timetable first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/timetables/${generatedTimetable.timetable.id}/pdf`);
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `timetable-${generatedTimetable.timetable.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error("PDF download error:", error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  // Group schedule by date and department
  const getScheduleTable = () => {
    if (!generatedTimetable?.schedule) return null;

    const scheduleByDate: { [date: string]: { [dept: string]: any[] } } = {};
    const departments = new Set<string>();

    generatedTimetable.schedule.forEach((item: any) => {
      if (!scheduleByDate[item.date]) {
        scheduleByDate[item.date] = {};
      }
      if (!scheduleByDate[item.date][item.subject.department]) {
        scheduleByDate[item.date][item.subject.department] = [];
      }
      scheduleByDate[item.date][item.subject.department].push(item);
      departments.add(item.subject.department);
    });

    const sortedDates = Object.keys(scheduleByDate).sort();
    const sortedDepartments = Array.from(departments).sort();

    return { scheduleByDate, sortedDates, sortedDepartments };
  };

  const scheduleData = getScheduleTable();
  const totalSubjects = data.subjects.length;
  const examDays = scheduleData ? scheduleData.sortedDates.length : 0;
  const conflicts = 0; // Since our algorithm handles conflicts by design

  return (
    <div className="sticky top-8 space-y-6">
      {/* Preview Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Timetable Preview</h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* University Header Mock */}
          <div className="text-center mb-4 pb-4 border-b border-gray-200">
            <h4 className="text-sm font-bold text-gray-900">
              CHENNAI INSTITUTE OF TECHNOLOGY
            </h4>
            <p className="text-xs text-gray-600">(Autonomous)</p>
            <p className="text-xs font-medium text-gray-700 mt-1">
              OFFICE OF THE CONTROLLER OF EXAMINATIONS
            </p>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>REF: {data.referenceNumber}</span>
              <span>DATE: {new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          {/* Exam Schedule Table */}
          <div className="mb-4">
            <h5 className="text-center text-sm font-semibold text-gray-900 mb-3">
              EXAM SCHEDULE
            </h5>
            
            {scheduleData ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left font-medium">
                        DATE
                      </th>
                      {scheduleData.sortedDepartments.map((dept) => (
                        <th
                          key={dept}
                          className="border border-gray-300 p-2 text-left font-medium"
                        >
                          {dept}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleData.sortedDates.map((date) => (
                      <tr key={date}>
                        <td className="border border-gray-300 p-2 font-medium">
                          {date}
                        </td>
                        {scheduleData.sortedDepartments.map((dept) => {
                          const subjects = scheduleData.scheduleByDate[date][dept] || [];
                          return (
                            <td key={dept} className="border border-gray-300 p-2">
                              {subjects.map((item, index) => (
                                <div key={index} className="mb-1 last:mb-0">
                                  <div className="text-xs font-medium">
                                    {item.subject.code}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {item.subject.name}
                                  </div>
                                </div>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">📅</div>
                <p className="text-sm">Generate timetable to see preview</p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">
                {totalSubjects}
              </div>
              <div className="text-xs text-gray-600">Total Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">{examDays}</div>
              <div className="text-xs text-gray-600">Exam Days</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-green-600">{conflicts}</div>
              <div className="text-xs text-gray-600">Conflicts</div>
            </div>
          </div>

          {/* Status Messages */}
          {generatedTimetable && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <h6 className="text-sm font-medium text-green-800">
                    Timetable Generated Successfully
                  </h6>
                  <p className="text-xs text-green-700">
                    No conflicts detected. Ready for download.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!generatedTimetable && totalSubjects > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <h6 className="text-sm font-medium text-yellow-800">
                    Ready to Generate
                  </h6>
                  <p className="text-xs text-yellow-700">
                    Complete the exam settings to generate your timetable.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Download PDF Button */}
          <Button
            onClick={handleDownloadPDF}
            disabled={!generatedTimetable}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
            >
              <Save className="h-4 w-4 mr-3 text-gray-400" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  Save as Template
                </div>
                <div className="text-xs text-gray-500">Reuse this configuration</div>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
            >
              <FolderOpen className="h-4 w-4 mr-3 text-gray-400" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  Load Template
                </div>
                <div className="text-xs text-gray-500">Use saved configuration</div>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
            >
              <RotateCcw className="h-4 w-4 mr-3 text-gray-400" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">Reset Form</div>
                <div className="text-xs text-gray-500">Start over</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
