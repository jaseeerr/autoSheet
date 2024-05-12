import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const downloadPdfDocument = async () => {
    const input = document.getElementById('table-to-pdf'); // Make sure your table has this ID
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
        orientation: 'landscape',
    });

    const imgProps= pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('download.pdf');
};
