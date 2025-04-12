import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">MedChain</CardTitle>
          <CardDescription className="text-gray-300">
            Secure blockchain-based medical records management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/login/admin">Admin Login</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-emerald-500 text-emerald-400 hover:bg-emerald-900/20"
            >
              <Link href="/login/doctor">Doctor Login</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-emerald-500 text-emerald-400 hover:bg-emerald-900/20"
            >
              <Link href="/login/patient">Patient Login</Link>
            </Button>
          </div>
          <div className="text-center text-sm text-gray-400 mt-6">
            <p>Secure • Transparent • Immutable</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

