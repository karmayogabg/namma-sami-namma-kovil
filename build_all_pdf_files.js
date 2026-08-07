const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const JSZip = require('jszip');

console.log('Starting Master PDF Batch Generation for 62,521 Records...');

const rawData = fs.readFileSync('namma_sami_namma_kovil_full.json', 'utf8');
const allData = JSON.parse(rawData);

const RECORDS_PER_PAGE = 20;
const RECORDS_PER_BATCH = 500;
const totalBatches = Math.ceil(allData.length / RECORDS_PER_BATCH);

console.log(`Total Records: ${allData.length.toLocaleString()}`);
console.log(`Total Batches: ${totalBatches} PDF files`);

const outputZipPath = path.join(__dirname, 'NSNK_Master_126_PDF_Batches_ZIP.zip');
const zip = new JSZip();
const pdfFolder = zip.folder('NSNK_PDF_Caller_Sheets_126_Batches');

async function buildAllPdfBatches() {
    for (let i = 0; i < totalBatches; i++) {
        const startIdx = i * RECORDS_PER_BATCH;
        const endIdx = Math.min((i + 1) * RECORDS_PER_BATCH, allData.length);
        const batchRecords = allData.slice(startIdx, endIdx);

        const batchNum = String(i + 1).padStart(3, '0');
        const startStr = String(startIdx + 1).padStart(5, '0');
        const endStr = String(endIdx).padStart(5, '0');
        const fileName = `NSNK_Batch_${batchNum}_Persons_${startStr}_to_${endStr}.pdf`;

        const pdfBuffer = await createPdfBuffer(batchRecords, batchNum, startIdx, endIdx, allData.length);
        pdfFolder.file(fileName, pdfBuffer);

        if ((i + 1) % 10 === 0 || i === totalBatches - 1) {
            console.log(`Compiled ${i + 1} / ${totalBatches} PDF files...`);
        }
    }

    console.log('Compressing all 126 PDF files into master ZIP package...');
    const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    fs.writeFileSync(outputZipPath, content);

    const stats = fs.statSync(outputZipPath);
    console.log(`Master ZIP Package created successfully! Path: ${outputZipPath}`);
    console.log(`ZIP Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

function createPdfBuffer(records, batchNum, startIdx, endIdx, totalRecords) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 20 });
        doc.registerFont('Tamil', path.join(__dirname, 'NotoSansTamil-Regular.ttf'));
        doc.registerFont('Tamil-Bold', path.join(__dirname, 'NotoSansTamil-Bold.ttf'));
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const totalPages = Math.ceil(records.length / RECORDS_PER_PAGE);

        for (let p = 0; p < totalPages; p++) {
            if (p > 0) doc.addPage();

            const pStart = p * RECORDS_PER_PAGE;
            const pEnd = Math.min((p + 1) * RECORDS_PER_PAGE, records.length);
            const pageRecords = records.slice(pStart, pEnd);

            const pageCode = `NSNK-B${batchNum}-P${String(p + 1).padStart(2, '0')}`;

            // Header
            doc.fontSize(12).font('Tamil-Bold').fillColor('#0f172a')
               .text(`Namma Sami Namma Kovil - PDF Caller Sheets (Batch #${batchNum})`, 20, 20);
            
            doc.fontSize(8).font('Tamil').fillColor('#475569')
               .text(`Persons #${startIdx + pStart + 1} to #${startIdx + pEnd}  |  Page ${p + 1} of ${totalPages}  |  CODE: ${pageCode}`, 20, 36);

            doc.rect(480, 18, 95, 24).fillAndStroke('#0f172a', '#0f172a');
            doc.fontSize(8).font('Tamil-Bold').fillColor('#6ee7b7')
               .text(pageCode, 485, 26, { width: 85, align: 'center' });

            doc.moveTo(20, 48).lineTo(575, 48).lineWidth(1).strokeColor('#0f172a').stroke();

            // Records Table
            let y = 54;
            pageRecords.forEach((item, idx) => {
                const globalIdx = startIdx + pStart + idx + 1;
                const survey = item.survey || {};
                const q1 = survey.q1 || ' ';
                const q2 = survey.q2 || ' ';
                const q3 = survey.q3 || ' ';

                // Member Row Box
                doc.rect(20, y, 555, 34).lineWidth(0.5).strokeColor('#0f172a').stroke();

                // Index Badge
                doc.rect(20, y, 24, 34).fill('#0f172a');
                doc.fontSize(8).font('Tamil-Bold').fillColor('#ffffff')
                   .text(`${globalIdx}`, 20, y + 11, { width: 24, align: 'center' });

                // Details Line
                const name = item.name || '';
                const mobile = item.mobile ? `Ph: ${item.mobile}` : '';
                const loc = [item.region, item.district, item.union].filter(Boolean).join(' | ');

                doc.fontSize(8.5).font('Tamil-Bold').fillColor('#0f172a')
                   .text(`${name}   ${mobile}   ${loc}`, 50, y + 4, { width: 370 });

                // Rating Box (Right aligned)
                doc.rect(425, y + 3, 145, 14).lineWidth(1).strokeColor('#0f172a').stroke();
                doc.fontSize(6.5).font('Tamil-Bold').fillColor('#0f172a')
                   .text(`Q1: [A][B][C]  Q2: [A][B][C]  Q3: [A][B][C]`, 428, y + 7, { width: 140, align: 'center' });

                // Meaning Line
                const meaningText = item.meaning ? `Meaning: ${item.meaning}` : 'Meaning script loading...';
                doc.fontSize(7.5).font('Tamil').fillColor('#334155')
                   .text(meaningText, 50, y + 18, { width: 520, height: 13, ellipsis: true });

                y += 36;
            });
        }

        doc.end();
    });
}

buildAllPdfBatches().catch(console.error);
