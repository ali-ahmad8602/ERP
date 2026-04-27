"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, Home, BarChart3, Settings } from "lucide-react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { deptApi } from "@/lib/api"

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

interface Dept {
  _id: string
  name: string
  slug: string
  icon?: string
}

const pages = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [departments, setDepartments] = useState<Dept[]>([])

  useEffect(() => {
    if (!open) return
    deptApi
      .list()
      .then((res) => setDepartments(res.departments ?? []))
      .catch(() => {})
  }, [open])

  const handleSelect = (href: string) => {
    onClose()
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <CommandInput placeholder="Search departments, pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {departments.length > 0 && (
          <CommandGroup heading="Departments">
            {departments.map((dept) => (
              <CommandItem
                key={dept._id}
                onSelect={() => handleSelect(`/dept/${dept.slug}`)}
                className="cursor-pointer"
              >
                <LayoutGrid className="mr-2 h-4 w-4" strokeWidth={1.5} />
                <span>{dept.icon ? `${dept.icon} ` : ""}{dept.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.href}
              onSelect={() => handleSelect(page.href)}
              className="cursor-pointer"
            >
              <page.icon className="mr-2 h-4 w-4" strokeWidth={1.5} />
              <span>{page.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
