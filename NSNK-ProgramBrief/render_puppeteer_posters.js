const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function renderPosters() {
    console.log('Launching Puppeteer browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--font-render-hinting=none'
        ]
    });

    const posters = [
        {
            html: path.join(__dirname, 'poster_1_namma.html'),
            png: path.join(__dirname, '1_நம்ம_Namma.png'),
            name: '1_நம்ம_Namma.png'
        },
        {
            html: path.join(__dirname, 'poster_2_namma_sami.html'),
            png: path.join(__dirname, '2_நம்ம_சாமி_Namma_Sami.png'),
            name: '2_நம்ம_சாமி_Namma_Sami.png'
        },
        {
            html: path.join(__dirname, 'poster_3_namma_kovil.html'),
            png: path.join(__dirname, '3_நம்ம_கோவில்_Namma_Kovil.png'),
            name: '3_நம்ம_கோவில்_Namma_Kovil.png'
        }
    ];

    for (const p of posters) {
        console.log(`Rendering ${p.name}...`);
        const page = await browser.newPage();
        await page.setViewport({
            width: 1480,
            height: 1200,
            deviceScaleFactor: 2 // 2x Retina resolution for razor sharp rendering
        });

        const fileUrl = 'file://' + p.html;
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });

        // Wait for fonts
        await page.evaluateHandle('document.fonts.ready');

        // Screenshot the container element
        const element = await page.$('.poster-container');
        if (element) {
            await element.screenshot({
                path: p.png,
                omitBackground: false
            });
        } else {
            await page.screenshot({
                path: p.png,
                fullPage: true
            });
        }

        const sizeKb = (fs.statSync(p.png).size / 1024).toFixed(1);
        console.log(`Successfully generated ${p.name}: ${sizeKb} KB`);
        await page.close();
    }

    await browser.close();
    console.log('All 3 poster images rendered successfully with flawless typography!');
}

renderPosters().catch(err => {
    console.error('Error rendering posters:', err);
    process.exit(1);
});
