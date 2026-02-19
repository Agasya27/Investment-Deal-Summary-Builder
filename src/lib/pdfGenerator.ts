import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DealData } from '@/types/deal';

type PDFDoc = jsPDF & { lastAutoTable?: { finalY: number } };

const fmtCurrency = (value: string) => {
  const amount = parseFloat(value);
  if (Number.isNaN(amount)) return '—';
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
};

const fmtPercent = (value: string) => {
  if (!value) return '—';
  return `${value}%`;
};

const riskLabel = (value: number) => ['', 'Low', 'Medium', 'High'][value] || 'Not Set';

const riskSummary = (score: number | null) => {
  if (score === null) return { label: 'Pending', color: [100, 116, 139] as [number, number, number] };
  if (score <= 1.5) return { label: 'Low', color: [22, 163, 74] as [number, number, number] };
  if (score <= 2.5) return { label: 'Moderate', color: [245, 158, 11] as [number, number, number] };
  return { label: 'High', color: [220, 38, 38] as [number, number, number] };
};

const parseTimelineSortKey = (timeline: string, fallbackIndex: number) => {
  const value = timeline.trim().toLowerCase();
  if (!value) return Number.MAX_SAFE_INTEGER - (1000 - fallbackIndex);

  const quarterMatch = value.match(/q([1-4])\s*([12]\d{3})/i);
  if (quarterMatch) {
    const quarter = Number(quarterMatch[1]);
    const year = Number(quarterMatch[2]);
    const month = (quarter - 1) * 3;
    return new Date(year, month, 1).getTime();
  }

  const monthYearMatch = value.match(
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+([12]\d{3})/i,
  );
  if (monthYearMatch) {
    const monthMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
    };
    const month = monthMap[monthYearMatch[1].slice(0, 4)] ?? monthMap[monthYearMatch[1].slice(0, 3)] ?? 0;
    const year = Number(monthYearMatch[2]);
    return new Date(year, month, 1).getTime();
  }

  const yearOnlyMatch = value.match(/\b([12]\d{3})\b/);
  if (yearOnlyMatch) return new Date(Number(yearOnlyMatch[1]), 0, 1).getTime();

  return Number.MAX_SAFE_INTEGER - (1000 - fallbackIndex);
};

