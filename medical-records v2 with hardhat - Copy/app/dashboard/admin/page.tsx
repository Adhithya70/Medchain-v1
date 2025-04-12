"use client"

import type React from "react"
import {
  logRecordAdded,
  logRecordDeleted,
  logRecordApproved,
  logRequestApproved,
  logRequestRejected,
} from "@/lib/blockchainlogger"

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
import { Search, Trash2, Edit, Download, FileText, User, UserPlus, Briefcase } from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import {
  initializeStorage,
  generateRecordHash,
  bloodGroups,
  filterUsers,
  filterRecords,
  formatDate,
  generateId,
} from "@/lib/utils"

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [downloadRequests, setDownloadRequests] = useState<any[]>([])
  const [downloadHistory, setDownloadHistory] = useState<any[]>([])

  // Search and filter state
  const [doctorSearch, setDoctorSearch] = useState("")
  const [patientSearch, setPatientSearch] = useState("")
  const [recordSearch, setRecordSearch] = useState("")
  const [requestSearch, setRequestSearch] = useState("")

  // New doctor form state
  const [newDoctorId, setNewDoctorId] = useState("")
  const [newDoctorName, setNewDoctorName] = useState("")
  const [newDoctorPassword, setNewDoctorPassword] = useState("")
  const [newDoctorSpecialization, setNewDoctorSpecialization] = useState("")
  const [newDoctorUniversity, setNewDoctorUniversity] = useState("")
  const [newDoctorGraduationYear, setNewDoctorGraduationYear] = useState("")
  const [newDoctorExperience, setNewDoctorExperience] = useState("")
  const [newDoctorCollege, setNewDoctorCollege] = useState("")

  // Edit doctor state
  const [editDoctorId, setEditDoctorId] = useState("")
  const [editDoctorName, setEditDoctorName] = useState("")
  const [editDoctorPassword, setEditDoctorPassword] = useState("")
  const [editDoctorSpecialization, setEditDoctorSpecialization] = useState("")
  const [editDoctorUniversity, setEditDoctorUniversity] = useState("")
  const [editDoctorGraduationYear, setEditDoctorGraduationYear] = useState("")
  const [editDoctorExperience, setEditDoctorExperience] = useState("")
  const [editDoctorCollege, setEditDoctorCollege] = useState("")
  const [editDoctorDialogOpen, setEditDoctorDialogOpen] = useState(false)

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
  }, [])

  const loadData = () => {
    setDoctors(JSON.parse(localStorage.getItem("doctors") || "[]"))
    setPatients(JSON.parse(localStorage.getItem("patients") || "[]"))
    setRecords(JSON.parse(localStorage.getItem("records") || "[]"))
    setDownloadRequests(JSON.parse(localStorage.getItem("downloadRequests") || "[]"))
    setDownloadHistory(JSON.parse(localStorage.getItem("downloadHistory") || "[]"))
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if doctor ID already exists
    if (doctors.some((doctor) => doctor.id === newDoctorId)) {
      toast({
        title: "Error",
        description: "Doctor ID already exists",
        variant: "destructive",
      })
      return
    }

    const newDoctor = {
      id: newDoctorId,
      name: newDoctorName,
      password: newDoctorPassword,
      specialization: newDoctorSpecialization,
      university: newDoctorUniversity,
      graduationYear: newDoctorGraduationYear,
      experience: newDoctorExperience,
      college: newDoctorCollege,
      joiningDate: new Date().toISOString(),
    }

    const updatedDoctors = [...doctors, newDoctor]
    localStorage.setItem("doctors", JSON.stringify(updatedDoctors))
    setDoctors(updatedDoctors)

    // Reset form
    setNewDoctorId("")
    setNewDoctorName("")
    setNewDoctorPassword("")
    setNewDoctorSpecialization("")
    setNewDoctorUniversity("")
    setNewDoctorGraduationYear("")
    setNewDoctorExperience("")
    setNewDoctorCollege("")

    toast({
      title: "Success",
      description: "Doctor added successfully",
    })
  }

  const handleEditDoctor = (doctor: any) => {
    setEditDoctorId(doctor.id)
    setEditDoctorName(doctor.name)
    setEditDoctorPassword(doctor.password)
    setEditDoctorSpecialization(doctor.specialization || "")
    setEditDoctorUniversity(doctor.university || "")
    setEditDoctorGraduationYear(doctor.graduationYear || "")
    setEditDoctorExperience(doctor.experience || "")
    setEditDoctorCollege(doctor.college || "")
    setEditDoctorDialogOpen(true)
  }

  const handleUpdateDoctor = () => {
    const updatedDoctors = doctors.map((doctor) => {
      if (doctor.id === editDoctorId) {
        return {
          ...doctor,
          name: editDoctorName,
          password: editDoctorPassword,
          specialization: editDoctorSpecialization,
          university: editDoctorUniversity,
          graduationYear: editDoctorGraduationYear,
          experience: editDoctorExperience,
          college: editDoctorCollege,
        }
      }
      return doctor
    })

    localStorage.setItem("doctors", JSON.stringify(updatedDoctors))
    setDoctors(updatedDoctors)
    setEditDoctorDialogOpen(false)

    toast({
      title: "Success",
      description: "Doctor updated successfully",
    })
  }

  const handleDeleteDoctor = (doctorId: string) => {
    // Check if doctor has any records
    const doctorRecords = records.filter((record) => record.createdBy === doctorId)
    if (doctorRecords.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "This doctor has associated medical records. Delete those first.",
        variant: "destructive",
      })
      return
    }

    const updatedDoctors = doctors.filter((doctor) => doctor.id !== doctorId)
    localStorage.setItem("doctors", JSON.stringify(updatedDoctors))
    setDoctors(updatedDoctors)

    toast({
      title: "Success",
      description: "Doctor deleted successfully",
    })
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

    // Also delete any download requests for this patient
    const updatedRequests = downloadRequests.filter((req) => req.patientId !== patientId)
    localStorage.setItem("downloadRequests", JSON.stringify(updatedRequests))
    setDownloadRequests(updatedRequests)

    toast({
      title: "Success",
      description: "Patient deleted successfully",
    })
  }

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
  
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
        createdBy: "admin",
        createdAt: new Date().toISOString(),
      };
  
      const hash = await generateRecordHash(recordData);
      const newRecord = { ...recordData, hash };
  
      const updatedRecords = [...records, newRecord];
      localStorage.setItem("records", JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
  
      // 🔗 Blockchain log
      try {
        await logRecordAdded(recordData.id, hash, recordPatientId, "admin");
      } catch (err) {
        console.error("Blockchain log failed (add):", err);
      }
  
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
    const recordToDelete = records.find((record) => record.id === recordId);
    if (!recordToDelete) return;
  
    const updatedRecords = records.filter((record) => record.id !== recordId);
    localStorage.setItem("records", JSON.stringify(updatedRecords));
    setRecords(updatedRecords);
  
    const updatedRequests = downloadRequests.filter((req) => req.recordHash !== recordToDelete.hash);
    localStorage.setItem("downloadRequests", JSON.stringify(updatedRequests));
    setDownloadRequests(updatedRequests);
  
    // 🔗 Blockchain log
    try {
      await logRecordDeleted(recordId);
    } catch (err) {
      console.error("Blockchain log failed (delete):", err);
    }
  
    toast({
      title: "Success",
      description: "Record deleted and logged to blockchain",
    });
  };
  
  const handleApproveRequest = async (requestId: string) => {
    const request = downloadRequests.find((req) => req.id === requestId);
    if (!request) return;
  
    const downloadHistory = JSON.parse(localStorage.getItem("downloadHistory") || "[]");
    const previousDownloads = downloadHistory.filter(
      (hist: any) => hist.recordHash === request.recordHash && hist.patientId === request.patientId,
    );
  
    if (previousDownloads.length > 0) {
      const updatedHistory = downloadHistory.filter(
        (hist: any) => !(hist.recordHash === request.recordHash && hist.patientId === request.patientId),
      );
      localStorage.setItem("downloadHistory", JSON.stringify(updatedHistory));
    }
  
    const updatedRequests = downloadRequests.map((req) =>
      req.id === requestId ? { ...req, status: "approved", approvedAt: new Date().toISOString() } : req,
    );
    localStorage.setItem("downloadRequests", JSON.stringify(updatedRequests));
    setDownloadRequests(updatedRequests);
  
    // 🔗 Blockchain log
    try {
      await logRequestApproved(requestId);
      await logRecordApproved(request.recordId, request.recordHash);
    } catch (err) {
      console.error("Blockchain log failed (approve):", err);
    }
  
    toast({
      title: "Success",
      description: "Download request approved and logged to blockchain",
    });
  };
  
  const handleRejectRequest = async (requestId: string) => {
    const updatedRequests = downloadRequests.map((req) =>
      req.id === requestId ? { ...req, status: "rejected", rejectedAt: new Date().toISOString() } : req,
    );
    localStorage.setItem("downloadRequests", JSON.stringify(updatedRequests));
    setDownloadRequests(updatedRequests);
  
    // 🔗 Blockchain log
    try {
      await logRequestRejected(requestId);
    } catch (err) {
      console.error("Blockchain log failed (reject):", err);
    }
  
    toast({
      title: "Success",
      description: "Download request rejected and logged to blockchain",
    });
  };
  // Filter data based on search terms
  const filteredDoctors = filterUsers(doctors, doctorSearch)
  const filteredPatients = filterUsers(patients, patientSearch)
  const filteredRecords = filterRecords(records, recordSearch)
  const filteredRequests = filterRecords(downloadRequests, requestSearch)

  return (
    <AuthGuard role="admin">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center mb-6 bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-full">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">Manage your medical records system</p>
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

          <Tabs defaultValue="doctors" className="space-y-4">
            <TabsList className="bg-gray-800/50 border border-gray-700 p-1">
              <TabsTrigger
                value="doctors"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Doctors
              </TabsTrigger>
              <TabsTrigger
                value="patients"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Patients
              </TabsTrigger>
              <TabsTrigger
                value="records"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Medical Records
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                Download Requests
              </TabsTrigger>
            </TabsList>

            <TabsContent value="doctors">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-800/50 border-gray-700 col-span-1">
                  <CardHeader>
                    <CardTitle className="text-emerald-400 flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Add New Doctor
                    </CardTitle>
                    <CardDescription className="text-gray-400">Create a new doctor account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddDoctor} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="doctorId" className="text-gray-300">
                          Doctor ID
                        </Label>
                        <Input
                          id="doctorId"
                          value={newDoctorId}
                          onChange={(e) => setNewDoctorId(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doctorName" className="text-gray-300">
                          Name
                        </Label>
                        <Input
                          id="doctorName"
                          value={newDoctorName}
                          onChange={(e) => setNewDoctorName(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doctorPassword" className="text-gray-300">
                          Password
                        </Label>
                        <Input
                          id="doctorPassword"
                          type="password"
                          value={newDoctorPassword}
                          onChange={(e) => setNewDoctorPassword(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doctorSpecialization" className="text-gray-300">
                          Specialization
                        </Label>
                        <Input
                          id="doctorSpecialization"
                          value={newDoctorSpecialization}
                          onChange={(e) => setNewDoctorSpecialization(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="doctorUniversity" className="text-gray-300">
                            University
                          </Label>
                          <Input
                            id="doctorUniversity"
                            value={newDoctorUniversity}
                            onChange={(e) => setNewDoctorUniversity(e.target.value)}
                            required
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doctorGraduationYear" className="text-gray-300">
                            Graduation Year
                          </Label>
                          <Input
                            id="doctorGraduationYear"
                            value={newDoctorGraduationYear}
                            onChange={(e) => setNewDoctorGraduationYear(e.target.value)}
                            required
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="doctorExperience" className="text-gray-300">
                            Experience (years)
                          </Label>
                          <Input
                            id="doctorExperience"
                            value={newDoctorExperience}
                            onChange={(e) => setNewDoctorExperience(e.target.value)}
                            required
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doctorCollege" className="text-gray-300">
                            Medical College
                          </Label>
                          <Input
                            id="doctorCollege"
                            value={newDoctorCollege}
                            onChange={(e) => setNewDoctorCollege(e.target.value)}
                            required
                            className="bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Add Doctor
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700 col-span-1 lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-emerald-400 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Doctors List
                      </CardTitle>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search doctors..."
                          value={doctorSearch}
                          onChange={(e) => setDoctorSearch(e.target.value)}
                          className="pl-10 bg-gray-700/50 border-gray-600 text-white w-[250px]"
                        />
                      </div>
                    </div>
                    <CardDescription className="text-gray-400">All registered doctors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredDoctors.length === 0 ? (
                      <p className="text-center text-gray-500">No doctors registered yet</p>
                    ) : (
                      <div className="rounded-md border border-gray-700 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-gray-700/50">
                            <TableRow className="hover:bg-gray-700/70 border-gray-700">
                              <TableHead className="text-gray-300">ID</TableHead>
                              <TableHead className="text-gray-300">Name</TableHead>
                              <TableHead className="text-gray-300 hidden md:table-cell">Specialization</TableHead>
                              <TableHead className="text-gray-300 hidden lg:table-cell">Experience</TableHead>
                              <TableHead className="text-gray-300 hidden lg:table-cell">Joining Date</TableHead>
                              <TableHead className="text-gray-300 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDoctors.map((doctor) => (
                              <TableRow key={doctor.id} className="hover:bg-gray-700/70 border-gray-700">
                                <TableCell className="font-medium text-gray-300">{doctor.id}</TableCell>
                                <TableCell className="text-gray-300">{doctor.name}</TableCell>
                                <TableCell className="text-gray-300 hidden md:table-cell">
                                  {doctor.specialization || "N/A"}
                                </TableCell>
                                <TableCell className="text-gray-300 hidden lg:table-cell">
                                  {doctor.experience || "N/A"} years
                                </TableCell>
                                <TableCell className="text-gray-300 hidden lg:table-cell">
                                  {doctor.joiningDate ? formatDate(doctor.joiningDate) : "N/A"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 border-gray-600 text-emerald-400 hover:text-emerald-300 hover:bg-gray-700"
                                      onClick={() => handleEditDoctor(doctor)}
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
                                            This will permanently delete Dr. {doctor.name}'s account and cannot be
                                            undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 text-white hover:bg-red-700"
                                            onClick={() => handleDeleteDoctor(doctor.id)}
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

              {/* Edit Doctor Dialog */}
              <Dialog open={editDoctorDialogOpen} onOpenChange={setEditDoctorDialogOpen}>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-emerald-400">Edit Doctor</DialogTitle>
                    <DialogDescription className="text-gray-400">Update doctor information</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="editDoctorName" className="text-gray-300">
                        Name
                      </Label>
                      <Input
                        id="editDoctorName"
                        value={editDoctorName}
                        onChange={(e) => setEditDoctorName(e.target.value)}
                        required
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editDoctorPassword" className="text-gray-300">
                        Password
                      </Label>
                      <Input
                        id="editDoctorPassword"
                        type="password"
                        value={editDoctorPassword}
                        onChange={(e) => setEditDoctorPassword(e.target.value)}
                        required
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editDoctorSpecialization" className="text-gray-300">
                        Specialization
                      </Label>
                      <Input
                        id="editDoctorSpecialization"
                        value={editDoctorSpecialization}
                        onChange={(e) => setEditDoctorSpecialization(e.target.value)}
                        required
                        className="bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editDoctorUniversity" className="text-gray-300">
                          University
                        </Label>
                        <Input
                          id="editDoctorUniversity"
                          value={editDoctorUniversity}
                          onChange={(e) => setEditDoctorUniversity(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editDoctorGraduationYear" className="text-gray-300">
                          Graduation Year
                        </Label>
                        <Input
                          id="editDoctorGraduationYear"
                          value={editDoctorGraduationYear}
                          onChange={(e) => setEditDoctorGraduationYear(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editDoctorExperience" className="text-gray-300">
                          Experience (years)
                        </Label>
                        <Input
                          id="editDoctorExperience"
                          value={editDoctorExperience}
                          onChange={(e) => setEditDoctorExperience(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editDoctorCollege" className="text-gray-300">
                          Medical College
                        </Label>
                        <Input
                          id="editDoctorCollege"
                          value={editDoctorCollege}
                          onChange={(e) => setEditDoctorCollege(e.target.value)}
                          required
                          className="bg-gray-700/50 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setEditDoctorDialogOpen(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateDoctor} className="bg-emerald-600 hover:bg-emerald-700">
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="patients">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-800/50 border-gray-700 col-span-1">
                  <CardHeader>
                    <CardTitle className="text-emerald-400 flex items-center gap-2">
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
                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Add Patient
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700 col-span-1 lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-emerald-400 flex items-center gap-2">
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
                                      className="h-8 w-8 p-0 border-gray-600 text-emerald-400 hover:text-emerald-300 hover:bg-gray-700"
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
                    <DialogTitle className="text-emerald-400">Edit Patient</DialogTitle>
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
                    <Button onClick={handleUpdatePatient} className="bg-emerald-600 hover:bg-emerald-700">
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
                    <CardTitle className="text-emerald-400 flex items-center gap-2">
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
                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Upload Record
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700 col-span-1 lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-emerald-400 flex items-center gap-2">
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
                                      className="h-8 w-8 p-0 border-gray-600 text-emerald-400 hover:text-emerald-300 hover:bg-gray-700"
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

            <TabsContent value="requests">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-emerald-400 flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Download Requests
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search requests..."
                        value={requestSearch}
                        onChange={(e) => setRequestSearch(e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white w-[250px]"
                      />
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">
                    Patient requests to download medical records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredRequests.length === 0 ? (
                    <p className="text-center text-gray-500">No download requests yet</p>
                  ) : (
                    <div className="rounded-md border border-gray-700 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-700/50">
                          <TableRow className="hover:bg-gray-700/70 border-gray-700">
                            <TableHead className="text-gray-300">Patient ID</TableHead>
                            <TableHead className="text-gray-300">Record Description</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300 hidden md:table-cell">Requested Date</TableHead>
                            <TableHead className="text-gray-300 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.map((request) => (
                            <TableRow key={request.id} className="hover:bg-gray-700/70 border-gray-700">
                              <TableCell className="font-medium text-gray-300">{request.patientId}</TableCell>
                              <TableCell className="text-gray-300">{request.recordDescription}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    request.status === "approved"
                                      ? "bg-green-600 hover:bg-green-700"
                                      : request.status === "rejected"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-yellow-600 hover:bg-yellow-700"
                                  }
                                >
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-300 hidden md:table-cell">
                                {formatDate(request.requestedAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                {request.status === "pending" && (
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => handleApproveRequest(request.id)}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                      onClick={() => handleRejectRequest(request.id)}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}

