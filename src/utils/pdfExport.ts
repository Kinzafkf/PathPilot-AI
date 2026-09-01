import { jsPDF } from 'jspdf';
import { ResumeAnalysisData } from '../types';

export const exportResumeAnalysisToPDF = (analysis: ResumeAnalysisData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 2, 'F');
    y += 6;
  };

  // 1. Title & Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PathPilot AI — ATS Resume Analysis Report', margin + 6, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`File: ${analysis.fileName || 'Uploaded_Resume.pdf'}  |  Target Role: ${analysis.targetRole || 'Software / CS Graduate'}  |  Date: ${dateStr}`, margin + 6, y + 20);
  doc.text('Designed for Pakistani CS/IT Students & Fresh Graduates', margin + 6, y + 26);

  y += 38;

  // 2. Score Overview Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  // Overall Score
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Overall ATS Score:', margin + 6, y + 11);

  const score = analysis.atsScore || 0;
  if (score >= 80) {
    doc.setTextColor(16, 185, 129); // green
  } else if (score >= 65) {
    doc.setTextColor(59, 130, 246); // blue
  } else if (score >= 50) {
    doc.setTextColor(245, 158, 11); // amber
  } else {
    doc.setTextColor(239, 68, 68); // red
  }
  doc.setFontSize(22);
  doc.text(`${score}/100`, margin + 50, y + 12);

  let ratingLabel = 'Needs Optimization';
  if (score >= 85) ratingLabel = 'Excellent (ATS Ready)';
  else if (score >= 70) ratingLabel = 'Competitive';
  else if (score >= 50) ratingLabel = 'Moderate Gaps';
  else ratingLabel = 'High Rejection Risk';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Evaluation Grade: ${ratingLabel}`, margin + 6, y + 20);

  y += 32;

  // 3. Category Breakdown (2 columns)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Category Score Breakdown', margin, y);
  y += 6;

  const categories = [
    { name: 'ATS Compatibility', val: analysis.categoryScores?.atsCompatibility ?? 75 },
    { name: 'Skills & Tech Stack', val: analysis.categoryScores?.skills ?? 70 },
    { name: 'Experience & Projects', val: analysis.categoryScores?.experience ?? 65 },
    { name: 'Education & Degree', val: analysis.categoryScores?.education ?? 85 },
    { name: 'Keywords & Job Match', val: analysis.categoryScores?.keywords ?? 60 },
    { name: 'Formatting & Layout', val: analysis.categoryScores?.formatting ?? 80 },
    { name: 'Grammar & Tone', val: analysis.categoryScores?.grammar ?? 90 },
    { name: 'Professional Impact', val: analysis.categoryScores?.professionalImpact ?? 65 },
  ];

  const colWidth = (contentWidth - 6) / 2;
  for (let i = 0; i < categories.length; i += 2) {
    checkPageBreak(12);
    const cat1 = categories[i];
    const cat2 = categories[i + 1];

    // Left Col
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`${cat1.name}:`, margin + 2, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(`${cat1.val}%`, margin + colWidth - 10, y + 4);

    // Right Col
    if (cat2) {
      doc.setFont('helvetica', 'normal');
      doc.text(`${cat2.name}:`, margin + colWidth + 8, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(`${cat2.val}%`, margin + contentWidth - 8, y + 4);
    }
    y += 7;
  }

  y += 4;

  // 4. Strengths
  if (analysis.strengths && analysis.strengths.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // green
    doc.text('Key Strengths & High Points', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    analysis.strengths.slice(0, 5).forEach((str) => {
      checkPageBreak(10);
      const lines = doc.splitTextToSize(`• ${str}`, contentWidth - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 4.5 + 1;
    });
    y += 4;
  }

  // 5. Weaknesses & Missing Keywords
  if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text('Missing High-Value Keywords & Tech Terms', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const keywordsText = `Missing: ${analysis.missingKeywords.join(', ')}`;
    const kwLines = doc.splitTextToSize(keywordsText, contentWidth - 4);
    doc.text(kwLines, margin + 2, y);
    y += kwLines.length * 4.5 + 4;
  }

  // 6. Actionable Fixes (Problem -> Why it matters -> Recommended Fix)
  if (analysis.actionableIssues && analysis.actionableIssues.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Prioritized Action Items & Recommendations', margin, y);
    y += 7;

    analysis.actionableIssues.slice(0, 4).forEach((issue, idx) => {
      checkPageBreak(26);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(185, 28, 28); // red
      doc.text(`Issue #${idx + 1}: ${issue.problem}`, margin + 4, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Why It Matters: ${issue.whyItMatters}`, margin + 4, y + 10);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // green
      const fixLines = doc.splitTextToSize(`Fix: ${issue.recommendedFix}`, contentWidth - 8);
      doc.text(fixLines, margin + 4, y + 15);

      y += 25;
    });
  }

  // 7. Improved Professional Summary
  if (analysis.improvedProfessionalSummary) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('AI-Recommended Professional Summary (ATS Optimized)', margin, y);
    y += 6;

    doc.setFillColor(238, 242, 255); // indigo-50
    doc.setDrawColor(199, 210, 254);
    const summaryLines = doc.splitTextToSize(analysis.improvedProfessionalSummary, contentWidth - 10);
    const boxHeight = summaryLines.length * 4.5 + 8;

    checkPageBreak(boxHeight + 4);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(summaryLines, margin + 5, y + 6);
    y += boxHeight + 6;
  }

  // 8. Resume Improvement Checklist
  if (analysis.improvementChecklist && analysis.improvementChecklist.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Final ATS Optimization Checklist', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    analysis.improvementChecklist.slice(0, 6).forEach((item) => {
      checkPageBreak(8);
      doc.text(`[  ]  ${item}`, margin + 2, y);
      y += 5.5;
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `PathPilot AI (pathpilot.pk) — Career & Resume Assistant for Pakistani Tech Graduates | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const cleanFilename = (analysis.fileName || 'Resume_Analysis')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`PathPilot_ATS_Report_${cleanFilename}.pdf`);
};
