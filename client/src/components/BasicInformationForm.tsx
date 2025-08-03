import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TimetableData } from "@/pages/home";

interface BasicInformationFormProps {
  data: TimetableData;
  updateData: (updates: Partial<TimetableData>) => void;
  onNext: () => void;
  currentStep: number;
}

export default function BasicInformationForm({
  data,
  updateData,
  onNext,
}: BasicInformationFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">1</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </Label>
              <Select
                value={data.academicYear}
                onValueChange={(value) => updateData({ academicYear: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Semester</Label>
              <Select
                value={data.semester}
                onValueChange={(value) => updateData({ semester: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Odd Semester">Odd Semester</SelectItem>
                  <SelectItem value="Even Semester">Even Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Exam Type</Label>
              <Select
                value={data.examType}
                onValueChange={(value) => updateData({ examType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Internal Assessment - II">
                    Internal Assessment - II
                  </SelectItem>
                  <SelectItem value="Internal Assessment - I">
                    Internal Assessment - I
                  </SelectItem>
                  <SelectItem value="Internal Assessment - III">
                    Internal Assessment - III
                  </SelectItem>
                  <SelectItem value="End Semester Exam">End Semester Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </Label>
              <Input
                type="text"
                placeholder="CIT/COE/2025-26/ODD/04"
                value={data.referenceNumber}
                onChange={(e) => updateData({ referenceNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" className="bg-primary hover:bg-blue-700">
              Next Step
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
