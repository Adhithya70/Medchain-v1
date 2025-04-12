"use client"

import type React from "react"
import { logRecordAdded, logRecordDeleted } from "@/lib/blockchainlogger"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, Edit, Download, FileText, User, UserPlus } from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import {
  initializeStorage,
  getCurrentUser,
  generateRecordHash,
  bloodGroups,
  filterUsers,
  filterRecords,
  formatDate,
  generateId,
} from "@/lib/utils"

export default function DoctorDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [patients, setPatients] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Search and filter state
  const [patientSearch, setPatientSearch] = useState("")
  const [recordSearch, setRecordSearch] = useState("")

  // New patient form state
  const [newPatientId, setNewPatientId] = useState("")
  const [newPatientName, setNewPatientName] = useState("")
  const [newPatientPassword, setNewPatientPassword] = useState("")
  const [newPatientAge, setNewPatientAge] = useState("")
  const [newPatientSex, setNewPatientSex] = useState("")
  const [newPatientBloodGroup, setNewPatientBloodGroup] = useState("")
  const [newPatientRemarks, setNewPatientRemarks] = useState("")

  // Edit patient state
  const [editPatientId, setEditPatientId] = useState("")
  const [editPatientName, setEditPatientName] = useState("")
  const [editPatientPassword, setEditPatientPassword] = useState("")
  const [editPatientAge, setEditPatientAge] = useState("")
  const [editPatientSex, setEditPatientSex] = useState("")
  const [editPatientBloodGroup, setEditPatientBloodGroup] = useState("")
  const [editPatientRemarks, setEditPatientRemarks] = useState("")
  const [editPatientDialogOpen, setEditPatientDialogOpen] = useState(false)

  // New record form state
  const [recordPatientId, setRecordPatientId] = useState("")
  const [recordDescription, setRecordDescription] = useState("")
  const [recordFile, setRecordFile] = useState<File | null>(null)

  useEffect(() => {
    initializeStorage()
    loadData()
    setCurrentUser(getCurrentUser())
  }, [])

  const loadData = () => {
    setPatients(JSON.parse(localStorage.getItem("patients") || "[]"))
    setRecords(JSON.parse(localStorage.getItem("records") || "[]"))
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if patient ID already exists
    if (patients.some((patient) => patient.id === newPatientId)) {
      toast({
        title: "Error",
        description: "Patient ID already exists",
        variant: "destructive",
      })
      return
    }

    const newPatient = {
      id: newPatientId,
      name: newPatientName,
      password: newPatientPassword,
      age: newPatientAge,
      sex: newPatientSex,
      bloodGroup: newPatientBloodGroup,
      remarks: newPatientRemarks,
      registrationDate: new Date().toISOString(),
    }

    const updatedPatients = [...patients, newPatient]
    localStorage.setItem("patients", JSON.stringify(updatedPatients))
    setPatients(updatedPatients)

    // Reset form
    setNewPatientId("")
    setNewPatientName("")
    setNewPatientPassword("")
    setNewPatientAge("")
    setNewPatientSex("")
    setNewPatientBloodGroup("")
    setNewPatientRemarks("")

    toast({
      title: "Success",
      description: "Patient added successfully",
    })
  }

  const handleEditPatient = (patient: any) => {
    setEditPatientId(patient.id)
    setEditPatientName(patient.name)
    setEditPatientPassword(patient.password)
    setEditPatientAge(patient.age || "")
    setEditPatientSex(patient.sex || "")
    setEditPatientBloodGroup(patient.bloodGroup || "")
    setEditPatientRemarks(patient.remarks || "")
    setEditPatientDialogOpen(true)
  }

  const handleUpdatePatient = () => {
    const updatedPatients = patients.map((patient) => {
      if (patient.id === editPatientId) {
        return {
          ...patient,
          name: editPatientName,
          password: editPatientPassword,
          age: editPatientAge,
          sex: editPatientSex,
          bloodGroup: editPatientBloodGroup,
          remarks: editPatientRemarks,
        }
      }
      return patient
    })

    localStorage.setItem("patients", JSON.stringify(updatedPatients))
    setPatients(updatedPatients)
    setEditPatientDialogOpen(false)

    toast({
      title: "Success",
      description: "Patient updated successfully",
    })
  }

  const handleDeletePatient = (patientId: string) => {
    // Check if patient has any records
    const patientRecords = records.filter((record) => record.patientId === patientId)
    if (patientRecords.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "This patient has associated medical records. Delete those first.",
        variant: "destructive",
      })
      return
    }

    const updatedPatients = patients.filter((patient) => patient.id !== patientId)
    localStorage.setItem("patients", JSON.stringify(updatedPatients))
    setPatients(updatedPatients)

    toast({
      title: "Success",
      description: "Patient deleted successfully",
    })
  }

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Check if patient exists
    if (!patients.some((patient) => patient.id === recordPatientId)) {
      toast({
        title: "Error",
        description: "Patient not found",
        variant: "destructive",
      });
      return;
    }
  
    if (!recordFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target?.result) return;
  
      const fileData = event.target.result.toString();
      const recordData = {
        id: generateId("rec"),
        patientId: recordPatientId,
        description: recordDescription,
        fileName: recordFile.name,
        fileType: recordFile.type,
        fileSize: recordFile.size,
        fileData,
        createdBy: currentUser?.id || "unknown",
        createdAt: new Date().toISOString(),
      };
  
      const hash = await generateRecordHash(recordData);
      const newRecord = { ...recordData, hash };
  
      const allRecords = JSON.parse(localStorage.getItem("records") || "[]");
      const updatedRecords = [...allRecords, newRecord];
      localStorage.setItem("records", JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
  
      // 🔗 Blockchain log
      try {
        await logRecordAdded(newRecord.id, hash, recordPatientId, currentUser?.id || "unknown");
      } catch (err) {
        console.error("Blockchain log failed (doctor add):", err);
      }
  
      // Reset form
      setRecordPatientId("");
      setRecordDescription("");
      setRecordFile(null);
  
      toast({
        title: "Success",
        description: "Medical record added and logged to blockchain",
      });
    };
  
    reader.readAsDataURL(recordFile);
  };
  
  const handleDeleteRecord = async (recordId: string) => {
    const allRecords = JSON.parse(localStorage.getItem("records") || "[]");
    const recordToDelete = allRecords.find((record: any) => record.id === recordId);
  
    if (!recordToDelete) return;
  
    // Enforce doctor permission
    if (recordToDelete.createdBy !== currentUser?.id) {
      toast({
        title: "Permission Denied",
        description: "You can only delete records that you created.",
        variant: "destructive",
      });
      return;
    }
  
    const updatedRecords = allRecords.filter((record: any) => record.id !== recordId);
    localStorage.setItem("records", JSON.stringify(updatedRecords));
    setRecords(records.filter((record) => record.id !== recordId));
  
    // 🔗 Blockchain log
    try {
      await logRecordDeleted(recordId);
    } catch (err) {
      console.error("Blockchain log failed (doctor delete):", err);
    }
  
    toast({
      title: "Success",
      description: "Record deleted and logged to blockchain",
    });
  };    

  // Filter data based on search terms
  const filteredPatients = filterUsers(patients, patientSearch)
  const filteredRecords = filterRecords(records, recordSearch)

  return (
    <AuthGuard role="doctor">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center mb-6 bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-full">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
                <p className="text-gray-400 text-sm">Manage patients and medical records</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Logout
            </Button>
          </div>

          <Tabs defaultValue="patients" className="space-y-4">
            <TabsList className="bg-gray-800/50 border border-gray-700 p-1">
              <TabsTrigger value="patients" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Patients
              </TabsTrigger>
              <TabsTrigger value="records" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Medical Records
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patients">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-800/50 border-gray-700 col-span-1">
                  <CardHeader>
                    <CardTitle className="text-blue-400 flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Add New Patient
                    </CardTitle>
                    <CardDescription className="text-gray-400">Create a new patient account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddPatient} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="patientId" className="text-gray-300">
                          Patient ID
                        </Label>
                        <Input
                          id="patientId"
                          value={newPatientId}
                          onChange={(e) => setNewPatientId(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patientName" className="text-gray-300">
                          Name
                        </Label>
                        <Input
                          id="patientName"
                          value={newPatientName}
                          onChange={(e) => setNewPatientName(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patientPassword" className="text-gray-300">
                          Password
                        </Label>
                        <Input
                          id="patientPassword"
                          type="password"
                          value={newPatientPassword}
                          onChange={(e) => setNewPatientPassword(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="patientAge" className="text-gray-300">
                            Age
                          </Label>
                          <Input
                            id="patientAge"
                            type="number"
                            value={newPatientAge}
                            onChange={(e) => setNewPatientAge(e.target.value)}
                            required
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="patientSex" className="text-gray-300">
                            Sex
                          </Label>
                          <Select value={newPatientSex} onValueChange={setNewPatientSex}>
                            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patientBloodGroup" className="text-gray-300">
                          Blood Group
                        </Label>
                        <Select value={newPatientBloodGroup} onValueChange={setNewPatientBloodGroup}>
                          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            {bloodGroups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patientRemarks" className="text-gray-300">
                          Remarks (Optional)
                        </Label>
                        <Textarea
                          id="patientRemarks"
                          value={newPatientRemarks}
                          onChange={(e) => setNewPatientRemarks(e.target.value)}
                          className="bg-gray-700/50 border-gray-600 text-white min-h-[80px]"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Add Patient
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700 col-span-1 lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-blue-400 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Patients List
                      </CardTitle>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search patients..."
                          value={patientSearch}
                          onChange={(e) => setPatientSearch(e.target.value)}
                          className="pl-10 bg-gray-700/50 border-gray-600 text-white w-[250px]"
                        />
                      </div>
                    </div>
                    <CardDescription className="text-gray-400">All registered patients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredPatients.length === 0 ? (
                      <p className="text-center text-gray-500">No patients registered yet</p>
                    ) : (
                      <div className="rounded-md border border-gray-700 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gray-700/50">
                            <TableRow className="hover:bg-gray-700/70 border-gray-700">
                              <TableHead className="text-gray-300">ID</TableHead>
                              <TableHead className="text-gray-300">Name</TableHead>
                              <TableHead className="text-gray-300 hidden md:table-cell">Age/Sex</TableHead>
                              <TableHead className="text-gray-300 hidden lg:table-cell">Blood Group</TableHead>
                              <TableHead className="text-gray-300 hidden lg:table-cell">Registration Date</TableHead>
                              <TableHead className="text-gray-300 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredPatients.map((patient) => (
                              <TableRow key={patient.id} className="hover:bg-gray-700/70 border-gray-700">
                                <TableCell className="font-medium text-gray-300">{patient.id}</TableCell>
                                <TableCell className="text-gray-300">{patient.name}</TableCell>
                                <TableCell className="text-gray-300 hidden md:table-cell">
                                  {patient.age || "N/A"} /{" "}
                                  {patient.sex ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1) : "N/A"}
                                </TableCell>
                                <TableCell className="text-gray-300 hidden lg:table-cell">
                                  {patient.bloodGroup ? (
                                    <Badge variant="outline" className="bg-gray-700 text-white border-gray-600">
                                      {patient.bloodGroup}
                                    </Badge>
                                  ) : (
                                    "N/A"
                                  )}
                                </TableCell>
                                <TableCell className="text-gray-300 hidden lg:table-cell">
                                  {patient.registrationDate ? formatDate(patient.registrationDate) : "N/A"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 border-gray-600 text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                                      onClick={() => handleEditPatient(patient)}
                                    >
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-8 w-8 p-0 border-gray-600 text-red-400 hover:text-red-300 hover:bg-gray-700"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          <span className="sr-only">Delete</span>
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="bg-gray-800 border-gray-700">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription className="text-gray-400">
                                            This will permanently delete {patient.name}'s account and cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 text-white hover:bg-red-700"
                                            onClick={() => handleDeletePatient(patient.id)}
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Edit Patient Dialog */}
              <Dialog open={editPatientDialogOpen} onOpenChange={setEditPatientDialogOpen}>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-blue-400">Edit Patient</DialogTitle>
                    <DialogDescription className="text-gray-400">Update patient information</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="editPatientName" className="text-gray-300">
                        Name
                      </Label>
                      <Input
                        id="editPatientName"
                        value={editPatientName}
                        onChange={(e) => setEditPatientName(e.target.value)}
                        required
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPatientPassword" className="text-gray-300">
                        Password
                      </Label>
                      <Input
                        id="editPatientPassword"
                        type="password"
                        value={editPatientPassword}
                        onChange={(e) => setEditPatientPassword(e.target.value)}
                        required
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editPatientAge" className="text-gray-300">
                          Age
                        </Label>
                        <Input
                          id="editPatientAge"
                          type="number"
                          value={editPatientAge}
                          onChange={(e) => setEditPatientAge(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editPatientSex" className="text-gray-300">
                          Sex
                        </Label>
                        <Select value={editPatientSex} onValueChange={setEditPatientSex}>
                          <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPatientBloodGroup" className="text-gray-300">
                        Blood Group
                      </Label>
                      <Select value={editPatientBloodGroup} onValueChange={setEditPatientBloodGroup}>
                        <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {bloodGroups.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPatientRemarks" className="text-gray-300">
                        Remarks (Optional)
                      </Label>
                      <Textarea
                        id="editPatientRemarks"
                        value={editPatientRemarks}
                        onChange={(e) => setEditPatientRemarks(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white min-h-[80px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setEditPatientDialogOpen(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpdatePatient} className="bg-blue-600 hover:bg-blue-700">
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="records">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-800/50 border-gray-700 col-span-1">
                  <CardHeader>
                    <CardTitle className="text-blue-400 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Add Medical Record
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Upload a new medical record for a patient
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddRecord} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="recordPatientId" className="text-gray-300">
                          Patient ID
                        </Label>
                        <Input
                          id="recordPatientId"
                          value={recordPatientId}
                          onChange={(e) => setRecordPatientId(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recordDescription" className="text-gray-300">
                          Description
                        </Label>
                        <Input
                          id="recordDescription"
                          value={recordDescription}
                          onChange={(e) => setRecordDescription(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recordFile" className="text-gray-300">
                          File
                        </Label>
                        <Input
                          id="recordFile"
                          type="file"
                          onChange={(e) => setRecordFile(e.target.files?.[0] || null)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Upload Record
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700 col-span-1 lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-blue-400 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Medical Records
                      </CardTitle>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search records..."
                          value={recordSearch}
                          onChange={(e) => setRecordSearch(e.target.value)}
                          className="pl-10 bg-gray-700/50 border-gray-600 text-white w-[250px]"
                        />
                      </div>
                    </div>
                    <CardDescription className="text-gray-400">All patient medical records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredRecords.length === 0 ? (
                      <p className="text-center text-gray-500">No medical records yet</p>
                    ) : (
                      <div className="rounded-md border border-gray-700 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gray-700/50">
                            <TableRow className="hover:bg-gray-700/70 border-gray-700">
                              <TableHead className="text-gray-300">Patient ID</TableHead>
                              <TableHead className="text-gray-300">Description</TableHead>
                              <TableHead className="text-gray-300 hidden md:table-cell">Created By</TableHead>
                              <TableHead className="text-gray-300 hidden lg:table-cell">Date</TableHead>
                              <TableHead className="text-gray-300 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredRecords.map((record) => (
                              <TableRow key={record.id} className="hover:bg-gray-700/70 border-gray-700">
                                <TableCell className="font-medium text-gray-300">{record.patientId}</TableCell>
                                <TableCell className="text-gray-300">{record.description}</TableCell>
                                <TableCell className="text-gray-300 hidden md:table-cell">{record.createdBy}</TableCell>
                                <TableCell className="text-gray-300 hidden lg:table-cell">
                                  {formatDate(record.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 border-gray-600 text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                                      onClick={() => {
                                        // Create a blob from the base64 data
                                        const byteString = atob(record.fileData.split(",")[1])
                                        const mimeType = record.fileData.split(",")[0].split(":")[1].split(";")[0]
                                        const ab = new ArrayBuffer(byteString.length)
                                        const ia = new Uint8Array(ab)

                                        for (let i = 0; i < byteString.length; i++) {
                                          ia[i] = byteString.charCodeAt(i)
                                        }

                                        const blob = new Blob([ab], { type: mimeType })
                                        const url = URL.createObjectURL(blob)

                                        // Create a link and trigger download
                                        const a = document.createElement("a")
                                        a.href = url
                                        a.download = record.fileName
                                        document.body.appendChild(a)
                                        a.click()
                                        document.body.removeChild(a)
                                        URL.revokeObjectURL(url)
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                      <span className="sr-only">Download</span>
                                    </Button>
                                    {record.createdBy === currentUser?.id && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 border-gray-600 text-red-400 hover:text-red-300 hover:bg-gray-700"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-gray-800 border-gray-700">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-400">
                                              This will permanently delete this medical record and cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              className="bg-red-600 text-white hover:bg-red-700"
                                              onClick={() => handleDeleteRecord(record.id)}
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}

