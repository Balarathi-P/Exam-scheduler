import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Trash2, 
  Edit, 
  FileSpreadsheet,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Subject } from "@shared/schema";

interface SubjectStats {
  department: string;
  year: string;
  count: number;
}

export default function SubjectLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    department: "",
    year: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch subjects with filters
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ["subjects", selectedDepartment === "all" ? undefined : selectedDepartment, selectedYear === "all" ? undefined : selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDepartment !== "all") params.append("department", selectedDepartment);
      if (selectedYear !== "all") params.append("year", selectedYear);
      
      const response = await apiRequest("GET", `/api/subjects?${params.toString()}`);
      return response.json();
    },
  });

  // Fetch departments
  const { data: departments = [] } = useQuery<string[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subjects/departments");
      return response.json();
    },
  });

  // Fetch subject statistics
  const { data: stats = [] } = useQuery<SubjectStats[]>({
    queryKey: ["subject-stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subjects/stats");
      return response.json();
    },
  });

  // Create subject mutation
  const createSubjectMutation = useMutation({
    mutationFn: (subject: any) => apiRequest("POST", "/api/subjects", subject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["subject-stats"] });
      setIsAddDialogOpen(false);
      setNewSubject({ code: "", name: "", department: "", year: "" });
      toast({
        title: "Success",
        description: "Subject created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create subject",
        variant: "destructive",
      });
    },
  });

  // Delete subject mutation
  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/subjects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subject-stats"] });
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    },
  });

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject =>
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.code || !newSubject.name || !newSubject.department || !newSubject.year) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    createSubjectMutation.mutate(newSubject);
  };

  const handleDeleteSubject = (subject: Subject) => {
    if (confirm(`Are you sure you want to delete ${subject.code} - ${subject.name}?`)) {
      deleteSubjectMutation.mutate(subject.id);
    }
  };

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      CSE: "bg-blue-100 text-blue-800 border-blue-300",
      IT: "bg-green-100 text-green-800 border-green-300",
      ECE: "bg-purple-100 text-purple-800 border-purple-300",
      MECH: "bg-orange-100 text-orange-800 border-orange-300",
      EEE: "bg-yellow-100 text-yellow-800 border-yellow-300",
      CE: "bg-gray-100 text-gray-800 border-gray-300",
      AIML: "bg-indigo-100 text-indigo-800 border-indigo-300",
      CYBER: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[dept] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getYearColor = (year: string) => {
    const colors: Record<string, string> = {
      "1": "bg-emerald-100 text-emerald-800",
      "2": "bg-blue-100 text-blue-800",
      "3": "bg-purple-100 text-purple-800",
      "4": "bg-orange-100 text-orange-800",
    };
    return colors[year] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Timetable
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subject Library</h1>
                <p className="text-gray-600">Manage your department subjects permanently</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                  <DialogDescription>
                    Add a new subject to your library
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Subject Code</Label>
                      <Input
                        id="code"
                        placeholder="e.g., CS301"
                        value={newSubject.code}
                        onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={newSubject.department}
                        onValueChange={(value) => setNewSubject({ ...newSubject, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CSE">CSE</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="ECE">ECE</SelectItem>
                          <SelectItem value="MECH">MECH</SelectItem>
                          <SelectItem value="EEE">EEE</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="AIML">AIML</SelectItem>
                          <SelectItem value="CYBER">CYBER</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="name">Subject Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Data Structures and Algorithms"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={newSubject.year}
                      onValueChange={(value) => setNewSubject({ ...newSubject, year: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-blue-700"
                      disabled={createSubjectMutation.isPending}
                    >
                      {createSubjectMutation.isPending ? "Creating..." : "Create Subject"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="subjects" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subjects">Subject Management</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search subjects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
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
                  <div className="text-sm text-gray-600">
                    {filteredSubjects.length} subjects found
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subjects Table */}
            <Card>
              <CardContent className="p-0">
                {subjectsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-gray-500">Loading subjects...</div>
                  </div>
                ) : filteredSubjects.length === 0 ? (
                  <div className="text-center p-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || selectedDepartment !== "all" || selectedYear !== "all" 
                        ? "Try adjusting your filters" 
                        : "Get started by adding your first subject"}
                    </p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subject
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject Code</TableHead>
                        <TableHead>Subject Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubjects.map((subject) => (
                        <TableRow key={subject.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{subject.code}</TableCell>
                          <TableCell>{subject.name}</TableCell>
                          <TableCell>
                            <Badge className={getDepartmentColor(subject.department)}>
                              {subject.department}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getYearColor(subject.year)}>
                              Year {subject.year}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSubject(subject)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSubject(subject)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.department} - Year {stat.year}
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.count}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.count === 1 ? "subject" : "subjects"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {stats.length === 0 && (
              <Card>
                <CardContent className="text-center p-8">
                  <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No statistics available</h3>
                  <p className="text-gray-500">Add some subjects to see statistics</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}