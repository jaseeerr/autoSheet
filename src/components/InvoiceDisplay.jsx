// InvoiceDisplay.jsx
import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceDisplay = ({ data }) => {
  const handleDownload = async () => {
    const input = document.getElementById('invoice');
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data.invoiceNumber}.pdf`);
  };

  return (
    <div>
      <div id="invoice" style={{ padding: 20, background: '#fff' }}>
        <h2>{data.company.name}</h2>
        <p>{data.company.address}</p>
        <h3>Invoice #{data.invoiceNumber}</h3>
        <p><strong>Date:</strong> {data.invoiceDate}</p>
        <p><strong>Due:</strong> {data.dueDate}</p>
        <hr />
        <h4>Bill To:</h4>
        <p>{data.billTo.name}</p>
        <p>{data.billTo.location}</p>
        <p>PO BOX: {data.billTo.poBox}</p>
        <p>TRN: {data.billTo.trn}</p>
        <hr />
        <table border="1" width="100%" cellPadding="5">
          <thead>
            <tr>
              <th>Description</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Tax %</th><th>Tax Amt</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td>{item.qty}</td>
                <td>{item.unit}</td>
                <td>{item.rate.toFixed(2)}</td>
                <td>{item.taxPercent}</td>
                <td>{item.taxAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <p><strong>Subtotal:</strong> AED {data.totals.subTotal.toFixed(2)}</p>
        <p><strong>Tax:</strong> AED {data.totals.tax.toFixed(2)}</p>
        <p><strong>Total:</strong> AED {data.totals.total.toFixed(2)}</p>
        <p><strong>Balance Due:</strong> AED {data.totals.balanceDue.toFixed(2)}</p>
      </div>
      <button onClick={handleDownload}>Download as PDF</button>
    </div>
  );
};

export default InvoiceDisplay;