export function buildInvestmentPDF(data: DealData) {
  const doc = new jsPDF('p', 'mm', 'a4') as PDFDoc;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const bottomSafe = 18;

  const brandDark: [number, number, number] = [16, 24, 39];
  const brandBlue: [number, number, number] = [59, 91, 219];
  const slate: [number, number, number] = [100, 116, 139];
  const textDark: [number, number, number] = [30, 41, 59];
  const border: [number, number, number] = [222, 226, 235];
  const panel: [number, number, number] = [248, 250, 253];

  let y = 18;

  const drawHeader = () => {
    doc.setFillColor(...brandDark);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setFillColor(...brandBlue);
    doc.rect(0, 28, pageWidth, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('Investment Deal Summary', margin, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.companyName || 'Company', margin, 20);
    doc.text(
      `Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
      pageWidth - margin,
      20,
      { align: 'right' },
    );
    y = 36;
  };

  const drawFooter = () => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i += 1) {
      doc.setPage(i);
      doc.setDrawColor(...border);
      doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...slate);
      doc.text('Confidential - Internal Investment Review', margin, pageHeight - 6);
      doc.text(`Page ${i} of ${pages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
    }
  };

  const addPage = () => {
    doc.addPage();
    drawHeader();
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - bottomSafe) addPage();
  };

  const sectionTitle = (title: string, subtitle?: string) => {
    ensureSpace(14);
    doc.setFillColor(...brandBlue);
    doc.roundedRect(margin, y - 1, 2.4, 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.setFontSize(12);
    doc.text(title, margin + 6, y + 4);
    y += 8;

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...slate);
      doc.text(subtitle, margin + 6, y);
      y += 5;
    }
  };

  const drawWrappedText = (text: string, x: number, maxWidth: number, lineHeight = 4.2) => {
    const lines = doc.splitTextToSize(text || '—', maxWidth) as string[];
    lines.forEach((line) => {
      ensureSpace(lineHeight + 1);
      doc.text(line, x, y);
      y += lineHeight;
    });
  };

  const drawKeyValueGrid = (rows: Array<[string, string]>, columns = 2) => {
    const colGap = 6;
    const cardW = (contentWidth - (columns - 1) * colGap) / columns;
    const rowHeight = 16;
    rows.forEach((item, idx) => {
      if (idx % columns === 0) ensureSpace(rowHeight + 2);
      const row = Math.floor(idx / columns);
      const col = idx % columns;
      const x = margin + col * (cardW + colGap);
      const yRow = y + row * (rowHeight + 2);

      doc.setFillColor(...panel);
      doc.setDrawColor(...border);
      doc.roundedRect(x, yRow, cardW, rowHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...slate);
      doc.setFontSize(8);
      doc.text(item[0], x + 3, yRow + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...textDark);
      doc.setFontSize(9.5);
      const lines = doc.splitTextToSize(item[1] || '—', cardW - 6) as string[];
      doc.text(lines[0] || '—', x + 3, yRow + 11);
    });
    y += Math.ceil(rows.length / columns) * 18 + 2;
  };

  drawHeader();

  // 1) Deal Snapshot
  sectionTitle('Deal Snapshot', 'Core context for the investment opportunity');
  drawKeyValueGrid([
    ['Company', data.companyName || '—'],
    ['Industry', data.industry || '—'],
    ['Funding Stage', data.fundingStage || '—'],
    ['Investment Ask', fmtCurrency(data.investmentAsk)],
    ['Valuation', fmtCurrency(data.valuation)],
    ['Equity Offered', fmtPercent(data.equityOffered)],
  ]);

  // 2) Analytics Snapshot
  const burn = parseFloat(data.monthlyBurnRate) || 0;
  const cash = parseFloat(data.availableCash) || 0;
  const runway = burn > 0 ? `${(cash / burn).toFixed(1)} months` : 'N/A';
  const totalAllocation = data.fundAllocations.reduce((sum, alloc) => sum + (alloc.percentage || 0), 0);
  const avgRisk = data.marketRisk > 0 && data.productRisk > 0 && data.teamRisk > 0
    ? (data.marketRisk + data.productRisk + data.teamRisk) / 3
    : null;
  const risk = riskSummary(avgRisk);
  const populatedFounders = data.founders.filter((f) => f.name.trim()).length;

  sectionTitle('Analytics Snapshot', 'Quick diagnostic view for investment discussion');
  drawKeyValueGrid([
    ['Runway', runway],
    ['Risk Posture', avgRisk !== null ? `${risk.label} (${avgRisk.toFixed(1)} / 3.0)` : 'Pending'],
    ['Allocation Readiness', `${totalAllocation}%`],
    ['Founder Profiles', `${populatedFounders} complete`],
  ]);

  ensureSpace(12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slate);
  doc.text('Risk Band', margin, y + 2);
  doc.setFillColor(230, 236, 246);
  doc.roundedRect(margin, y + 4, contentWidth, 5, 2, 2, 'F');
  if (avgRisk !== null) {
    const scoreW = (Math.max(0, Math.min(avgRisk, 3)) / 3) * contentWidth;
    doc.setFillColor(...risk.color);
    doc.roundedRect(margin, y + 4, scoreW, 5, 2, 2, 'F');
  }
  y += 14;

  // 3) Founder Profiles
  sectionTitle('Founder Profiles');
  const founders = data.founders.length > 0 ? data.founders : [{ id: 'empty', name: '', role: '', experience: '', background: '' }];
  founders.forEach((founder, idx) => {
    ensureSpace(16);
    doc.setFillColor(...panel);
    doc.setDrawColor(...border);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.setFontSize(9.5);
    doc.text(`${founder.name || `Founder ${idx + 1}`}${founder.role ? ` — ${founder.role}` : ''}`, margin + 3, y + 6);
    y += 13;

    if (founder.experience) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...slate);
      doc.text('Experience:', margin + 3, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textDark);
      doc.text(founder.experience, margin + 21, y);
      y += 5;
    }

    if (founder.background) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...slate);
      ensureSpace(5);
      doc.text('Background Summary', margin + 3, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textDark);
      doc.setFontSize(8.8);
      drawWrappedText(founder.background, margin + 3, contentWidth - 6, 4.1);
    }
    y += 4;
  });

  // 4) Financial Overview
  sectionTitle('Financial Overview');
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Metric', 'Value']],
    body: [
      ['Revenue', fmtCurrency(data.revenue)],
      ['Monthly Burn Rate', fmtCurrency(data.monthlyBurnRate)],
      ['Growth Percentage', fmtPercent(data.growthPercentage)],
      ['Available Cash', fmtCurrency(data.availableCash)],
      ['Runway', runway],
    ],
    theme: 'grid',
    headStyles: { fillColor: brandDark, textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8.8, textColor: textDark, cellPadding: 3.2 },
    alternateRowStyles: { fillColor: [248, 250, 253] },
    styles: { lineColor: border, lineWidth: 0.2 },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 6;

  // 5) Investment Structure
  sectionTitle('Investment Structure');
  drawKeyValueGrid([
    ['Ticket Size', fmtCurrency(data.ticketSize)],
    ['Minimum Investment', fmtCurrency(data.minimumInvestment)],
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Category', 'Allocation']],
    body: data.fundAllocations
      .filter((alloc) => alloc.category.trim())
      .map((alloc) => [alloc.category, `${alloc.percentage}%`]),
    theme: 'grid',
    headStyles: { fillColor: brandDark, textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8.8, textColor: textDark, cellPadding: 3.2 },
    alternateRowStyles: { fillColor: [248, 250, 253] },
    styles: { lineColor: border, lineWidth: 0.2 },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 6;

  const allocationBars = data.fundAllocations.filter((alloc) => alloc.category.trim() && alloc.percentage > 0);
  if (allocationBars.length > 0) {
    ensureSpace(14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...slate);
    doc.text('Allocation Distribution', margin, y + 2);
    doc.setFillColor(232, 238, 247);
    doc.roundedRect(margin, y + 4, contentWidth, 5, 2, 2, 'F');

    const palette: [number, number, number][] = [
      [59, 91, 219],
      [16, 185, 129],
      [245, 158, 11],
      [14, 165, 233],
      [139, 92, 246],
      [239, 68, 68],
    ];

    let x = margin;
    allocationBars.forEach((alloc, idx) => {
      const width = (Math.max(0, Math.min(alloc.percentage, 100)) / 100) * contentWidth;
      if (width <= 0) return;
      doc.setFillColor(...palette[idx % palette.length]);
      doc.rect(x, y + 4, width, 5, 'F');
      x += width;
    });
    y += 12;
  }

  // 6) Risk Assessment
  sectionTitle('Risk Assessment');
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Risk Type', 'Rating']],
    body: [
      ['Market Risk', riskLabel(data.marketRisk)],
      ['Product Risk', riskLabel(data.productRisk)],
      ['Team Risk', riskLabel(data.teamRisk)],
      ['Overall Risk', avgRisk !== null ? `${avgRisk.toFixed(1)} / 3.0 (${risk.label})` : 'Pending'],
    ],
    theme: 'grid',
    headStyles: { fillColor: brandDark, textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8.8, textColor: textDark, cellPadding: 3.2 },
    alternateRowStyles: { fillColor: [248, 250, 253] },
    styles: { lineColor: border, lineWidth: 0.2 },
  });
  y = (doc.lastAutoTable?.finalY ?? y) + 6;

  // 7) Milestone Timeline
  sectionTitle('Milestone Timeline');
  const milestones = data.milestones
    .filter((m) => m.title.trim())
    .map((m, idx) => ({ ...m, sortKey: parseTimelineSortKey(m.timeline, idx), fallbackIndex: idx }))
    .sort((a, b) => a.sortKey - b.sortKey || a.fallbackIndex - b.fallbackIndex);
  if (milestones.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate);
    doc.setFontSize(9);
    doc.text('No milestones added.', margin, y);
    y += 6;
  } else {
    milestones.forEach((milestone) => {
      ensureSpace(9);
      doc.setFillColor(...brandBlue);
      doc.circle(margin + 2, y + 1.6, 1.4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...textDark);
      doc.setFontSize(9.3);
      doc.text(milestone.title, margin + 6, y + 2);

      if (milestone.timeline) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.4);
        doc.setTextColor(...slate);
        const timelineText = doc.splitTextToSize(milestone.timeline, 38) as string[];
        doc.text(timelineText, pageWidth - margin, y + 2, { align: 'right' });
      }
      y += 7.5;
    });
  }

  // 8) Notes
  const notes = [
    ['Key Assumptions', data.keyAssumptions],
    ['Exit Strategy', data.exitStrategy],
    ['Additional Remarks', data.additionalRemarks],
  ].filter(([, value]) => value.trim());

  if (notes.length > 0) {
    sectionTitle('Notes');
    notes.forEach(([label, content]) => {
      ensureSpace(12);
      doc.setFillColor(...panel);
      doc.setDrawColor(...border);
      doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...textDark);
      doc.text(label, margin + 3, y + 5.3);
      y += 13;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(...textDark);
      drawWrappedText(content, margin + 2.5, contentWidth - 5, 4.2);
      y += 3;
    });
  }

  drawFooter();
  return doc;
}

export function generatePDF(data: DealData) {
  const doc = buildInvestmentPDF(data);
  doc.save('Investment_Summary.pdf');
}
