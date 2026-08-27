const fs = require('fs');
const path = require('path');
const https = require('https');

const AUDIO_DIR = __dirname;
const CACHE_FILE = path.join(AUDIO_DIR, 'audio_transcripts.json');
const MASTER_MD = path.join(AUDIO_DIR, 'NSNK_Audio_Lectures_Complete_Transcript.md');

// Load keys from environment or CLI argument
const DEFAULT_KEYS = [
    process.env.GEMINI_API_KEY || ''
].filter(Boolean);

// Helper for HTTPS Request
function httpRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode >= 400 || parsed.error) {
                        return reject(parsed.error || new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                    resolve(parsed);
                } catch (e) {
                    if (res.statusCode >= 400) {
                        return reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                    resolve(body);
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

// Upload Audio to Gemini File API
async function uploadAudioFileToGemini(filePath, mimeType, apiKey) {
    const fileStats = fs.statSync(filePath);
    const numBytes = fileStats.size;
    const fileName = path.basename(filePath);

    const initOptions = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/upload/v1beta/files?key=${apiKey}`,
        method: 'POST',
        headers: {
            'X-Goog-Upload-Protocol': 'resumable',
            'X-Goog-Upload-Command': 'start',
            'X-Goog-Upload-Header-Content-Length': numBytes,
            'X-Goog-Upload-Header-Content-Type': mimeType,
            'Content-Type': 'application/json'
        }
    };

    const initData = JSON.stringify({ file: { display_name: fileName } });

    const uploadUrl = await new Promise((resolve, reject) => {
        const req = https.request(initOptions, (res) => {
            const uploadHeader = res.headers['x-goog-upload-url'];
            if (uploadHeader) {
                resolve(uploadHeader);
            } else {
                let errBody = '';
                res.on('data', d => errBody += d);
                res.on('end', () => reject(new Error(`Failed to get upload URL: ${errBody}`)));
            }
        });
        req.on('error', reject);
        req.write(initData);
        req.end();
    });

    const urlObj = new URL(uploadUrl);
    const fileStream = fs.readFileSync(filePath);

    const uploadRes = await new Promise((resolve, reject) => {
        const req = https.request({
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Length': numBytes,
                'X-Goog-Upload-Offset': '0',
                'X-Goog-Upload-Command': 'upload, finalize'
            }
        }, (res) => {
            let resData = '';
            res.on('data', chunk => resData += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(resData);
                    resolve(parsed.file);
                } catch (e) {
                    reject(new Error(`Failed to parse file upload response: ${resData}`));
                }
            });
        });
        req.on('error', reject);
        req.write(fileStream);
        req.end();
    });

    return uploadRes;
}

// Transcribe & Extract Structured Tamil Information with Gemini
async function transcribeAndSummarizeWithGemini(fileUri, fileName, apiKey) {
    const prompt = `You are an expert Tamil spiritual scholar, historian, and transcriber for the project "நம்ம சாமி நம்ம கோவில் (Namma Sami Namma Kovil)".
Listen carefully to this entire audio recording ("${fileName}").

Please produce a comprehensive, high-quality Tamil transcription and structured breakdown in valid JSON format:
{
  "topic_classification": "தலைப்பு 1: நம்ம | தலைப்பு 2: நம்ம சாமி | தலைப்பு 3: நம்ம கோவில் | பொது அறிமுகம்",
  "title_tamil": "சுருக்கமான தலைப்பு (Tamil Title)",
  "verbatim_transcript_tamil": "முழுமையான துல்லியமான தமிழ் உரை (Complete and accurate Tamil transcription of everything spoken in the audio)",
  "key_takeaways_tamil": [
    "முக்கிய கருத்து 1",
    "முக்கிய கருத்து 2",
    "முக்கிய கருத்து 3"
  ],
  "spiritual_stories_and_references": [
    "குறிப்பிடப்பட்ட கதைகள், நூல்கள், பாசுரங்கள், கோவில்கள் அல்லது ஆன்மீக மேற்கோள்கள்"
  ],
  "relevance_to_three_pillars": "இந்த ஆடியோ நம்ம, நம்ம சாமி, நம்ம கோவில் ஆகிய 3 தலைப்புகளில் எந்த கருத்துக்களை வலுப்படுத்துகிறது என்ற விளக்கம்"
}

Important: Return ONLY valid JSON without markdown fences. Write all text in pure, respectful, articulate Tamil.`;

    const payload = JSON.stringify({
        contents: [{
            parts: [
                { file_data: { mime_type: 'audio/mpeg', file_uri: fileUri } },
                { text: prompt }
            ]
        }],
        generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
        }
    });

    const models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.7-flash'];
    let lastError = null;

    for (const model of models) {
        try {
            const options = {
                hostname: 'generativelanguage.googleapis.com',
                path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            const res = await httpRequest(options, payload);
            const contentText = res.candidates?.[0]?.content?.parts?.[0]?.text;
            if (contentText) {
                try {
                    return JSON.parse(contentText.replace(/```json\s*|\s*```/g, '').trim());
                } catch (e) {
                    return {
                        topic_classification: "நம்ம சாமி நம்ம கோவில்",
                        title_tamil: fileName,
                        verbatim_transcript_tamil: contentText,
                        key_takeaways_tamil: [],
                        spiritual_stories_and_references: []
                    };
                }
            }
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError || new Error('Failed with all models');
}

// Master CLI Execution with Key Rotation and Concurrency
async function main() {
    let apiKeys = [...DEFAULT_KEYS];
    if (process.env.GEMINI_API_KEY) {
        apiKeys.push(process.env.GEMINI_API_KEY);
    }

    let concurrency = 2;
    for (let i = 2; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg === '--key' || arg === '-k') {
            const keys = process.argv[++i].split(/[,;]/).map(k => k.trim()).filter(Boolean);
            apiKeys = keys.concat(apiKeys);
        } else if (arg === '--concurrency' || arg === '-c') {
            concurrency = parseInt(process.argv[++i], 10) || 2;
        } else if (!arg.startsWith('-')) {
            const keys = arg.split(/[,;]/).map(k => k.trim()).filter(Boolean);
            apiKeys = keys.concat(apiKeys);
        }
    }

    apiKeys = Array.from(new Set(apiKeys));

    console.log(`Loaded ${apiKeys.length} Gemini API Key(s) for Parallel Rotation.`);

    // Load cache
    let cache = {};
    if (fs.existsSync(CACHE_FILE)) {
        try {
            cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
            console.log(`Loaded ${Object.keys(cache).length} existing audio transcripts from cache.`);
        } catch (e) {
            console.warn('Could not read cache:', e.message);
        }
    }

    const audioFiles = fs.readdirSync(AUDIO_DIR)
        .filter(f => f.endsWith('.mpeg') || f.endsWith('.mp3') || f.endsWith('.wav'))
        .sort();

    console.log(`Found ${audioFiles.length} total audio files in folder.`);

    const pendingFiles = audioFiles.filter(f => !cache[f] || !cache[f].verbatim_transcript_tamil);
    console.log(`Pending for transcription: ${pendingFiles.length} audio file(s).`);

    let keyIndex = 0;
    let completedCount = audioFiles.length - pendingFiles.length;

    async function processQueue() {
        while (pendingFiles.length > 0) {
            const file = pendingFiles.shift();
            const filePath = path.join(AUDIO_DIR, file);
            const currentKey = apiKeys[keyIndex % apiKeys.length];
            keyIndex++;

            console.log(`\n[Processing ${completedCount + 1}/${audioFiles.length}] Uploading & Transcribing: ${file}...`);
            const t0 = Date.now();

            try {
                // 1. Upload to Gemini
                const uploadedFile = await uploadAudioFileToGemini(filePath, 'audio/mpeg', currentKey);
                console.log(`  -> Uploaded (${uploadedFile.name}). Processing with Gemini Flash...`);

                // 2. Transcribe & Summarize
                const result = await transcribeAndSummarizeWithGemini(uploadedFile.uri, file, currentKey);
                const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

                cache[file] = {
                    file_name: file,
                    size_bytes: fs.statSync(filePath).size,
                    duration_seconds: uploadedFile.videoMetadata?.videoDuration || 0,
                    processed_at: new Date().toISOString(),
                    ...result
                };

                // Save cache after each file
                fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
                completedCount++;
                console.log(`  -> ✅ Done in ${elapsed}s: "${result.title_tamil || file}" [${result.topic_classification || ''}]`);

            } catch (err) {
                console.error(`  -> ❌ Error processing ${file}: ${err.message}`);
                console.warn(`  [Retrying in 5s with next key...]`);
                pendingFiles.push(file);
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }

    // Launch parallel workers
    const workers = [];
    const actualConcurrency = Math.min(concurrency, pendingFiles.length || 1);
    for (let w = 0; w < actualConcurrency; w++) {
        workers.push(processQueue());
    }

    await Promise.all(workers);

    // Generate Master Markdown
    console.log('\nGenerating Master Transcript Markdown Document...');
    const mdLines = [
        '# நம்ம சாமி நம்ம கோவில் - 19 ஆடியோ விளக்க உரைகள் & ஆவணத் தொகுப்பு\n',
        `*மொத்த பதிவுகள்: ${audioFiles.length} | தேதி: ${new Date().toLocaleDateString('ta-IN')}*\n`,
        '---\n'
    ];

    Object.keys(cache).sort().forEach((fileName, idx) => {
        const item = cache[fileName];
        mdLines.push(`## பகுதி ${idx + 1}: ${item.title_tamil || fileName}`);
        mdLines.push(`- **கோப்புப் பெயர்**: \`${fileName}\``);
        mdLines.push(`- **தலைப்புப் பிரிவு**: **${item.topic_classification || 'பொது'}**`);
        mdLines.push(`- **அளவு**: ${(item.size_bytes / (1024 * 1024)).toFixed(2)} MB\n`);

        if (item.key_takeaways_tamil && item.key_takeaways_tamil.length > 0) {
            mdLines.push('### முக்கியக் கருத்துக்கள் (Key Highlights):');
            item.key_takeaways_tamil.forEach(pt => mdLines.push(`- ${pt}`));
            mdLines.push('');
        }

        if (item.spiritual_stories_and_references && item.spiritual_stories_and_references.length > 0) {
            mdLines.push('### ஆன்மீகக் கதைகள் & மேற்கோள்கள் (Stories & References):');
            item.spiritual_stories_and_references.forEach(st => mdLines.push(`- ${st}`));
            mdLines.push('');
        }

        mdLines.push('### முழு உரை வடிவம் (Verbatim Transcript):');
        mdLines.push(`> ${item.verbatim_transcript_tamil ? item.verbatim_transcript_tamil.replace(/\n/g, '\n> ') : 'உரை பதிவு செய்யப்படவில்லை.'}\n`);
        mdLines.push('---\n');
    });

    fs.writeFileSync(MASTER_MD, mdLines.join('\n'), 'utf8');
    console.log(`\n🎉 All Done! Master Transcript saved to:\n  -> ${MASTER_MD}\n  -> ${CACHE_FILE}`);
}

main().catch(console.error);
