"use client"

import { useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const Invoice = ({ data }) => {
  const invoiceRef = useRef()

  if (!data) return <div>No invoice data provided.</div>

  const {
    invoiceNumber = "",
    invoiceDate = "",
    dueDate = "",
    terms = "",
    company = {},
    billTo = {},
    items = [],
    totals = {},
  } = data

  const handleDownload = async () => {
    const element = invoiceRef.current
    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    // pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');

    pdf.save(`${invoiceNumber || "invoice"}.pdf`)
  }

  return (
    <div className="flex flex-col items-center w-full px-4 py-8 bg-gray-50">
      {/* PDF Download Button */}
      <button
        onClick={handleDownload}
        className="mb-6 px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download Invoice PDF
      </button>

      {/* Invoice Content */}
      <div
        ref={invoiceRef}
        className="w-full max-w-4xl bg-white shadow-xl rounded-md overflow-hidden border border-gray-200 flex flex-col text-sm"
        style={{ minHeight: "29.7cm", aspectRatio: "1 / 1.414" }} // A4 aspect ratio
      >
        {/* Top Border */}
        {/* <div className="h-1 bg-black"></div> */}

        {/* Header with company - Reduced padding */}
        <header className="px-6 pt-6 pb-3">
          <div className="flex flex-col md:flex-row justify-between items-center mb-3">
            <div className="text-center md:text-left mb-2 md:mb-0">
              <h1 className="text-2xl font-bold text-black uppercase tracking-wider">
                {"OLIVE ZONE GENERAL TRADING LLC"}
              </h1>
              <p className="text-gray-600 mt-0.5 text-xs">ARAB BANK BLDG, 184-0, Dubai, Dubai - 129417, U.A.E</p>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-md border-l-4 border-black">
              <p className="text-base font-bold text-black tracking-wider">TAX INVOICE</p>
            </div>
          </div>
        </header>

        {/* Invoice info and Bill To - Reduced padding and more compact layout */}
        <section className="px-6 py-3 bg-gray-50 border-t border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Invoice Details - More compact */}
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-black mb-2 pb-1 border-b border-black">Invoice Details</h2>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <span className="text-gray-600">Invoice #:</span>
                <span className="font-medium text-black text-right">{invoiceNumber}</span>
                <span className="text-gray-600">Invoice Date:</span>
                <span className="font-medium text-black text-right">{invoiceDate}</span>
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium text-black text-right">{dueDate}</span>
                <span className="text-gray-600">Terms:</span>
                <span className="font-medium text-black text-right">{terms}</span>
              </div>
            </div>

            {/* Bill To - More compact */}
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-black mb-2 pb-1 border-b border-black">Bill To</h2>
              <div className="space-y-1 text-xs">
                <p className="text-black font-medium">{billTo.location}</p>
                <div className="flex">
                  <span className="text-gray-600 w-16">PO BOX:</span>
                  <span className="text-black">{billTo.poBox}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-16">TRN:</span>
                  <span className="text-black">{billTo.trn}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Items - More space for items */}
        <section className="px-6 py-3 flex-grow">
          <h2 className="text-base font-semibold text-black mb-2 pb-1 border-b border-black">Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs rounded-md overflow-hidden">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-2 py-2 text-left">#</th>
                  <th className="px-2 py-2 text-left">Description</th>
                  <th className="px-2 py-2 text-right">Qty</th>
                  <th className="px-2 py-2 text-left">Unit</th>
                  <th className="px-2 py-2 text-right">Rate</th>
                  <th className="px-2 py-2 text-right">Tax %</th>
                  <th className="px-2 py-2 text-right">Tax Amt</th>
                  <th className="px-2 py-2 text-right">Amount</th>
                  <th className="px-2 py-2 text-right">
                    Amount <br />
                    <small className="text-xs text-gray-300">Incl. Tax</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const amount = item.qty * item.rate
                  const inclusive = amount + item.taxAmount

                  return (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border-b border-gray-200 px-2 py-1.5">{item.no}</td>
                      <td className="border-b border-gray-200 px-2 py-1.5 font-medium">{item.description}</td>
                      <td className="border-b border-gray-200 px-2 py-1.5 text-right">{item.qty}</td>
                      <td className="border-b border-gray-200 px-2 py-1.5">{item.unit}</td>
                      <td className="border-b border-gray-200 px-2 py-1.5 text-right">{item.rate.toFixed(2)}</td>
                      <td className="border-b border-gray-200 px-2 py-1.5 text-right">{item.taxPercent}%</td>
                      <td className="border-b border-gray-200 px-2 py-1.5 text-right">{item.taxAmount.toFixed(2)}</td>
                      <td className="border-b border-gray-200 px-2 py-1.5 text-right">{amount.toFixed(2)}</td>
                      <td className="border-b border-gray-200 px-2 py-1.5 text-right">{inclusive.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totals - More compact */}
        <section className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="w-full md:w-64 bg-white p-3 rounded-md shadow-sm border border-gray-200 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-black">AED {totals?.subTotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium text-black">AED {totals?.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-black mt-1">
                  <span className="text-black font-semibold">Total:</span>
                  <span className="font-bold text-black">AED {(totals?.subTotal + totals?.tax).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacer to push footer to bottom when few items */}
        <div className="flex-grow"></div>

        {/* Footer - More compact */}
        <footer className="px-6 py-3 text-center border-t border-gray-200 mt-auto text-xs">
          <div className="max-w-lg mx-auto">
            <p className="font-medium text-black mb-1">Thank you for your business</p>
            <p className="text-gray-600">If you have any questions about this invoice, please contact us.</p>
          </div>
        </footer>

        {/* Bottom Border */}
        {/* <div className="h-1 bg-black"></div> */}
      </div>
    </div>
  )
}

export default Invoice

