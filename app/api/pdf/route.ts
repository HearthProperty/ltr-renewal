// API route: POST /api/pdf
// Generates a branded Renewal Uplift Plan PDF.

import { NextResponse } from 'next/server';
import { buildRenewalPlanHTML, generatePDF } from '@/lib/pdf';
import type { PDFData } from '@/lib/pdf';

export const maxDuration = 30; // Allow up to 30s for PDF generation

export async function POST(request: Request) {
  try {
    const body = await request.json() as PDFData;

    if (!body.input || !body.score || !body.renewalRange) {
      return NextResponse.json(
        { error: 'Missing required data for PDF generation' },
        { status: 400 }
      );
    }

    const html = buildRenewalPlanHTML(body);
    const pdfData = await generatePDF(html);
    const pdfBuffer = Buffer.from(pdfData);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="renewal-plan-${body.input.propertyAddress.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[PDF] Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF. Please try again.' },
      { status: 500 }
    );
  }
}
