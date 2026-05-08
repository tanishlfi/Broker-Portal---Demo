"use client";

import { useState } from "react";
import { Eye, RotateCcw, Search } from "lucide-react";
import InvoiceDetailsModal from "./InvoiceDetailsModal";

interface FailedInvoice {
  id: string;
  invoiceNumber: string;
  policyNumber: string;
  companyName: string;
  premium: string;
  dueDate: string;
  paymentMethod: string;
  failureReason: string;
  attempts: number;
}

const staticInvoices: FailedInvoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2026-0245",
    policyNumber: "POL-2026-001",
    companyName: "Medical Care Group",
    premium: "R 16,750",
    dueDate: "2026-04-01",
    paymentMethod: "Debit Order",
    failureReason: "Insufficient funds",
    attempts: 2,
  },
  {
    id: "2",
    invoiceNumber: "INV-2026-0198",
    policyNumber: "POL-2025-067",
    companyName: "Retail Excellence Ltd",
    premium: "R 44,500",
    dueDate: "2026-03-28",
    paymentMethod: "EFT",
    failureReason: "Technical Issue",
    attempts: 3,
  },
  {
    id: "3",
    invoiceNumber: "INV-2026-0187",
    policyNumber: "POL-2026-045",
    companyName: "Tech Solutions Inc",
    premium: "R 22,300",
    dueDate: "2026-04-05",
    paymentMethod: "Credit Card",
    failureReason: "Card Declined",
    attempts: 1,
  },
];

export default function FailedInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<FailedInvoice | null>(null);
  const itemsPerPage = 10;

  const filteredInvoices = staticInvoices.filter(
    (invoice) =>
      invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  return (
    <main
      className="flex-1 overflow-y-auto p-5 min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-medium mb-6" style={{ color: "#f4f4f5" }}>
          Failed Invoices
        </h2>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6">
          {/* Search Input */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1"
            style={{
              background: "#262626",
              border: "1.875px solid #333333",
            }}
          >
            <Search size={20} style={{ color: "#A0A0A0" }} />
            <input
              type="text"
              placeholder="Search by company name or policy no..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "#FFFFFF" }}
            />
          </div>

          {/* Status Filter */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "#262626",
              border: "1.875px solid #333333",
              minWidth: "220px",
            }}
          >
            <span style={{ color: "#A0A0A0", fontSize: "14px" }}>Status</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: "#A0A0A0", marginLeft: "auto" }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "#2D2D2D",
          border: "0.625px solid #4A4A4A",
        }}
      >
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Table Header */}
            <thead>
              <tr
                style={{
                  background: "rgba(58, 58, 58, 0.5)",
                  borderBottom: "0.625px solid #4A4A4A",
                }}
              >
                <th
                  className="px-2 py-2.5 text-left font-medium"
                  style={{ color: "#FFFFFF", width: "142px" }}
                >
                  Invoice Number
                </th>
                <th
                  className="px-2 py-2.5 text-left font-medium"
                  style={{ color: "#FFFFFF", width: "133px" }}
                >
                  Policy Number
                </th>
                <th
                  className="px-2 py-2.5 text-left font-medium"
                  style={{ color: "#FFFFFF", width: "169px" }}
                >
                  Company Name
                </th>
                <th
                  className="px-2 py-2.5 text-left font-medium"
                  style={{ color: "#FFFFFF", width: "86px" }}
                >
                  Premium
                </th>
                <th
                  className="px-2 py-2.5 text-left font-medium"
                  style={{ color: "#FFFFFF", width: "111px" }}
                >
                  Due Date
                </th>
                <th
                  className="px-2 py-2.5 text-left font-medium"
                  style={{ color: "#FFFFFF", width: "113px" }}
                >
                  Payment Method
                </th>
                <th
                  className="px-2 py-2.5 text-left font-medium"
                  style={{ color: "#FFFFFF", width: "119px" }}
                >
                  Failure Reason
                </th>
                <th
                  className="px-2 py-2.5 text-left font-medium"
                  style={{ color: "#FFFFFF", width: "98px" }}
                >
                  Attempts
                </th>
                <th
                  className="px-2 py-2.5 text-left font-medium"
                  style={{ color: "#FFFFFF", width: "192px" }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  style={{
                    borderBottom: "0.625px solid #4A4A4A",
                  }}
                >
                  <td
                    className="px-2 py-3"
                    style={{ color: "#FFFFFF", fontFamily: "Menlo" }}
                  >
                    {invoice.invoiceNumber}
                  </td>
                  <td
                    className="px-2 py-3"
                    style={{ color: "#FFFFFF", fontFamily: "Menlo" }}
                  >
                    {invoice.policyNumber}
                  </td>
                  <td className="px-2 py-3" style={{ color: "#FFFFFF" }}>
                    {invoice.companyName}
                  </td>
                  <td className="px-2 py-3" style={{ color: "#FFFFFF" }}>
                    {invoice.premium}
                  </td>
                  <td className="px-2 py-3" style={{ color: "#FFFFFF" }}>
                    {invoice.dueDate}
                  </td>
                  <td className="px-2 py-3" style={{ color: "#FFFFFF" }}>
                    {invoice.paymentMethod}
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: "#EF4444",
                        color: "#FFFFFF",
                      }}
                    >
                      {invoice.failureReason}
                    </span>
                  </td>
                  <td className="px-2 py-3" style={{ color: "#FFFFFF" }}>
                    {invoice.attempts} attempts
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors"
                        style={{
                          background: "transparent",
                          border: "1px solid #FFFFFF",
                          color: "#FFFFFF",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors"
                        style={{
                          background: "transparent",
                          border: "1px solid #FFFFFF",
                          color: "#FFFFFF",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <RotateCcw size={14} />
                        <span>Retry</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer - Pagination */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: "rgba(58, 58, 58, 0.3)",
            borderTop: "0.625px solid #4A4A4A",
          }}
        >
          <span style={{ color: "#A0A0A0", fontSize: "14px" }}>
            Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredInvoices.length)} of{" "}
            {filteredInvoices.length} entries
          </span>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors"
              style={{
                background: "transparent",
                border: "1px solid #FFFFFF",
                color: "#FFFFFF",
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Previous</span>
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="px-3 py-2 rounded text-sm font-medium transition-colors"
                style={{
                  background: currentPage === page ? "#1FC3EB" : "transparent",
                  border: currentPage === page ? "none" : "1px solid #FFFFFF",
                  color: "#FFFFFF",
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors"
              style={{
                background: "transparent",
                border: "1px solid #FFFFFF",
                color: "#FFFFFF",
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              <span>Next</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <InvoiceDetailsModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />
      )}
    </main>
  );
}
