import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateReportPDF = (reportData, reportType) => {
  const doc = new jsPDF();
  
  // Set font to outfit-style (using Helvetica as fallback)
  doc.setFont('helvetica');
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SmartHMS', 20, 18);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Hospital Management System', 20, 28);
  
  // Report Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(reportData.title || 'System Report', 20, 55);
  
  // Date Range
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 65);
  if (reportData.dateRange) {
    doc.text(`Period: ${reportData.dateRange}`, 20, 72);
  }
  
  let yPosition = 85;
  
  // Summary Stats
  if (reportData.stats && reportData.stats.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Summary', 20, yPosition);
    yPosition += 10;
    
    // Stats cards
    const statsPerRow = 3;
    const cardWidth = (pageWidth - 40) / statsPerRow - 5;
    let xPos = 20;
    let rowY = yPosition;
    
    reportData.stats.forEach((stat, index) => {
      if (index > 0 && index % statsPerRow === 0) {
        rowY += 35;
        xPos = 20;
      }
      
      // Card background
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(xPos, rowY, cardWidth, 25, 3, 3, 'F');
      
      // Label
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(stat.label, xPos + 5, rowY + 8);
      
      // Value
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(String(stat.value), xPos + 5, rowY + 20);
      
      xPos += cardWidth + 5;
    });
    
    yPosition = rowY + 40;
  }
  
  // Table Data
  if (reportData.tableData && reportData.tableData.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Detailed Report', 20, yPosition);
    yPosition += 5;
    
    doc.autoTable({
      startY: yPosition,
      head: [reportData.tableHeaders || []],
      body: reportData.tableData,
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 5,
        lineColor: [220, 220, 220],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      margin: { left: 20, right: 20 },
    });
    
    // Get the final Y position after the table
    yPosition = (doc.lastAutoTable?.finalY || yPosition) + 10;
  }
  
  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'SmartHMS - Confidential',
      20,
      pageHeight - 10
    );
  }
  
  // Save
  const fileName = `${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
