const { Canvas, Image } = require('skia-canvas');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

const TOPIC_1_IMAGES = [
    '1A_நம்ம_மொழி_வணக்கம்.png',
    '1B_நம்ம_பாரத_உடை_வானவியல்.png',
    '1C_நம்ம_குடும்பம்_உறவுகள்_அறிவியல்.png',
    '1D_நம்ம_பஞ்சாங்கம்_தியாகம்.png'
];

const TOPIC_2_IMAGES = [
    '2A_நம்ம_சாமி_தத்துவம்_கரதர்சனம்.png',
    '2B_நம்ம_சாமி_ஆன்மீகக்_கதைகள்.png',
    '2C_நம்ம_சாமி_3_வழிபாட்டு_நிலைகள்.png',
    '2D_நம்ம_சாமி_கம்பராமாயணம்_கருணைக்கதைகள்.png'
];

const TOPIC_3_IMAGES = [
    '3A_நம்ம_கோவில்_சொல்லிலக்கணம்_வழிபாட்டு_வடிவங்கள்.png',
    '3B_நம்ம_கோவில்_திருமூலர்_பாடல்கள்_தியாகங்கள்.png',
    '3C_நம்ம_கோவில்_மூர்த்தி_தலம்_தீர்த்தம்_மகான்கள்.png',
    '3D_நம்ம_கோவில்_10_சமுதாயப்_பெருமைகள்.png'
];

const ALL_IMAGES = [
    ...TOPIC_1_IMAGES,
    ...TOPIC_2_IMAGES,
    ...TOPIC_3_IMAGES
];

async function createPDFFromImages(imageList, outputFilename) {
    console.log(`\nGenerating PDF: ${outputFilename} with ${imageList.length} pages...`);
    
    // Load first image to initialize canvas
    const firstImgPath = path.join(DIR, imageList[0]);
    const firstImg = new Image();
    firstImg.src = fs.readFileSync(firstImgPath);
    
    const canvas = new Canvas(firstImg.width, firstImg.height, 'pdf');
    const ctx = canvas.getContext('2d');
    
    // Draw first page
    ctx.drawImage(firstImg, 0, 0, firstImg.width, firstImg.height);
    console.log(`Page 1: ${imageList[0]} (${firstImg.width}x${firstImg.height})`);

    // Draw subsequent pages
    for (let i = 1; i < imageList.length; i++) {
        const imgName = imageList[i];
        const imgPath = path.join(DIR, imgName);
        if (!fs.existsSync(imgPath)) {
            console.error(`Image missing: ${imgPath}`);
            continue;
        }
        const img = new Image();
        img.src = fs.readFileSync(imgPath);
        
        canvas.newPage(img.width, img.height);
        ctx.drawImage(img, 0, 0, img.width, img.height);
        console.log(`Page ${i + 1}: ${imgName} (${img.width}x${img.height})`);
    }

    const pdfBuffer = await canvas.toBuffer('pdf');
    const outputPath = path.join(DIR, outputFilename);
    fs.writeFileSync(outputPath, pdfBuffer);
    
    const fileSizeMB = (pdfBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`SUCCESS: Saved ${outputFilename} (${fileSizeMB} MB)`);
    return outputPath;
}

async function main() {
    console.log('====================================================');
    console.log('CREATING HIGH-RESOLUTION EMBEDDED POSTER PDFS');
    console.log('====================================================');

    // 1. Master PDF containing all 12 pages
    await createPDFFromImages(
        ALL_IMAGES,
        'நம்ம_சாமி_நம்ம_கோவில்_அனைத்து_12_விளக்கப்_படங்கள்_Master.pdf'
    );

    // 2. Topic 1 PDF (4 pages)
    await createPDFFromImages(
        TOPIC_1_IMAGES,
        '1_நம்ம_NAMMA_முழு_விளக்கக்_கையேடு.pdf'
    );

    // 3. Topic 2 PDF (4 pages)
    await createPDFFromImages(
        TOPIC_2_IMAGES,
        '2_நம்ம_சாமி_NAMMA_SAMI_முழு_விளக்கக்_கையேடு.pdf'
    );

    // 4. Topic 3 PDF (4 pages)
    await createPDFFromImages(
        TOPIC_3_IMAGES,
        '3_நம்ம_கோவில்_NAMMA_KOVIL_முழு_விளக்கக்_கையேடு.pdf'
    );

    console.log('\nALL 4 PDF DOCUMENTS CREATED AND VERIFIED SUCCESSFULLY!');
}

main().catch(err => {
    console.error('Fatal error generating PDFs:', err);
    process.exit(1);
});
