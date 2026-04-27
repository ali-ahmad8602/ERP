"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { useAuth } from "@/hooks/useAuth"
import { Mail, Clock } from "lucide-react"

const faqs = [
  {
    question: "How do I get started with InvoiceMate?",
    answer: "After signing up, you can explore the dashboard to view your organization overview. Start by creating departments, adding team members, and setting up your first workflow in the Kanban board.",
  },
  {
    question: "How do I create and send an invoice?",
    answer: "Navigate to the Invoices page and click 'Create Invoice'. Fill in the client details, line items, and payment terms. You can save as draft or send directly to the client via email.",
  },
  {
    question: "How do I manage departments and teams?",
    answer: "Go to the Dashboard overview to see all departments. Click on any department to view its members, tasks, and progress. You can add or remove members and assign roles from the department detail page.",
  },
  {
    question: "What are the different user roles and permissions?",
    answer: "InvoiceMate supports Admin, Manager, and Member roles. Admins have full access, Managers can manage their department's resources, and Members can view and update their assigned tasks.",
  },
  {
    question: "How can I export my data?",
    answer: "You can export reports, invoices, and transaction history from the Reports page. Supported formats include PDF, CSV, and Excel. Use the export button in the top-right corner of any report view.",
  },
  {
    question: "How do I contact support for urgent issues?",
    answer: "For urgent issues, email support@invoicemate.com with 'URGENT' in the subject line. Our support team monitors urgent requests and aims to respond within 2 hours during business hours.",
  },
]

export default function HelpPage() {
  useAuth({ required: true })

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="help" />
      <Topbar />
      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-[13px] font-medium text-[#fafafa]">Help & Support</h1>
          </div>

          {/* 2-Column Grid */}
          <section className="grid grid-cols-12 gap-5">
            {/* FAQ Section - 8 columns */}
            <div className="col-span-8">
              <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#ffffff14]">
                  <h2 className="text-[13px] font-medium text-[#fafafa]">Frequently Asked Questions</h2>
                </div>
                <div className="divide-y divide-[#ffffff08]">
                  {faqs.map((faq, i) => (
                    <div key={i} className="px-4 py-3.5">
                      <p className="text-[13px] font-medium text-[#fafafa] mb-1.5">{faq.question}</p>
                      <p className="text-[12px] text-[#71717a] leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Support Card - 4 columns */}
            <div className="col-span-4">
              <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#ffffff14]">
                  <h2 className="text-[13px] font-medium text-[#fafafa]">Contact Support</h2>
                </div>
                <div className="p-4">
                  <form className="space-y-4">
                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label htmlFor="subject" className="block text-[11px] font-medium text-[#a1a1aa]">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        placeholder="Brief description of your issue"
                        className="w-full h-8 px-3 bg-transparent border border-[#27272a] rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-colors"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label htmlFor="message" className="block text-[11px] font-medium text-[#a1a1aa]">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Describe your issue in detail..."
                        className="w-full px-3 py-2 bg-transparent border border-[#27272a] rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-colors resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="button"
                      className="w-full h-8 bg-[#3b82f6] hover:bg-[#2563eb] text-[13px] font-medium text-white rounded-md transition-colors"
                    >
                      Submit
                    </button>
                  </form>

                  {/* Contact Info */}
                  <div className="mt-5 pt-4 border-t border-[#ffffff08] space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#52525b]" strokeWidth={1.5} />
                      <span className="text-[12px] text-[#71717a]">support@invoicemate.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#52525b]" strokeWidth={1.5} />
                      <span className="text-[12px] text-[#71717a]">Response time: &lt; 24 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
