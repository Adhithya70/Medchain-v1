"use client"

import { use } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { LockKeyhole, User } from "lucide-react"

export default function LoginPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params) // ✅ unwrap the promise

  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      // For admin, check hardcoded credentials
      if (role === "admin") {
        if (userId === "admin" && password === "root123") {
          localStorage.setItem("currentUser", JSON.stringify({ role: "admin", id: "admin" }))
          router.push("/dashboard/admin")
          return
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid admin credentials",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      // For doctor and patient, check against stored users
      const users = JSON.parse(localStorage.getItem(`${role}s`) || "[]")
      const user = users.find((u: any) => u.id === userId && u.password === password)

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify({ role, id: userId, ...user }))
        router.push(`/dashboard/${role}`)
      } else {
        toast({
          title: "Login Failed",
          description: `Invalid ${role} credentials`,
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }, 1000)
  }

  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1)
  const roleColor = role === "admin" ? "emerald" : role === "doctor" ? "blue" : "purple"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-gray-700">
        <CardHeader>
          <CardTitle className={`text-2xl font-bold text-${roleColor}-400`}>{roleTitle} Login</CardTitle>
          <CardDescription className="text-gray-400">Enter your credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-gray-300">
                User ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                  placeholder={`Enter your ${role} ID`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <Button
              type="submit"
              className={`w-full bg-${roleColor}-600 hover:bg-${roleColor}-700 text-white`}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
