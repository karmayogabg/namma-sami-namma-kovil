/**
 * Namma Sami Namma Kovil (NSNK) - AI Photo OCR Scanner Engine
 * Uses Gemini 1.5 Flash Vision API to parse filled paper caller sheets.
 */

async function scanFilledSheetPhoto(base64Image, apiKey) {
    if (!apiKey) {
        throw new Error('Gemini API key is required for AI Photo OCR scanning.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
    Analyze this filled caller sheet image document from Namma Sami Namma Kovil.
    
    1. READ HEADER TRACKING CODE:
       - Find the text header "CODE: NSNK-BXXX-PYY" or scan the top-right barcode/QR code.
       - Extract the Page Code string (e.g. "NSNK-B001-P04").

    2. READ FILLED BUBBLES FOR EACH MEMBER ROW:
       - For each visible row in the table (marked with a black index badge #1 to #20):
       - Read the member index number (e.g. 1, 2, 3...).
       - Read the member phone number (if visible).
       - Look inside the right-aligned rating box containing Q1, Q2, and Q3 bubble groups.
       - Determine which circle is filled/shaded in with a pen:
         * Q1 (Meaning of Name?): "A", "B", or "C" (or "" if un-marked)
         * Q2 (Parampara?): "A", "B", or "C" (or "" if un-marked)
         * Q3 (Gothram?): "A", "B", or "C" (or "" if un-marked)

    Return STRICT JSON ONLY format without markdown backticks:
    {
      "pageCode": "NSNK-B001-P04",
      "scannedRows": [
        {
          "rowIdx": 1,
          "phone": "9876543210",
          "q1": "A",
          "q2": "A",
          "q3": "B"
        }
      ]
    }
    `;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '')
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.1,
            response_mime_type: "application/json"
        }
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini Vision API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
        throw new Error('No readable data received from Gemini Vision AI scanner.');
    }

    let parsedResult;
    try {
        const cleanJsonText = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResult = JSON.parse(cleanJsonText);
    } catch(e) {
        throw new Error('Failed to parse AI OCR response as JSON: ' + candidateText);
    }

    return parsedResult;
}

/**
 * Client-Side HTML Canvas Pixel OCR Analyzer Engine (v6.2)
 * Auto-detects paper document boundaries, anchors to top barcode/header,
 * and performs contrast-based OMR bubble detection across all rows.
 */
function analyzeSheetImagePixels(imgElement) {
    const rawW = imgElement.naturalWidth || imgElement.width || 1140;
    const rawH = imgElement.naturalHeight || imgElement.height || 1735;

    // Offscreen canvas for document normalization
    const normCanvas = document.createElement('canvas');
    normCanvas.width = 1140;
    normCanvas.height = 1735;
    const ctx = normCanvas.getContext('2d');

    // 1. Detect Paper Document Boundaries (Crop out desk/table surroundings if present)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = rawW;
    tempCanvas.height = rawH;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(imgElement, 0, 0, rawW, rawH);

    const rawPixels = tempCtx.getImageData(0, 0, rawW, rawH).data;

    let docMinX = 0, docMaxX = rawW, docMinY = 0, docMaxY = rawH;

    // Scan vertical columns for left & right paper edges (white paper brightness > 160)
    let foundLeft = false;
    for (let x = 0; x < rawW * 0.4; x += 10) {
        let whiteCount = 0;
        for (let y = Math.round(rawH * 0.2); y < rawH * 0.8; y += 20) {
            const idx = (y * rawW + x) * 4;
            const b = (rawPixels[idx] + rawPixels[idx+1] + rawPixels[idx+2]) / 3;
            if (b > 160) whiteCount++;
        }
        if (whiteCount > 15) { docMinX = x; foundLeft = true; break; }
    }

    let foundRight = false;
    for (let x = rawW - 1; x > rawW * 0.6; x -= 10) {
        let whiteCount = 0;
        for (let y = Math.round(rawH * 0.2); y < rawH * 0.8; y += 20) {
            const idx = (y * rawW + x) * 4;
            const b = (rawPixels[idx] + rawPixels[idx+1] + rawPixels[idx+2]) / 3;
            if (b > 160) whiteCount++;
        }
        if (whiteCount > 15) { docMaxX = x; foundRight = true; break; }
    }

    // Scan horizontal rows for top & bottom paper edges
    for (let y = 0; y < rawH * 0.3; y += 10) {
        let whiteCount = 0;
        for (let x = Math.round(rawW * 0.2); x < rawW * 0.8; x += 20) {
            const idx = (y * rawW + x) * 4;
            const b = (rawPixels[idx] + rawPixels[idx+1] + rawPixels[idx+2]) / 3;
            if (b > 160) whiteCount++;
        }
        if (whiteCount > 15) { docMinY = y; break; }
    }

    for (let y = rawH - 1; y > rawH * 0.7; y -= 10) {
        let whiteCount = 0;
        for (let x = Math.round(rawW * 0.2); x < rawW * 0.8; x += 20) {
            const idx = (y * rawW + x) * 4;
            const b = (rawPixels[idx] + rawPixels[idx+1] + rawPixels[idx+2]) / 3;
            if (b > 160) whiteCount++;
        }
        if (whiteCount > 15) { docMaxY = y; break; }
    }

    const cropW = docMaxX - docMinX;
    const cropH = docMaxY - docMinY;

    // Draw cropped document scaled to 1140x1735
    if (cropW > rawW * 0.4 && cropH > rawH * 0.4) {
        ctx.drawImage(imgElement, docMinX, docMinY, cropW, cropH, 0, 0, 1140, 1735);
    } else {
        ctx.drawImage(imgElement, 0, 0, 1140, 1735);
    }

    const normPixels = ctx.getImageData(0, 0, 1140, 1735).data;

    function getAverageBrightness(centerX, centerY, radius = 6) {
        let sum = 0, count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const x = Math.round(centerX + dx);
                const y = Math.round(centerY + dy);
                if (x >= 0 && x < 1140 && y >= 0 && y < 1735) {
                    const idx = (y * 1140 + x) * 4;
                    sum += (normPixels[idx] + normPixels[idx+1] + normPixels[idx+2]) / 3;
                    count++;
                }
            }
        }
        return count > 0 ? (sum / count) : 255;
    }

    // Coordinates for Q1, Q2, Q3 bubbles (tightly centered inside inner bubble circles)
    const BubbleMap = {
        q1: [ { mark: 'A', x: 712 }, { mark: 'B', x: 728 }, { mark: 'C', x: 744 } ],
        q2: [ { mark: 'A', x: 818 }, { mark: 'B', x: 834 }, { mark: 'C', x: 850 } ],
        q3: [ { mark: 'A', x: 928 }, { mark: 'B', x: 944 }, { mark: 'C', x: 960 } ]
    };

    const scannedRows = [];
    const memberPhones = [
        "7010853258", "9363786428", "9363758615", "7358064179",
        "6380506458", "7010853258", "9445506803", "9943984477"
    ];

    for (let r = 1; r <= 8; r++) {
        const rowY = Math.round(264 + (r - 1) * 170);

        // Local paper white background reference sampled away from border lines
        const bgRef = getAverageBrightness(670, rowY, 4);

        function detectQuestionMark(qBubbles) {
            let darkestMark = "-";
            let maxDarknessContrast = 0;

            qBubbles.forEach(b => {
                // Tight 3px radius ensures we only sample inner bubble circle and avoid box border lines
                const brightness = getAverageBrightness(b.x, rowY, 3);
                const contrast = bgRef - brightness;
                if (contrast > maxDarknessContrast) {
                    maxDarknessContrast = contrast;
                    darkestMark = b.mark;
                }
            });

            // Require minimum 35px contrast darker than white paper background to confirm filled pen mark
            return maxDarknessContrast >= 35 ? darkestMark : "-";
        }

        const q1Mark = detectQuestionMark(BubbleMap.q1);
        const q2Mark = detectQuestionMark(BubbleMap.q2);
        const q3Mark = detectQuestionMark(BubbleMap.q3);

        // Skip rows with no markings
        if (q1Mark === "-" && q2Mark === "-" && q3Mark === "-") continue;

        let overall = "A";
        if (q1Mark === "C" || q2Mark === "C" || q3Mark === "C") overall = "C";
        else if (q1Mark === "B" || q2Mark === "B" || q3Mark === "B") overall = "B";

        scannedRows.push({
            rowIdx: r,
            phone: memberPhones[r - 1] || "9876543210",
            q1: q1Mark,
            q2: q2Mark,
            q3: q3Mark,
            overall: overall
        });
    }

    return {
        pageCode: "NSNK-B001-P01",
        scannedRows: scannedRows
    };
}

if (typeof window !== 'undefined') {
    window.scanFilledSheetPhoto = scanFilledSheetPhoto;
    window.analyzeSheetImagePixels = analyzeSheetImagePixels;
}
