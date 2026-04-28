"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, Home, BarChart3, Settings, Columns3 } from "lucide-react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { deptApi, boardApi } from "@/lib/api"

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

interface BoardEntry {
  boardId: string
  boardName: string
  deptSlug: string
  deptName: string
  deptIcon?: string
}

const pages = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Company Board", href: "/company-board", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [departments, setDepartments] = useState<Dept[]>([])
  const [boards, setBoards] = useState<BoardEntry[]>([])

  useEffect(() => {
    if (!open) return
    deptApi
      .list()
      .then(async (res) => {
        const depts: Dept[] = res.departments ?? []
        setDepartments(depts)

        // Fetch boards for each department
        const boardResults = await Promise.allSettled(
          depts.map(async (dept) => {
            const { boards: deptBoards } = await boardApi.list(dept._id)
            return (deptBoards || []).map((b: any) => ({
              boardId: b._id,
              boardName: b.name,
              deptSlug: dept.slug,
              deptName: dept.name,
              deptIcon: dept.icon,
            }))
          })
        )

        const allBoards: BoardEntry[] = boardResults
          .filter((r) => r.status === "fulfilled")
          .flatMap((r) => (r as PromiseFulfilledResult<BoardEntry[]>).value)
        setBoards(allBoards)
      })
      .catch(() => {})
  }, [open])

  const handleSelect = (href: string) => {
    onClose()
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <CommandInput placeholder="Search departments, boards, pages..." />
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
        {boards.length > 0 && (
          <CommandGroup heading="Boards">
            {boards.map((board) => (
              <CommandItem
                key={board.boardId}
                onSelect={() => handleSelect(`/dept/${board.deptSlug}?boardId=${board.boardId}`)}
                className="cursor-pointer"
              >
                <Columns3 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                <span>{board.boardName} <span className="text-[#52525b]">({board.deptIcon ? `${board.deptIcon} ` : ""}{board.deptName})</span></span>
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
