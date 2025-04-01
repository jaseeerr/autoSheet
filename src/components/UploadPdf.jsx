import React, { useState } from 'react';
import { getDocument } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?worker';
import Invoice from './Invoice';

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

const UploadPdf = () => {
  const [invoiceData, setInvoiceData] = useState(null);

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += pageText + '\n';
    }

    const parsedData = extractInvoiceData(text);
    setInvoiceData(parsedData);

    // Log to console as JSON
    console.log('Extracted Invoice Data:', JSON.stringify(parsedData, null, 2));
  };

  const extractInvoiceData = (text) => {
    const match = (regex) => (text.match(regex)?.[1] || '').trim();
  
    const invoiceNumber = match(/Invoice# (\S+)/);
    const invoiceDate = match(/Invoice Date\s*:\s*([0-9]{2} [A-Za-z]{3} 20[0-9]{2})/);
    const terms = match(/Terms\s*:\s*(Net \d+)/);
    const dueDate = match(/Due Date\s*:\s*([0-9]{2} [A-Za-z]{3} 20[0-9]{2})/);
  
    const itemRegex = /(\d+)\s+([A-Z\s()]+)\s+KG\s+(\d+\.\d{2})\s+kg\s+(\d+\.\d{2})\s+(\d+\.\d{2})\s+(\d+\.\d{2})/g;
    let items = [];
    let matchItem;
    while ((matchItem = itemRegex.exec(text)) !== null) {
      items.push({
        no: parseInt(matchItem[1]),
        description: matchItem[2].trim(),
        qty: parseFloat(matchItem[3]),
        unit: 'kg',
        rate: parseFloat(matchItem[4]),
        taxPercent: parseFloat(matchItem[5]),
        taxAmount: parseFloat(matchItem[6])
      });
    }
  
    return {
      invoiceNumber,
      invoiceDate,
      dueDate,
      terms,
      company: {
        name: match(/^([A-Z\s]+) ARAB BANK/),
        address: match(/ARAB BANK BLDG,\s*([^U]+U\.A\.E)/),
      },
      billTo: {
        name: match(/Bill To\s*:\s*(.+?)\s*BARARI/),
        location: (() => {
            const fullMatch = text.match(/Bill To\s*:\s*.*?\s*(.*?)\s*PO BOX/i);
            return fullMatch ? fullMatch[1].replace(/\s+/g, ' ').trim() : '';
          })(),
                  poBox: match(/PO BOX:\s*(\d+)/),
        trn: match(/TRN\s*(\d+)/),
      },
      items,
      totals: {
        subTotal: parseFloat(match(/Sub Total\s*([\d.]+)/)),
        tax: parseFloat(match(/Standard Rate \(5%\)\s*([\d.]+)/)),
        total: parseFloat(match(/Total AED([\d.]+)/)),
        balanceDue: parseFloat(match(/Balance Due AED([\d.]+)/)),
      }
    };
  };
  

  return (
    <div className="w-full mx-auto p-8 bg-white shadow-lg rounded-md border border-gray-200 my-8">
    <div className="border-b-2 border-black pb-4 mb-6">
      <h1 className="text-3xl font-bold text-black tracking-tight">Invoice PDF Uploader</h1>
      <p className="text-gray-600 mt-2">Upload your invoice PDF to view and process it</p>
    </div>

    <div className="mb-8">
      <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-gray-400 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-lg font-medium text-gray-700 mb-1">Drag and drop your PDF here</p>
        <p className="text-sm text-gray-500 mb-4">or click to browse files</p>

        <label className="relative inline-flex items-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-all shadow-sm cursor-pointer">
          <span className="mr-2">Select PDF File</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePDFUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>
      </div>
    </div>

    {invoiceData &&  <Invoice data={invoiceData} />}
  </div>
  );
};

export default UploadPdf;
