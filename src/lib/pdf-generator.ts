import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SettlementData {
  year: number;
  month: number;
  companyName: string;
  businessNumber?: string | null;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  totalRevenue: number;
  totalDeductions: number;
  netAmount: number;
  status: string;
  details: Array<{
    date: string;
    description: string;
    amount: number;
  }>;
}

/**
 * 정산 내역서 PDF 생성
 */
export function generateSettlementPDF(data: SettlementData, type: 'seller' | 'shipping') {
  const doc = new jsPDF();

  // 제목
  doc.setFontSize(20);
  doc.text(
    type === 'seller' ? 'Settlement Statement (Seller)' : 'Settlement Statement (Shipping)',
    105,
    20,
    { align: 'center' }
  );

  // 정산 기간
  doc.setFontSize(14);
  doc.text(`Period: ${data.year}.${String(data.month).padStart(2, '0')}`, 105, 30, {
    align: 'center',
  });

  // 회사 정보
  doc.setFontSize(11);
  let yPosition = 45;

  doc.text('Company Information', 14, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.text(`Company: ${data.companyName}`, 14, yPosition);
  yPosition += 6;

  if (data.businessNumber) {
    doc.text(`Business Number: ${data.businessNumber}`, 14, yPosition);
    yPosition += 6;
  }

  doc.text(`Account Holder: ${data.accountHolder}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Bank: ${data.bankName}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Account Number: ${data.accountNumber}`, 14, yPosition);
  yPosition += 10;

  // 정산 요약
  doc.setFontSize(11);
  doc.text('Settlement Summary', 14, yPosition);
  yPosition += 7;

  const summaryData = [
    ['Total Revenue', `₩${data.totalRevenue.toLocaleString()}`],
    ['Deductions', `-₩${data.totalDeductions.toLocaleString()}`],
    ['Net Amount', `₩${data.netAmount.toLocaleString()}`],
    ['Status', data.status],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Item', 'Amount']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  });

  // 상세 내역 (있는 경우)
  if (data.details && data.details.length > 0) {
    yPosition = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.text('Detailed Breakdown', 14, yPosition);
    yPosition += 7;

    const detailData = data.details.map((item) => [
      item.date,
      item.description,
      `₩${item.amount.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Description', 'Amount']],
      body: detailData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 9 },
    });
  }

  // 푸터
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-US')}`,
    14,
    doc.internal.pageSize.height - 10
  );
  doc.text(
    `Page ${pageCount}`,
    doc.internal.pageSize.width - 20,
    doc.internal.pageSize.height - 10
  );

  // 파일명 생성
  const fileName = `settlement_${data.year}_${String(data.month).padStart(2, '0')}_${
    type === 'seller' ? 'seller' : 'shipping'
  }.pdf`;

  // PDF 다운로드
  doc.save(fileName);
}

/**
 * 판매자 정산 내역서 생성
 */
export function generateSellerSettlementPDF(settlement: any, userInfo: any) {
  const data: SettlementData = {
    year: settlement.year,
    month: settlement.month,
    companyName: userInfo.businessName || userInfo.nickname || 'N/A',
    businessNumber: userInfo.businessNumber,
    accountHolder: userInfo.accountHolder || 'N/A',
    bankName: userInfo.bankName || 'N/A',
    accountNumber: userInfo.accountNumber || 'N/A',
    totalRevenue: settlement.totalRevenue,
    totalDeductions: settlement.platformFee,
    netAmount: settlement.netAmount,
    status: settlement.status === 'paid' ? 'Paid' : settlement.status === 'confirmed' ? 'Confirmed' : 'Pending',
    details: [
      {
        date: `${settlement.year}-${String(settlement.month).padStart(2, '0')}`,
        description: 'Monthly Sales',
        amount: settlement.totalRevenue,
      },
      {
        date: `${settlement.year}-${String(settlement.month).padStart(2, '0')}`,
        description: 'Platform Fee (5%)',
        amount: -settlement.platformFee,
      },
    ],
  };

  generateSettlementPDF(data, 'seller');
}

/**
 * 배송업체 정산 내역서 생성
 */
export function generateShippingSettlementPDF(settlement: any, companyInfo: any) {
  const data: SettlementData = {
    year: settlement.year,
    month: settlement.month,
    companyName: companyInfo.name || 'N/A',
    businessNumber: companyInfo.businessNumber,
    accountHolder: companyInfo.accountHolder || 'N/A',
    bankName: companyInfo.bankName || 'N/A',
    accountNumber: companyInfo.accountNumber || 'N/A',
    totalRevenue: settlement.totalRevenue,
    totalDeductions: settlement.totalDeductions,
    netAmount: settlement.netAmount,
    status: settlement.status === 'PAID' ? 'Paid' : settlement.status === 'CONFIRMED' ? 'Confirmed' : 'Pending',
    details: [
      {
        date: `${settlement.year}-${String(settlement.month).padStart(2, '0')}`,
        description: 'Delivery Fees',
        amount: settlement.totalRevenue,
      },
      {
        date: `${settlement.year}-${String(settlement.month).padStart(2, '0')}`,
        description: 'Deductions (Damages/Loss)',
        amount: -settlement.totalDeductions,
      },
    ],
  };

  generateSettlementPDF(data, 'shipping');
}
