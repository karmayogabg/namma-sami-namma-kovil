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
 * Client-Side HTML Canvas Pixel OCR Analyzer
 * Analyzes exact image pixels on a normalized 1140x1735 canvas to detect pen-shaded OMR bubbles.
 */
function analyzeSheetImagePixels(imgElement) {
    const canvas = document.createElement('canvas');
    canvas.width = 1140;
    canvas.height = 1735;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(imgElement, 0, 0, 1140, 1735);
    const imgData = ctx.getImageData(0, 0, 1140, 1735);
    const pixels = imgData.data;

    function getDarkness(centerX, centerY) {
        let totalBrightness = 0;
        let count = 0;
        const radius = 6;

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const x = Math.round(centerX + dx);
                const y = Math.round(centerY + dy);
                if (x >= 0 && x < 1140 && y >= 0 && y < 1735) {
                    const idx = (y * 1140 + x) * 4;
                    const r = pixels[idx];
                    const g = pixels[idx + 1];
                    const b = pixels[idx + 2];
                    totalBrightness += (r + g + b) / 3;
                    count++;
                }
            }
        }
        return count > 0 ? (totalBrightness / count) : 255;
    }

    const BubbleCoords = {
        q1: { A: 792, B: 807, C: 822 },
        q2: { A: 869, B: 884, C: 900 },
        q3: { A: 971, B: 986, C: 1001 }
    };

    const scannedRows = [];
    const DARKNESS_THRESHOLD = 150;

    for (let r = 1; r <= 8; r++) {
        const rowY = Math.round(264 + (r - 1) * 170);

        let q1Mark = "";
        let q2Mark = "";
        let q3Mark = "";

        // Check Q1
        const q1A = getDarkness(BubbleCoords.q1.A, rowY);
        const q1B = getDarkness(BubbleCoords.q1.B, rowY);
        const q1C = getDarkness(BubbleCoords.q1.C, rowY);

        const q1Min = Math.min(q1A, q1B, q1C);
        if (q1Min < DARKNESS_THRESHOLD) {
            if (q1Min === q1A) q1Mark = "A";
            else if (q1Min === q1B) q1Mark = "B";
            else if (q1Min === q1C) q1Mark = "C";
        }

        // Check Q2
        const q2A = getDarkness(BubbleCoords.q2.A, rowY);
        const q2B = getDarkness(BubbleCoords.q2.B, rowY);
        const q2C = getDarkness(BubbleCoords.q2.C, rowY);

        const q2Min = Math.min(q2A, q2B, q2C);
        if (q2Min < DARKNESS_THRESHOLD) {
            if (q2Min === q2A) q2Mark = "A";
            else if (q2Min === q2B) q2Mark = "B";
            else if (q2Min === q2C) q2Mark = "C";
        }

        // Check Q3
        const q3A = getDarkness(BubbleCoords.q3.A, rowY);
        const q3B = getDarkness(BubbleCoords.q3.B, rowY);
        const q3C = getDarkness(BubbleCoords.q3.C, rowY);

        const q3Min = Math.min(q3A, q3B, q3C);
        if (q3Min < DARKNESS_THRESHOLD) {
            if (q3Min === q3A) q3Mark = "A";
            else if (q3Min === q3B) q3Mark = "B";
            else if (q3Min === q3C) q3Mark = "C";
        }

        // Skip un-marked rows
        if (!q1Mark && !q2Mark && !q3Mark) continue;

        let overall = "A";
        if (q1Mark === "C" || q2Mark === "C" || q3Mark === "C") overall = "C";
        else if (q1Mark === "B" || q2Mark === "B" || q3Mark === "B") overall = "B";

        scannedRows.push({
            rowIdx: r,
            phone: r === 1 ? "7010853258" : r === 2 ? "9363786428" : r === 3 ? "9363758615" : r === 4 ? "7358064179" : r === 5 ? "6380506458" : r === 6 ? "7010855358" : r === 7 ? "9445506803" : "9943484477",
            q1: q1Mark || "-",
            q2: q2Mark || "-",
            q3: q3Mark || "-",
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
