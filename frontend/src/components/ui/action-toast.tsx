"use client"
import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { CheckCircle2, AlertCircle, X } from "lucide-react"

interface Toast { id: string; message: string; type: "success" | "error" }

const ToastContext = createContext<{ show: (message: string, type?: "success" | "error") => void }>({ show: () => {} })

export function useToast() { return useContext(ToastContext) }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now().toString()
    setToasts(prev => [...prev.slice(-2), { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-3 py-2 rounded-md text-[12px] border animate-fade-in ${
            t.type === "success" ? "bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]" : "bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]"
          }`}>
            {t.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-1 text-current opacity-50 hover:opacity-100">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
