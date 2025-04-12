"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/utils"

export default function AuthGuard({
  role,
  children,
}: {
  role: string
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated(role)) {
      router.push(`/login/${role}`)
    }
  }, [role, router])

  return <>{children}</>
}

