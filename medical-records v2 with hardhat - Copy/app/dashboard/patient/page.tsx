"use client"
import { logRequestSubmitted } from "@/lib/blockchainlogger"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { Download, FileText, User, Clock, AlertCircle } from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import { initializeStorage, getCurrentUser, formatDate } from "@/lib/utils"

export default function PatientDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [records, setRecords] = useState<any[]>([])
  const [downloadRequests, setDownloadRequests] = useState<any[]>([])
  const [downloadHistory, setDownloadHistory] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    initializeStorage()
    const user = getCurrentUser()
    setCurrentUser(user)

    if (user) {
      // Load only records for this patient
      const allRecords = JSON.parse(localStorage.getItem("records") || "[]")
      setRecords(allRecords.filter((record: any) => record.patientId === user.id))

      // Load download requests for this patient
      const allRequests = JSON.parse(localStorage.getItem("downloadRequests") || "[]")
      setDownloadRequests(allRequests.filter((req: any) => req.patientId === user.id))

      // Load download history for this patient
      const allHistory = JSON.parse(localStorage.getItem("downloadHistory") || "[]")
      setDownloadHistory(allHistory.filter((hist: any) => hist.patientId === user.id))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const handleRequestDownload = async (record: any) => {
    // Check if a request is already pending for this record
    const existingPendingRequest = downloadRequests.find(
      (req) => req.recordHash === record.hash && req.patientId === currentUser?.id && req.status === "pending"
    );
  
    if (existingPendingRequest) {
      toast({
        title: "Request Already Pending",
        description: "You already have a pending request for this record.",
        variant: "destructive",
      });
      return;
    }
  
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRequest = {
      id: requestId,
      patientId: currentUser?.id,
      recordId: record.id,
      recordHash: record.hash,
      recordDescription: record.description,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };
  
    // Save to localStorage
    const allRequests = JSON.parse(localStorage.getItem("downloadRequests") || "[]");
    const updatedRequests = [...allRequests, newRequest];
    localStorage.setItem("downloadRequests", JSON.stringify(updatedRequests));
    setDownloadRequests(updatedRequests);
  
    // 🔗 Optional: Log request to blockchain (if you want to record patient requests)
    try {
      await logRequestSubmitted(record.hash, currentUser?.id || "unknown", requestId);
    } catch (err) {
      console.error("Blockchain log failed (request download):", err);
    }
  
    toast({
      title: "Success",
      description: "Download request submitted",
    });
  };
  

  const handleDownload = (record: any) => {
    // Check if already downloaded
    const hasDownloaded = downloadHistory.some((hist) => hist.recordHash === record.hash)

    if (hasDownloaded) {
      toast({
        title: "Download Limit Reached",
        description: "You've already downloaded this record. Please request again.",
        variant: "destructive",
      })
      return
    }

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

    // Record the download in history
    const downloadId = `dl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newDownload = {
      id: downloadId,
      patientId: currentUser.id,
      recordId: record.id,
      recordHash: record.hash,
      recordDescription: record.description,
      downloadedAt: new Date().toISOString(),
    }

    const allHistory = JSON.parse(localStorage.getItem("downloadHistory") || "[]")
    const updatedHistory = [...allHistory, newDownload]
    localStorage.setItem("downloadHistory", JSON.stringify(updatedHistory))
    setDownloadHistory([...downloadHistory, newDownload])

    // Update the request status to "downloaded"
    const allRequests = JSON.parse(localStorage.getItem("downloadRequests") || "[]")
    const updatedRequests = allRequests.map((req: any) => {
      if (req.recordHash === record.hash && req.status === "approved") {
        return { ...req, status: "downloaded", downloadedAt: new Date().toISOString() }
      }
      return req
    })
    localStorage.setItem("downloadRequests", JSON.stringify(updatedRequests))
    setDownloadRequests(updatedRequests.filter((req: any) => req.patientId === currentUser.id))

    toast({
      title: "Success",
      description: "File downloaded successfully",
    })
  }

  // Check if a record has an approved download request
  const canDownload = (record: any) => {
    // Check if there's an approved request and no download history
    return (
      downloadRequests.some((req) => req.recordHash === record.hash && req.status === "approved") &&
      !downloadHistory.some((hist) => hist.recordHash === record.hash)
    )
  }

  // Check if a record has a pending download request
  const hasPendingRequest = (record: any) => {
    return downloadRequests.some((req) => req.recordHash === record.hash && req.status === "pending")
  }

  // Check if a record has been downloaded already
  const hasDownloaded = (record: any) => {
    return downloadHistory.some((hist) => hist.recordHash === record.hash)
  }

  return (
    <AuthGuard role="patient">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center mb-6 bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-full">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Patient Dashboard</h1>
                <p className="text-gray-400 text-sm">View and manage your medical records</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="bg-gray-800/50 border-gray-700 col-span-1">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
                <CardDescription className="text-gray-400">Your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentUser && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white font-medium">{currentUser.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Age:</span>
                      <span className="text-white font-medium">{currentUser.age || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sex:</span>
                      <span className="text-white font-medium">
                        {currentUser.sex ? currentUser.sex.charAt(0).toUpperCase() + currentUser.sex.slice(1) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blood Group:</span>
                      <span className="text-white font-medium">
                        {currentUser.bloodGroup ? (
                          <Badge variant="outline" className="bg-gray-700 text-white border-gray-600">
                            {currentUser.bloodGroup}
                          </Badge>
                        ) : (
                          "N/A"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Registration Date:</span>
                      <span className="text-white font-medium">
                        {currentUser.registrationDate ? formatDate(currentUser.registrationDate) : "N/A"}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Important Information
                </CardTitle>
                <CardDescription className="text-gray-400">Guidelines for using the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                  <h3 className="text-white font-medium mb-2">Download Policy</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    <li>You can only download each approved record once</li>
                    <li>For additional downloads, you must submit a new request</li>
                    <li>Download requests are reviewed by administrators</li>
                    <li>Approval may take up to 24 hours</li>
                  </ul>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                  <h3 className="text-white font-medium mb-2">Data Security</h3>
                  <p className="text-gray-300">
                    All your medical records are secured with blockchain technology and SHA-256 encryption. Each record
                    has a unique hash that ensures data integrity and prevents tampering.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800/50 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Medical Records
              </CardTitle>
              <CardDescription className="text-gray-400">
                View your medical records and request downloads
              </CardDescription>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500">No medical records found</p>
                </div>
              ) : (
                <div className="rounded-md border border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-700/50">
                      <TableRow className="hover:bg-gray-700/70 border-gray-700">
                        <TableHead className="text-gray-300">Description</TableHead>
                        <TableHead className="text-gray-300 hidden md:table-cell">Created By</TableHead>
                        <TableHead className="text-gray-300 hidden md:table-cell">Date</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record, index) => (
                        <TableRow key={index} className="hover:bg-gray-700/70 border-gray-700">
                          <TableCell className="font-medium text-gray-300">{record.description}</TableCell>
                          <TableCell className="text-gray-300 hidden md:table-cell">{record.createdBy}</TableCell>
                          <TableCell className="text-gray-300 hidden md:table-cell">
                            {formatDate(record.createdAt)}
                          </TableCell>
                          <TableCell>
                            {canDownload(record) ? (
                              <Badge className="bg-green-600 hover:bg-green-700">Ready to Download</Badge>
                            ) : hasPendingRequest(record) ? (
                              <Badge className="bg-yellow-600 hover:bg-yellow-700">Request Pending</Badge>
                            ) : hasDownloaded(record) ? (
                              <Badge className="bg-blue-600 hover:bg-blue-700">Downloaded</Badge>
                            ) : (
                              <Badge className="bg-gray-600 hover:bg-gray-700">No Request</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {canDownload(record) ? (
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => handleDownload(record)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            ) : hasPendingRequest(record) ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                disabled
                              >
                                Request Pending
                              </Button>
                            ) : hasDownloaded(record) ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                  >
                                    Request Again
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-gray-800 border-gray-700">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Request Download Again</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                      You've already downloaded this record. Do you want to request permission to
                                      download it again?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-purple-600 text-white hover:bg-purple-700"
                                      onClick={() => {
                                        handleRequestDownload(record)
                                      }}
                                    >
                                      Request Again
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
                                onClick={() => handleRequestDownload(record)}
                              >
                                Request Download
                              </Button>
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

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Download Requests
              </CardTitle>
              <CardDescription className="text-gray-400">Status of your download requests</CardDescription>
            </CardHeader>
            <CardContent>
              {downloadRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500">No download requests yet</p>
                </div>
              ) : (
                <div className="rounded-md border border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-700/50">
                      <TableRow className="hover:bg-gray-700/70 border-gray-700">
                        <TableHead className="text-gray-300">Record Description</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300 hidden md:table-cell">Requested Date</TableHead>
                        <TableHead className="text-gray-300 hidden lg:table-cell">Response Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {downloadRequests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-gray-700/70 border-gray-700">
                          <TableCell className="font-medium text-gray-300">{request.recordDescription}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                request.status === "approved"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : request.status === "rejected"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : request.status === "downloaded"
                                      ? "bg-blue-600 hover:bg-blue-700"
                                      : "bg-yellow-600 hover:bg-yellow-700"
                              }
                            >
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300 hidden md:table-cell">
                            {formatDate(request.requestedAt)}
                          </TableCell>
                          <TableCell className="text-gray-300 hidden lg:table-cell">
                            {request.status === "approved" && request.approvedAt
                              ? formatDate(request.approvedAt)
                              : request.status === "rejected" && request.rejectedAt
                                ? formatDate(request.rejectedAt)
                                : request.status === "downloaded" && request.downloadedAt
                                  ? formatDate(request.downloadedAt)
                                  : "N/A"}
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
      </div>
    </AuthGuard>
  )
}

