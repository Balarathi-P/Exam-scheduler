import { useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { FileSpreadsheet, Plus, Trash2, Upload, BookOpen, Search } from "lucide-react";
import { TimetableData } from "@/pages/home";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Subject } from "@shared/schema";

interface SubjectManagementProps {
  data: TimetableData;
  updateData: (updates: Partial<TimetableData>) => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
}

export default function SubjectManagement({
  data,
  updateData,
  onNext,
  onPrev,
}: SubjectManagementProps) {
  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    department: "",
    year: "",
  });
  const [showImportArea, setShowImportArea] = useState(false);
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [librarySearchTerm, setLibrarySearchTerm] = useState("");
  const [selectedLibraryDept, setSelectedLibraryDept] = useState<string>("all");
  const [selectedLibraryYear, setSelectedLibraryYear] = useState<string>("all");
  const [selectedLibrarySubjects, setSelectedLibrarySubjects] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch library subjects
  const { data: librarySubjects = [], isLoading: libraryLoading } = useQuery<Subject[]>({
    queryKey: ["library-subjects", selectedLibraryDept === "all" ? undefined : selectedLibraryDept, selectedLibraryYear === "all" ? undefined : selectedLibraryYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedLibraryDept !== "all") params.append("department", selectedLibraryDept);
      if (selectedLibraryYear !== "all") params.append("year", selectedLibraryYear);
      
      const response = await apiRequest("GET", `/api/subjects?${params.toString()}`);
      return response.json();
    },
    enabled: showLibraryDialog,
  });

  // Fetch departments for library
  const { data: libraryDepartments = [] } = useQuery<string[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subjects/departments");
      return response.json();
    },
    enabled: showLibraryDialog,
  });

  const createSubjectMutation = useMutation({
    mutationFn: (subject: any) => apiRequest("POST", "/api/subjects", subject),
    onSuccess: (response) => {
      response.json().then((createdSubject: Subject) => {
        updateData({
          subjects: [...data.subjects, createdSubject],
        });
        toast({
          title: "Success",
          description: "Subject added successfully",
        });
        setNewSubject({ code: "", name: "", department: "", year: "" });
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add subject",
        variant: "destructive",
      });
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: (formData: FormData) =>
      fetch("/api/subjects/bulk-import", {
        method: "POST",
        body: formData,
      }),
    onSuccess: (response) => {
      if (response.ok) {
        response.json().then((importedSubjects: Subject[]) => {
          updateData({
            subjects: [...data.subjects, ...importedSubjects],
          });
          toast({
            title: "Success",
            description: `${importedSubjects.length} subjects imported successfully`,
          });
          setShowImportArea(false);
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to import subjects",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to import subjects",
        variant: "destructive",
      });
    },
  });

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSubject.code || !newSubject.name || !newSubject.department || !newSubject.year) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!data.selectedDepartments.includes(newSubject.department)) {
      toast({
        title: "Error",
        description: "Please select a department that you've chosen in step 2",
        variant: "destructive",
      });
      return;
    }

    if (!data.selectedYears.includes(newSubject.year)) {
      toast({
        title: "Error",
        description: "Please select a year that you've chosen in step 2",
        variant: "destructive",
      });
      return;
    }

    createSubjectMutation.mutate(newSubject);
  };

  const handleRemoveSubject = (index: number) => {
    const updatedSubjects = data.subjects.filter((_, i) => i !== index);
    updateData({ subjects: updatedSubjects });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    bulkImportMutation.mutate(formData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.subjects.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one subject",
        variant: "destructive",
      });
      return;
    }
    onNext();
  };

  const filteredLibrarySubjects = librarySubjects.filter(subject =>
    subject.code.toLowerCase().includes(librarySearchTerm.toLowerCase()) ||
    subject.name.toLowerCase().includes(librarySearchTerm.toLowerCase())
  );

  const handleLibrarySubjectToggle = (subjectId: string) => {
    setSelectedLibrarySubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleLoadFromLibrary = () => {
    const subjectsToAdd = librarySubjects.filter(subject => 
      selectedLibrarySubjects.includes(subject.id)
    );
    
    // Filter out subjects that are already added
    const newSubjects = subjectsToAdd.filter(libSubject => 
      !data.subjects.some(existingSubject => existingSubject.id === libSubject.id)
    );

    if (newSubjects.length === 0) {
      toast({
        title: "Info",
        description: "Selected subjects are already added",
      });
      return;
    }

    updateData({
      subjects: [...data.subjects, ...newSubjects],
    });

    toast({
      title: "Success",
      description: `${newSubjects.length} subjects loaded from library`,
    });

    setShowLibraryDialog(false);
    setSelectedLibrarySubjects([]);
    setLibrarySearchTerm("");
    setSelectedLibraryDept("all");
    setSelectedLibraryYear("all");
  };

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      CSE: "bg-blue-100 text-blue-800",
      IT: "bg-green-100 text-green-800",
      ECE: "bg-purple-100 text-purple-800",
      MECH: "bg-orange-100 text-orange-800",
      EEE: "bg-yellow-100 text-yellow-800",
      CE: "bg-gray-100 text-gray-800",
      AIML: "bg-indigo-100 text-indigo-800",
      CYBER: "bg-red-100 text-red-800",
    };
    return colors[dept] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">3</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Subject Management</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={showLibraryDialog} onOpenChange={setShowLibraryDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Load from Library</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Load Subjects from Library</DialogTitle>
                  <DialogDescription>
                    Select subjects from your permanent library to add to this timetable
                  </DialogDescription>
                </DialogHeader>
                
                {/* Library Filters */}
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 py-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search subjects..."
                      value={librarySearchTerm}
                      onChange={(e) => setLibrarySearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedLibraryDept} onValueChange={setSelectedLibraryDept}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {libraryDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLibraryYear} onValueChange={setSelectedLibraryYear}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Library Subjects List */}
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {libraryLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-gray-500">Loading subjects...</div>
                    </div>
                  ) : filteredLibrarySubjects.length === 0 ? (
                    <div className="text-center p-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
                      <p className="text-gray-500">Try adjusting your filters or add subjects to your library first</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {filteredLibrarySubjects.map((subject) => {
                        const isAlreadyAdded = data.subjects.some(s => s.id === subject.id);
                        return (
                          <div
                            key={subject.id}
                            className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 ${
                              isAlreadyAdded ? 'opacity-50 bg-gray-100' : ''
                            }`}
                          >
                            <Checkbox
                              checked={selectedLibrarySubjects.includes(subject.id)}
                              onCheckedChange={() => handleLibrarySubjectToggle(subject.id)}
                              disabled={isAlreadyAdded}
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {subject.code}
                                </div>
                                <div className="text-sm text-gray-600">{subject.name}</div>
                                <Badge className={getDepartmentColor(subject.department)}>
                                  {subject.department}
                                </Badge>
                                <Badge variant="secondary">Year {subject.year}</Badge>
                                {isAlreadyAdded && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    Already Added
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-gray-600">
                    {selectedLibrarySubjects.length} subjects selected
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowLibraryDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleLoadFromLibrary}
                      disabled={selectedLibrarySubjects.length === 0}
                      className="bg-primary hover:bg-blue-700"
                    >
                      Load Selected Subjects
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              onClick={() => setShowImportArea(!showImportArea)}
              className="flex items-center space-x-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Bulk Import from Excel/CSV</span>
            </Button>
          </div>
        </div>

        {/* Manual Subject Entry */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Add Subject Manually</h3>
          <form onSubmit={handleAddSubject}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="Subject Code (e.g., CS301)"
                  value={newSubject.code}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, code: e.target.value })
                  }
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Subject Name (e.g., Data Structures)"
                  value={newSubject.name}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Select
                  value={newSubject.department}
                  onValueChange={(value) =>
                    setNewSubject({ ...newSubject, department: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.selectedDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={newSubject.year}
                  onValueChange={(value) =>
                    setNewSubject({ ...newSubject, year: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.selectedYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-blue-700"
                  disabled={createSubjectMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Excel/CSV Import Area */}
        {showImportArea && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Upload Excel/CSV File
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Drop your file here or click to browse
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-blue-700"
                disabled={bulkImportMutation.isPending}
              >
                {bulkImportMutation.isPending ? "Uploading..." : "Choose File"}
              </Button>
              <div className="mt-4 text-xs text-gray-500">
                <p>Expected format: Subject Code, Subject Name, Department, Year</p>
              </div>
            </div>
          </div>
        )}

        {/* Added Subjects List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Added Subjects:</h3>
            <span className="text-xs text-gray-500">
              {data.subjects.length} subjects added
            </span>
          </div>

          {data.subjects.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.subjects.map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-900">
                      {subject.code}
                    </div>
                    <div className="text-sm text-gray-600">{subject.name}</div>
                    <Badge className={getDepartmentColor(subject.department)}>
                      {subject.department}
                    </Badge>
                    <Badge variant="secondary">{subject.year}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSubject(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-3xl text-gray-300 mb-2">📚</div>
              <p className="text-sm text-gray-500">No subjects added yet</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
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
