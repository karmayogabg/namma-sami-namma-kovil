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

if (typeof window !== 'undefined') {
    window.scanFilledSheetPhoto = scanFilledSheetPhoto;
}
