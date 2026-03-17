import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');

    if (!source) {
        return NextResponse.json({ error: 'Source URL required' }, { status: 400 });
    }

    // Launch browser
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] // Safer for generic envs
    });

    try {
        const context = await browser.newContext();
        const page = await context.newPage();

        // Configure viewport for A4-ish ratio
        // The user's example uses 1660x980.
        await page.setViewportSize({ width: 1660, height: 2000 });

        // Visit the page with the PDF flag
        // We assume 'source' is the page URL. Append pdf=1.
        const targetUrl = new URL(source);
        targetUrl.searchParams.set('pdf', '1');

        console.log(`Generating PDF for: ${targetUrl.toString()}`);

        await page.goto(targetUrl.toString(), {
            waitUntil: 'networkidle', // Wait for network requests (like data fetching) to complete
            timeout: 60000 // 60s timeout
        });

        // WAIT for your React app to say it's ready (Important!)
        // The user has `data-pdf-ready="true"` on the main container
        await page.waitForSelector('[data-pdf-ready="true"]', { timeout: 30000 });

        // Inject specific print styles to ensure perfection
        await page.addStyleTag({
            content: `
        @page { size: A4 landscape; margin: 0mm; }
        body { margin: 30px; padding: 0; box-sizing: border-box; }
        html, body { -webkit-print-color-adjust: exact; }
        [data-pdf-ready="true"] { width: 100% !important; max-width: none !important; }
      `,
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            height: '2000px', // Increased height
            printBackground: true,
            scale: 0.75, // Adjust scale to fit content as per user request
            margin: {
                top: '10mm',
                bottom: '10mm',
                left: '10mm',
                right: '10mm'
            }
        });

        // Return the PDF
        return new NextResponse(pdfBuffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="report.pdf"',
            },
        });
    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json(
            { error: 'PDF Generation Failed', details: error.message },
            { status: 500 }
        );
    } finally {
        await browser.close();
    }
}
