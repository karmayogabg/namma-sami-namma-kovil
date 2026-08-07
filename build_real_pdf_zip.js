const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const JSZip = require('jszip');

console.log('Generating 126 REAL PDF files on disk and building master ZIP...');

const rawData = fs.readFileSync('namma_sami_namma_kovil_full.json', 'utf8');
const allData = JSON.parse(rawData);

const RECORDS_PER_PAGE = 20;
const RECORDS_PER_BATCH = 500;
const totalBatches = Math.ceil(allData.length / RECORDS_PER_BATCH);

const pdfDir = path.join(__dirname, 'pdf_batches');
if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir);
}

function generateBatchPdf(records, batchNum, startIdx, endIdx) {
    return new Promise((resolve, reject) => {
        const batchStr = String(batchNum).padStart(3, '0');
        const startStr = String(startIdx + 1).padStart(5, '0');
        const endStr = String(endIdx).padStart(5, '0');
        const pdfPath = path.join(pdfDir, `NSNK_Batch_${batchStr}_Persons_${startStr}_to_${endStr}.pdf`);

        const doc = new PDFDocument({ size: 'A4', margin: 20 });
        doc.registerFont('Tamil', path.join(__dirname, 'NotoSansTamil-Regular.ttf'));
        doc.registerFont('Tamil-Bold', path.join(__dirname, 'NotoSansTamil-Bold.ttf'));

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        const totalPages = Math.ceil(records.length / RECORDS_PER_PAGE);

        for (let p = 0; p < totalPages; p++) {
            if (p > 0) doc.addPage();

            const pStart = p * RECORDS_PER_PAGE;
            const pEnd = Math.min((p + 1) * RECORDS_PER_PAGE, records.length);
            const pageRecords = records.slice(pStart, pEnd);

            const pageCode = `NSNK-B${batchStr}-P${String(p + 1).padStart(2, '0')}`;

            // Header
            doc.fontSize(11).font('Tamil-Bold').fillColor('#0f172a')
               .text(`Namma Sami Namma Kovil - PDF Caller Sheets (Batch #${batchStr})`, 20, 20);
            
            doc.fontSize(8).font('Tamil').fillColor('#475569')
               .text(`Persons #${startIdx + pStart + 1} to #${startIdx + pEnd}  |  Page ${p + 1} of ${totalPages}  |  CODE: ${pageCode}`, 20, 35);

            doc.rect(480, 18, 95, 22).fillAndStroke('#0f172a', '#0f172a');
            doc.fontSize(8).font('Tamil-Bold').fillColor('#6ee7b7')
               .text(pageCode, 485, 25, { width: 85, align: 'center' });

            doc.moveTo(20, 46).lineTo(575, 46).lineWidth(1).strokeColor('#0f172a').stroke();

            // Records Table
            let y = 52;
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
                doc.fontSize(7.5).font('Tamil-Bold').fillColor('#ffffff')
                   .text(`${globalIdx}`, 20, y + 12, { width: 24, align: 'center' });

                // Details Line
                const name = item.name || '';
                const mobile = item.mobile ? `Ph: ${item.mobile}` : '';
                const loc = [item.region, item.district, item.union].filter(Boolean).join(' | ');

                doc.fontSize(8.5).font('Tamil-Bold').fillColor('#0f172a')
                   .text(`${name}   ${mobile}   ${loc}`, 48, y + 4, { width: 370 });

                // Rating Box (Right aligned)
                doc.rect(425, y + 3, 145, 14).lineWidth(1).strokeColor('#0f172a').stroke();
                doc.fontSize(6.5).font('Tamil-Bold').fillColor('#0f172a')
                   .text(`Q1: [A][B][C]  Q2: [A][B][C]  Q3: [A][B][C]`, 428, y + 7, { width: 140, align: 'center' });

                // Meaning Line
                const meaningText = item.meaning ? `Meaning: ${item.meaning}` : 'Meaning script loading...';
                doc.fontSize(7.5).font('Tamil').fillColor('#334155')
                   .text(meaningText, 48, y + 18, { width: 520, height: 13, ellipsis: true });

                y += 36;
            });
        }

        doc.end();

        stream.on('finish', () => resolve(pdfPath));
        stream.on('error', reject);
    });
}

async function run() {
    console.log('Generating PDF files on disk...');
    for (let i = 0; i < totalBatches; i++) {
        const startIdx = i * RECORDS_PER_BATCH;
        const endIdx = Math.min((i + 1) * RECORDS_PER_BATCH, allData.length);
        const batchNum = i + 1;
        await generateBatchPdf(allData.slice(startIdx, endIdx), batchNum, startIdx, endIdx);

        if (batchNum % 10 === 0 || batchNum === totalBatches) {
            console.log(`Generated ${batchNum} / ${totalBatches} PDF files...`);
        }
    }

    console.log('Zipping all 126 PDF files...');
    const zip = new JSZip();
    const folder = zip.folder('NSNK_PDF_Caller_Sheets_126_Batches');

    const pdfFiles = fs.readdirSync(pdfDir);
    pdfFiles.forEach(file => {
        const filePath = path.join(pdfDir, file);
        const content = fs.readFileSync(filePath);
        folder.file(file, content);
    });

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    const outputZipPath = path.join(__dirname, 'NSNK_Master_126_PDF_Batches_ZIP.zip');
    fs.writeFileSync(outputZipPath, zipBuffer);

    const stats = fs.statSync(outputZipPath);
    console.log(`MASTER ZIP FILE GENERATED SUCCESSFULLY!`);
    console.log(`Path: ${outputZipPath}`);
    console.log(`Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Total PDF files inside ZIP: ${pdfFiles.length}`);
}

run().catch(console.error);
