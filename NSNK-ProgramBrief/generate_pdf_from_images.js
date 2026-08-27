const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePDF() {
    console.log('Starting Puppeteer PDF generation...');
    const images = [
        '1A_நம்ம_மொழி_வணக்கம்.png',
        '1B_நம்ம_பாரத_உடை_வானவியல்.png',
        '1C_நம்ம_குடும்பம்_உறவுகள்_அறிவியல்.png',
        '1D_நம்ம_பஞ்சாங்கம்_தியாகம்.png',
        '2A_நம்ம_சாமி_தத்துவம்_கரதர்சனம்.png',
        '2B_நம்ம_சாமி_ஆன்மீகக்_கதைகள்.png',
        '2C_நம்ம_சாமி_3_வழிபாட்டு_நிலைகள்.png',
        '2D_நம்ம_சாமி_கம்பராமாயணம்_கருணைக்கதைகள்.png',
        '3A_நம்ம_கோவில்_சொல்லிலக்கணம்_வழிபாட்டு_வடிவங்கள்.png',
        '3B_நம்ம_கோவில்_திருமூலர்_பாடல்கள்_தியாகங்கள்.png',
        '3C_நம்ம_கோவில்_மூர்த்தி_தலம்_தீர்த்தம்_மகான்கள்.png',
        '3D_நம்ம_கோவில்_10_சமுதாயப்_பெருமைகள்.png'
    ];

    let htmlContent = `
    <!DOCTYPE html>
    <html lang="ta">
    <head>
        <meta charset="UTF-8">
        <title>நம்ம சாமி நம்ம கோவில் - விளக்கப் படத் தொகுப்பு (NSNK Posters)</title>
        <style>
            @page {
                size: A4 portrait;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
                background-color: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .page-container {
                width: 100vw;
                height: 100vh;
                page-break-after: always;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                overflow: hidden;
            }
            .page-container:last-child {
                page-break-after: avoid;
            }
            .poster-img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: block;
            }
        </style>
    </head>
    <body>
    `;

    for (const imgName of images) {
        const imgPath = path.join(__dirname, imgName);
        if (!fs.existsSync(imgPath)) {
            console.error(`Image not found: ${imgPath}`);
            continue;
        }
        const base64Data = fs.readFileSync(imgPath).toString('base64');
        const imgSrc = `data:image/png;base64,${base64Data}`;
        htmlContent += `
        <div class="page-container">
            <img class="poster-img" src="${imgSrc}" alt="${imgName}" />
        </div>
        `;
    }

    htmlContent += `
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfPath = path.join(__dirname, 'நம்ம_சாமி_நம்ம_கோவில்_விளக்கப்_படங்கள்_NSNK_Posters.pdf');
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px'
        }
    });

    await browser.close();
    const stats = fs.statSync(pdfPath);
    console.log(`Successfully generated PDF: ${pdfPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
}

generatePDF().catch(err => {
    console.error('Error generating PDF:', err);
    process.exit(1);
});
