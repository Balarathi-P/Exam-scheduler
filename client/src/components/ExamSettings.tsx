import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles } from "lucide-react";
import { TimetableData } from "@/pages/home";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ExamSettingsProps {
  data: TimetableData;
  updateData: (updates: Partial<TimetableData>) => void;
  onPrev: () => void;
  currentStep: number;
  setIsLoading: (loading: boolean) => void;
  setGeneratedTimetable: (timetable: any) => void;
}

export default function ExamSettings({
  data,
  updateData,
  onPrev,
  setIsLoading,
  setGeneratedTimetable,
}: ExamSettingsProps) {
  const { toast } = useToast();

  const generateTimetableMutation = useMutation({
    mutationFn: (timetableData: any) =>
      apiRequest("POST", "/api/timetables/generate", timetableData),
    onSuccess: (response) => {
      response.json().then((result) => {
        setGeneratedTimetable(result);
        toast({
          title: "Success",
          description: "Timetable generated successfully!",
        });
      });
    },
    onError: (error) => {
      console.error("Timetable generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate timetable. Please try again.",
        variant: "destructive",
      });
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleGenerateTimetable = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.startDate || !data.endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (data.subjects.length === 0) {
      toast({
        title: "Error",
        description: "Please add subjects before generating timetable",
        variant: "destructive",
      });
      return;
    }

    const timetableData = {
      academicYear: data.academicYear,
      semester: data.semester,
      examType: data.examType,
      referenceNumber: data.referenceNumber,
      startDate: data.startDate,
      endDate: data.endDate,
      examDuration: data.examDuration,
      excludeSundays: data.excludeSundays,
      excludeSaturdays: data.excludeSaturdays,
      selectedSubjects: data.subjects,
    };

    generateTimetableMutation.mutate(timetableData);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">4</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Exam Period & Settings
          </h2>
        </div>

        <form onSubmit={handleGenerateTimetable}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Start Date
              </Label>
              <Input
                type="date"
                value={data.startDate}
                onChange={(e) => updateData({ startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                End Date
              </Label>
              <Input
                type="date"
                value={data.endDate}
                onChange={(e) => updateData({ endDate: e.target.value })}
                min={data.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Exam Duration
              </Label>
              <Select
                value={data.examDuration}
                onValueChange={(value) => updateData({ examDuration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00 AM to 09:30 AM">
                    08:00 AM to 09:30 AM
                  </SelectItem>
                  <SelectItem value="10:00 AM to 11:30 AM">
                    10:00 AM to 11:30 AM
                  </SelectItem>
                  <SelectItem value="02:00 PM to 03:30 PM">
                    02:00 PM to 03:30 PM
                  </SelectItem>
                  <SelectItem value="04:00 PM to 05:30 PM">
                    04:00 PM to 05:30 PM
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3">
                Exclude Days
              </Label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={data.excludeSundays}
                    onCheckedChange={(checked) =>
                      updateData({ excludeSundays: !!checked })
                    }
                  />
                  <span className="text-sm text-gray-700">Sundays</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={data.excludeSaturdays}
                    onCheckedChange={(checked) =>
                      updateData({ excludeSaturdays: !!checked })
                    }
                  />
                  <span className="text-sm text-gray-700">Saturdays</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrev}>
                Previous
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-blue-700"
                disabled={generateTimetableMutation.isPending}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generateTimetableMutation.isPending
                  ? "Generating..."
                  : "Generate Timetable"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
