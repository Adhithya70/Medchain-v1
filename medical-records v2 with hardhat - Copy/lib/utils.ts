import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// SHA-256 hash function
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

// Generate a unique hash for a medical record
export async function generateRecordHash(record: any): Promise<string> {
  const recordString = JSON.stringify(record)
  const timestamp = new Date().getTime().toString()
  return await sha256(recordString + timestamp)
}

// Check if user is authenticated
export function isAuthenticated(role: string): boolean {
  if (typeof window === "undefined") return false

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
  return currentUser.role === role
}

// Get current user
export function getCurrentUser() {
  if (typeof window === "undefined") return null

  return JSON.parse(localStorage.getItem("currentUser") || "null")
}

// Initialize local storage with default data if needed
export function initializeStorage() {
  if (typeof window === "undefined") return

  // Initialize doctors array if it doesn't exist
  if (!localStorage.getItem("doctors")) {
    localStorage.setItem("doctors", JSON.stringify([]))
  }

  // Initialize patients array if it doesn't exist
  if (!localStorage.getItem("patients")) {
    localStorage.setItem("patients", JSON.stringify([]))
  }

  // Initialize records array if it doesn't exist
  if (!localStorage.getItem("records")) {
    localStorage.setItem("records", JSON.stringify([]))
  }

  // Initialize download requests array if it doesn't exist
  if (!localStorage.getItem("downloadRequests")) {
    localStorage.setItem("downloadRequests", JSON.stringify([]))
  }

  // Initialize download history array if it doesn't exist
  if (!localStorage.getItem("downloadHistory")) {
    localStorage.setItem("downloadHistory", JSON.stringify([]))
  }
}

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Generate a unique ID
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Blood group options
export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

// Filter records by search term
export function filterRecords(records: any[], searchTerm: string): any[] {
  if (!searchTerm) return records

  const term = searchTerm.toLowerCase()
  return records.filter((record) => {
    return (
      (record.patientId && record.patientId.toLowerCase().includes(term)) ||
      (record.description && record.description.toLowerCase().includes(term)) ||
      (record.createdBy && record.createdBy.toLowerCase().includes(term)) ||
      (record.hash && record.hash.toLowerCase().includes(term))
    )
  })
}

// Filter users by search term
export function filterUsers(users: any[], searchTerm: string): any[] {
  if (!searchTerm) return users

  const term = searchTerm.toLowerCase()
  return users.filter((user) => {
    return (
      (user.id && user.id.toLowerCase().includes(term)) ||
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.specialization && user.specialization.toLowerCase().includes(term)) ||
      (user.university && user.university.toLowerCase().includes(term)) ||
      (user.bloodGroup && user.bloodGroup.toLowerCase().includes(term))
    )
  })
}

// Check if a record can be requested again
export function canRequestAgain(requests: any[], recordHash: string, patientId: string): boolean {
  // Check if there's already a pending request
  const hasPendingRequest = requests.some(
    (req) => req.recordHash === recordHash && req.patientId === patientId && req.status === "pending",
  )

  // If there's a pending request, can't request again
  if (hasPendingRequest) return false

  // Otherwise, can request again
  return true
}

