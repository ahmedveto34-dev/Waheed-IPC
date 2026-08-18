import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  filename?: string;
  title?: string;
  onProgress?: (progressText: string) => void;
}

/**
 * High-quality multi-page PDF exporter that captures HTML elements (text, tables, badges, SVGs, charts)
 * and formats them into standard A4 PDF pages with high resolution and crisp rendering.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    filename = 'Medical_Policy_Executive_Review.pdf',
    onProgress
  } = options;

  if (!element) {
    throw new Error('Element not found for PDF export');
  }

  onProgress?.('جاري تحضير وتنسيق عناصر المستند والرسومات...');

  // Create a clean container clone if needed, or work with current element
  const originalWidth = element.style.width;
  const originalMaxWidth = element.style.maxWidth;

  try {
    onProgress?.('جاري معالجة النصوص والصور بجودة عالية (2x DPI)...');

    // Render with html2canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (300dpi equivalent)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure all fonts and print styles look pristine
        const clonedElement = clonedDoc.querySelector('.a4-paper-sheet') as HTMLElement;
        if (clonedElement) {
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.borderRadius = '0px';
          clonedElement.style.border = 'none';
          clonedElement.style.margin = '0 auto';
        }
      }
    });

    onProgress?.('جاري تقسيم الصفحات وتوليد ملف PDF القياسي (A4)...');

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 5; // 5mm margin
    const contentWidth = pdfWidth - margin * 2;
    const pageContentHeight = pdfHeight - margin * 2;

    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    let heightLeft = imgHeight;
    let position = margin;
    let pageNum = 1;

    // Add first page
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageContentHeight;

    // Add subsequent pages if document is longer than 1 page
    while (heightLeft > 0) {
      position = margin - (pageNum * pageContentHeight);
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
      pageNum++;
      heightLeft -= pageContentHeight;
    }

    onProgress?.('جاري تنزيل الملف...');
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Restore original styles
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
  }
}
