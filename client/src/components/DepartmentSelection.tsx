import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimetableData } from "@/pages/home";

interface DepartmentSelectionProps {
  data: TimetableData;
  updateData: (updates: Partial<TimetableData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
}

const DEPARTMENTS = [
  { code: "CE", name: "Civil Engineering" },
  { code: "CSE", name: "Computer Science Engineering" },
  { code: "IT", name: "Information Technology" },
  { code: "ECE", name: "Electronics & Communication" },
  { code: "MECH", name: "Mechanical Engineering" },
  { code: "EEE", name: "Electrical & Electronics" },
  { code: "AIML", name: "Artificial Intelligence & Machine Learning" },
  { code: "CYBER", name: "Cyber Security" },
];

const YEARS = ["I Year", "II Year", "III Year", "IV Year"];

export default function DepartmentSelection({
  data,
  updateData,
  onNext,
  onPrev,
}: DepartmentSelectionProps) {
  const handleDepartmentChange = (deptCode: string, checked: boolean) => {
    const updatedDepartments = checked
      ? [...data.selectedDepartments, deptCode]
      : data.selectedDepartments.filter((d) => d !== deptCode);
    updateData({ selectedDepartments: updatedDepartments });
  };

  const handleYearChange = (year: string, checked: boolean) => {
    const updatedYears = checked
      ? [...data.selectedYears, year]
      : data.selectedYears.filter((y) => y !== year);
    updateData({ selectedYears: updatedYears });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.selectedDepartments.length === 0 || data.selectedYears.length === 0) {
      alert("Please select at least one department and one year");
      return;
    }
    onNext();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">2</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Department & Year Selection
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3">
                Departments
              </Label>
              <ScrollArea className="h-48 border border-gray-200 rounded-lg p-3">
                <div className="space-y-2">
                  {DEPARTMENTS.map((dept) => (
                    <label
                      key={dept.code}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <Checkbox
                        checked={data.selectedDepartments.includes(dept.code)}
                        onCheckedChange={(checked) =>
                          handleDepartmentChange(dept.code, !!checked)
                        }
                      />
                      <span className="text-sm text-gray-700">
                        {dept.code} - {dept.name}
                      </span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3">
                Year/Semester
              </Label>
              <div className="space-y-2">
                {YEARS.map((year) => (
                  <label
                    key={year}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <Checkbox
                      checked={data.selectedYears.includes(year)}
                      onCheckedChange={(checked) =>
                        handleYearChange(year, !!checked)
                      }
                    />
                    <span className="text-sm text-gray-700">{year}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button type="button" variant="outline" onClick={onPrev}>
              Previous
            </Button>
            <Button type="submit" className="bg-primary hover:bg-blue-700">
              Next Step
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
