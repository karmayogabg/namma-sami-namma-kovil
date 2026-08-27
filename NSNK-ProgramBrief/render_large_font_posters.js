const { Canvas, FontLibrary } = require('skia-canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = __dirname;

// Register Tamil Font
FontLibrary.use('Noto Sans Tamil', [
    path.join(__dirname, '..', 'fonts', 'NotoSansTamil-Regular.ttf'),
    path.join(__dirname, '..', 'fonts', 'NotoSansTamil-Bold.ttf')
]);

// Utility: Draw rounded rectangle
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + x + radius < x + width ? x + radius : x, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

// Utility: Wrap text cleanly with large line-height
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const lines = text.split('\n');
    let currentY = y;

    for (const rawLine of lines) {
        const words = rawLine.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line.trim(), x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x, currentY);
        currentY += lineHeight;
    }
    return currentY;
}

// =========================================================================
// 1. TOPIC 1: நம்ம (NAMMA) - 2 LARGE HIGH-RES PAGES
// =========================================================================

// Page 1A: மொழி, வணக்கம், உடை, வானவியல்
async function generatePoster1A() {
    console.log('Generating 1A_நம்ம_பாகம்_1.png...');
    const width = 1600;
    const height = 2200;
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a0e17');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#05070a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 3;
    roundRect(ctx, 30, 30, width - 60, height - 60, 24, false, true);

    // Header Banner
    const headGrad = ctx.createLinearGradient(60, 60, width - 60, 240);
    headGrad.addColorStop(0, '#78350f');
    headGrad.addColorStop(0.5, '#d97706');
    headGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = headGrad;
    roundRect(ctx, 60, 60, 1480, 180, 16, true, false);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    roundRect(ctx, 75, 75, 1450, 150, 12, true, false);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px "Noto Sans Tamil"';
    ctx.fillText('தலைப்பு 1: நம்ம (பாகம் 1)', 800, 135);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 26px "Noto Sans Tamil"';
    ctx.fillText('தாய்மொழி சிந்தனை • வணக்கம் வேத மரபு • பாரத உடை • தமிழ் வானவியல்', 800, 185);

    ctx.textAlign = 'left';

    function drawLargeCard(x, y, w, h, title, points, accent = '#f59e0b') {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.88)';
        roundRect(ctx, x, y, w, h, 16, true, false);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, x, y, w, h, 16, false, true);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        roundRect(ctx, x, y, w, 65, 16, true, false);

        ctx.fillStyle = accent;
        ctx.fillRect(x + 16, y, w - 32, 5);

        ctx.fillStyle = accent;
        ctx.font = 'bold 30px "Noto Sans Tamil"';
        ctx.fillText(title, x + 25, y + 44);

        let curY = y + 105;
        for (const pt of points) {
            if (pt.head) {
                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 25px "Noto Sans Tamil"';
                curY = drawWrappedText(ctx, pt.head, x + 25, curY, w - 50, 36);
                curY += 4;
            }
            if (pt.body) {
                ctx.fillStyle = '#cbd5e1';
                ctx.font = '23px "Noto Sans Tamil"';
                curY = drawWrappedText(ctx, pt.body, x + 40, curY, w - 65, 36);
                curY += 16;
            }
        }
    }

    // Card 1.1: Language
    drawLargeCard(60, 270, 1480, 420, '1.1 நமது மொழி & சிந்தனைப் பகிர்வு', [
        {
            head: '• மொழியின் தோற்றமும் சிந்தனைப் பகிர்வும் (Audio 1, 18):',
            body: 'கூடி வாழும் மக்களிடையே எண்ணங்களையும் கருத்துக்களையும் தத்துவங்களையும் பரிமாறிக் கொள்ளவே மொழி உருவாகிறது.'
        },
        {
            head: '• தாய்மொழியின் தனித்துவ மகத்துவம் & சமுதாய வலிமை:',
            body: 'மக்களின் உள்ளார்ந்த சிந்தனைகளும், தத்துவங்களும், ஆழமான உணர்வுகளும் தாய்மொழியில் மட்டுமே முழுமையாக வெளிப்பட முடியும். தாய்மொழியைப் பயன்படுத்துவது நமது சிந்தனையைத் தெளிவாக்கி சமுதாயத்தை வலிமைப்படுத்துகிறது.'
        }
    ]);

    // Card 1.2: Vanakkam
    drawLargeCard(60, 720, 1480, 420, '1.2 வணக்கம் சொல்லும் வேத மரபு', [
        {
            head: '• கொரோனா கால உலகளாவிய ஏற்பு (Audio 2, 18):',
            body: 'தொற்று பேரிடர் காலத்தில் கைகுலுக்குவதைத் தவிர்த்து, உலக நாடுகள் அனைத்தும் நமது பாரம்பரிய \'வணக்கம்\' முறையைப் பின்பற்றின.'
        },
        {
            head: '• "இருப்பதெல்லாம் இறைவனே" — "ஈசா வாஸ்யம் இதம் சர்வம்":',
            body: 'எதிரில் உள்ள சக மனிதரிடம் உறையும் பரம்பொருளைத் தலைவணங்கி ஏற்கும் உயர்ந்த சமத்துவ நெறி. இரு கரங்களையும் குவித்து மார்பருகே வைப்பது இதயப்பூர்வமான ஆன்மீக உணர்வை ஊட்டுகிறது.'
        }
    ]);

    // Card 1.3: Attire
    drawLargeCard(60, 1170, 1480, 440, '1.3 பாரதப் பாரம்பரிய உடை (வேட்டி & சேலை)', [
        {
            head: '• உலகின் முதல் ஆடை நாகரிகம் (Audio 3):',
            body: 'உலகில் முதன்முதலில் நூல் நூற்று, நெய்து, ஆடை உடுத்திய பெருமை நமது பாரதப் பண்பாட்டிற்கே உரியது.'
        },
        {
            head: '• கம்பீரமான வேட்டியும் சேலையும் & தட்பவெப்ப நிலை:',
            body: 'பல்லாயிரக்கணக்கான ஆண்டுகளாக நாம் பின்பற்றி வரும் ஆடை. நமது தட்பவெப்ப நிலைக்கு ஏற்ற வேட்டி உடைக் கலாச்சாரத்தைப் போற்றிப் பேணி பெருமிதத்துடன் உடுத்த வேண்டும். உலகளவில் சேலை மிக கண்ணியமான உடையாகப் போற்றப்படுகிறது.'
        }
    ]);

    // Card 1.4: Astronomy
    drawLargeCard(60, 1640, 1480, 440, '1.4 விழாக்களும் தமிழ் வானவியலும்', [
        {
            head: '• வானியல் & புவியியல் அறிவியல் (Audio 4, 15):',
            body: 'நமது திருவிழாக்களும் பண்டிகைகளும் வானவியலோடும் (Astronomy) புவியியலோடும் (Geography) இணைந்து அறிவியல் பூர்வமாகக் கணிக்கப்பட்டவை.'
        },
        {
            head: '• பிறந்தநாள் கணக்கீட்டு மரபு & தமிழ் நாட்காட்டி:',
            body: 'பூமி சூரியனைச் சுற்றி வரும் பாதையில், நாம் பிறந்த அதே புள்ளியில் மீண்டும் பூமி வரும் நாளைக் கணிப்பதே நமது பிறந்தநாள் மரபு. சூரியன்-சந்திரன் இயக்கங்களை இணைத்த தமிழ் நாட்காட்டி உலகிற்கே வழிகாட்டும் அறிவியல் அற்புதம்.'
        }
    ]);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Noto Sans Tamil"';
    ctx.fillText('நம்ம சாமி நம்ம கோவில் • தலைப்பு 1: நம்ம (பாகம் 1 - பெரிய எழுத்து வடிவம்)', 800, 2140);

    const buf = await canvas.toBuffer('png');
    const outPath = path.join(OUTPUT_DIR, '1A_நம்ம_பாகம்_1.png');
    fs.writeFileSync(outPath, buf);
    console.log(`Saved: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

// Page 1B: குடும்பம், உறவுமுறை, பஞ்சாங்கம், தியாகம்
async function generatePoster1B() {
    console.log('Generating 1B_நம்ம_பாகம்_2.png...');
    const width = 1600;
    const height = 2250;
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a0e17');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#05070a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 3;
    roundRect(ctx, 30, 30, width - 60, height - 60, 24, false, true);

    // Header Banner
    const headGrad = ctx.createLinearGradient(60, 60, width - 60, 240);
    headGrad.addColorStop(0, '#78350f');
    headGrad.addColorStop(0.5, '#d97706');
    headGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = headGrad;
    roundRect(ctx, 60, 60, 1480, 180, 16, true, false);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    roundRect(ctx, 75, 75, 1450, 150, 12, true, false);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px "Noto Sans Tamil"';
    ctx.fillText('தலைப்பு 1: நம்ம (பாகம் 2)', 800, 135);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 26px "Noto Sans Tamil"';
    ctx.fillText('குடும்ப அமைப்பும் 6 கர்மங்களும் • மரபணு அறிவியல் • பஞ்சாங்கம் • தியாகம்', 800, 185);

    ctx.textAlign = 'left';

    function drawLargeCard(x, y, w, h, title, points, accent = '#f59e0b') {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.88)';
        roundRect(ctx, x, y, w, h, 16, true, false);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, x, y, w, h, 16, false, true);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        roundRect(ctx, x, y, w, 65, 16, true, false);

        ctx.fillStyle = accent;
        ctx.fillRect(x + 16, y, w - 32, 5);

        ctx.fillStyle = accent;
        ctx.font = 'bold 30px "Noto Sans Tamil"';
        ctx.fillText(title, x + 25, y + 44);

        let curY = y + 105;
        for (const pt of points) {
            if (pt.head) {
                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 25px "Noto Sans Tamil"';
                curY = drawWrappedText(ctx, pt.head, x + 25, curY, w - 50, 36);
                curY += 4;
            }
            if (pt.body) {
                ctx.fillStyle = '#cbd5e1';
                ctx.font = '23px "Noto Sans Tamil"';
                curY = drawWrappedText(ctx, pt.body, x + 40, curY, w - 65, 36);
                curY += 16;
            }
        }
    }

    // Card 1.5: Family & 6 Karmas
    drawLargeCard(60, 270, 1480, 470, '1.5 குடும்ப அமைப்பும் 6 தர்ம கர்மங்களும்', [
        {
            head: '• கூட்டுக்குடும்பத்தின் வலிமை (Audio 5, 14):',
            body: 'பாரதக் குடும்ப அமைப்பு என்பது உலகிற்கே வழிகாட்டும் பாதுகாப்புத் தூண்.'
        },
        {
            head: '• 6 நித்திய தர்ம கர்மங்கள்:',
            body: '1. தேவ யக்ஞம் (இறை வழிபாடு & ஆலயப் பணி)\n2. பித்ரு யக்ஞம் (முன்னோர்கள் வழிபாடு & தர்மம்)\n3. மனுஷ்ய யக்ஞம் (விருந்தோம்பல் & மனித நேய உதவி)\n4. பூத யக்ஞம் (விலங்குகள், பறவைகள், தாவரங்களுக்கு உணவளித்தல்)\n5. பிரம்ம யக்ஞம் (வேத, தமிழ் நூல்கள் கற்றல் & கற்பித்தல்)\n6. சமுதாய தர்மம் (ஊர் நலம் & அறப்பணிகள்)'
        }
    ]);

    // Card 1.6: Relationships Science
    drawLargeCard(60, 770, 1480, 430, '1.6 தமிழர் உறவுமுறைகளின் அறிவியல்', [
        {
            head: '• மரபணுப் பாதுகாப்பு (Genetic Safeguarding - Audio 6):',
            body: 'தாய்மாமன், அத்தை, பெரியப்பா, சித்தப்பா போன்ற உறவுமுறைகள் வெறும் பெயர்கள் அல்ல; அவை மரபணுக் குறைபாடுகளைத் தவிர்க்கும் உன்னத கட்டமைப்பு.'
        },
        {
            head: '• உளவியல் அரணும் சமூகப் பிணைப்பும்:',
            body: 'குழந்தைகள் வளர்ப்பில் தாய்மாமனின் பாசமும் வழிகாட்டலும் குடும்பத்திற்கு மாபெரும் உளவியல் அரணாகத் திகழ்கிறது. துன்பக் காலங்களில் கை கொடுக்கும் குடும்பப் பிணைப்பு மன அழுத்தத்தைத் தடுக்கிறது.'
        }
    ]);

    // Card 1.7: Panchangam
    drawLargeCard(60, 1230, 1480, 440, '1.7 பாரம்பரிய பஞ்சாங்கம் & காலக்கணக்கீடு', [
        {
            head: '• பஞ்சாங்கம் (5 அங்கங்கள் - Audio 7, 15):',
            body: '1. திதி (சந்திரனின் கோண நிலை) • 2. வாரம் (7 கிழமைகள் - கோள்களின் சுழற்சி)\n3. நட்சத்திரம் (27 விண்மீன் மண்டலங்கள்) • 4. யோகம் (சூரிய-சந்திர கூட்டு இயக்கம்)\n5. கரணம் (திதியின் அரைப் பங்கு)'
        },
        {
            head: '• அதிநவீன வானியல் காலக்கணக்கீடு:',
            body: 'விவசாயம், பண்டிகைகள், மங்கள நிகழ்வுகளை இயற்கை மாற்றங்களோடு இணைத்துச் செயல்படுத்தும் ஒப்பற்ற காலக் கண்ணாடி.'
        }
    ]);

    // Card 1.8: Hospitality & Sacrifice
    drawLargeCard(60, 1700, 1480, 440, '1.8 உபசார மொழியின் உன்னதம் & தியாகம்', [
        {
            head: '• இன்சொல் வரவேற்பு & உபநிடத தியாக வாசகம் (Audio 18):',
            body: 'இல்லத்திற்கு வருபவர்களை இன்முகத்தோடு "வாங்க" என அழைத்து உபசரிப்பது தமிழரின் தலையாய பண்பாடு.\n"ந கர்மணா ந ப்ரஜயா தனேன த்யாகேனைகே அம்ருதத்வ மானஸுஹ்" — தியாகத்தினால் மட்டுமே அமரத்துவம் கிட்டும்.'
        },
        {
            head: '• சுயநலமற்ற தியாக உணர்வு & திருக்குறள்:',
            body: '"யாதனின் யாதனின் நீங்கியான் நோதல் அதனின் அதனின் இலன்" — பற்றுகளைத் துறந்து பிறருக்கு உதவும் தியாக மனப்பான்மையே சமுதாயத்தை ஆன்மீக உன்னத நிலைக்கு உயர்த்துகிறது.'
        }
    ]);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Noto Sans Tamil"';
    ctx.fillText('நம்ம சாமி நம்ம கோவில் • தலைப்பு 1: நம்ம (பாகம் 2 - பெரிய எழுத்து வடிவம்)', 800, 2190);

    const buf = await canvas.toBuffer('png');
    const outPath = path.join(OUTPUT_DIR, '1B_நம்ம_பாகம்_2.png');
    fs.writeFileSync(outPath, buf);
    console.log(`Saved: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

// =========================================================================
// 2. TOPIC 2: நம்ம சாமி (NAMMA SAMI) - 2 LARGE HIGH-RES PAGES
// =========================================================================

// Page 2A: சாமி சொல்லிலக்கணம், கரதர்சனம், ராமகிருஷ்ணர் உவமை, யானை கதை
async function generatePoster2A() {
    console.log('Generating 2A_நம்ம_சாமி_பாகம்_1.png...');
    const width = 1600;
    const height = 2300;
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(0.5, '#31102e');
    bgGrad.addColorStop(1, '#0a0e17');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 3;
    roundRect(ctx, 30, 30, width - 60, height - 60, 24, false, true);

    // Header Banner
    const headGrad = ctx.createLinearGradient(60, 60, width - 60, 240);
    headGrad.addColorStop(0, '#881337');
    headGrad.addColorStop(0.5, '#be123c');
    headGrad.addColorStop(1, '#e11d48');
    ctx.fillStyle = headGrad;
    roundRect(ctx, 60, 60, 1480, 180, 16, true, false);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    roundRect(ctx, 75, 75, 1450, 150, 12, true, false);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px "Noto Sans Tamil"';
    ctx.fillText('தலைப்பு 2: நம்ம சாமி (பாகம் 1)', 800, 135);

    ctx.fillStyle = '#ffe4e6';
    ctx.font = 'bold 26px "Noto Sans Tamil"';
    ctx.fillText('சாமி என்றால் யார்? • கரதர்சனம் ஸ்லோகம் • ஆன்மீக உவமைகள் & கதைகள்', 800, 185);

    ctx.textAlign = 'left';

    // 2.1 What is Sami
    ctx.fillStyle = 'rgba(30, 41, 59, 0.88)';
    roundRect(ctx, 60, 270, 1480, 380, 16, true, false);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 60, 270, 1480, 380, 16, false, true);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    roundRect(ctx, 60, 270, 1480, 65, 16, true, false);
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(76, 270, 1448, 5);

    ctx.fillStyle = '#fda4af';
    ctx.font = 'bold 30px "Noto Sans Tamil"';
    ctx.fillText('2.1 சாமி என்றால் என்ன? எங்கே இருக்கிறார்? (Audio 8, 19)', 85, 314);

    let curY21 = 370;
    // Item 1
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 24px "Noto Sans Tamil"';
    ctx.fillText('• சாமி என்றால் என்ன? — "உடையவர்"', 85, curY21);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '22px "Noto Sans Tamil"';
    curY21 = drawWrappedText(ctx, 'அனைத்து பிரபஞ்சத்தையும் உயிர்களையும் தனக்கு உடைமையாகக் கொண்டு காப்பவர், தலைவன்.', 115, curY21 + 34, 1380, 32);

    // Item 2
    curY21 += 14;
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 24px "Noto Sans Tamil"';
    ctx.fillText('• சாமி மொத்தம் எத்தனை? — ஒன்றே பல திருநாமங்கள்', 85, curY21);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '22px "Noto Sans Tamil"';
    curY21 = drawWrappedText(ctx, 'ஒரே பரம்பொருள் பல வடிவங்களாகவும், உருவங்களாகவும், திருநாமங்களாகவும் போற்றப்படுகிறார்.', 115, curY21 + 34, 1380, 32);

    // Item 3
    curY21 += 14;
    ctx.fillStyle = '#5eead4';
    ctx.font = 'bold 24px "Noto Sans Tamil"';
    ctx.fillText('• சாமி எங்கே இருக்கிறார்? — "ஈசா வாஸ்யம் இதம் சர்வம்"', 85, curY21);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '22px "Noto Sans Tamil"';
    drawWrappedText(ctx, 'அங்கிங்கெனாதபடி எங்கும் பிரகாசமாய் ஆனந்த பூர்த்தியாகி விளங்கும் பரம்பொருள்.', 115, curY21 + 34, 1380, 32);

    // 2.2 Karadharshanam Shloka
    ctx.fillStyle = 'rgba(30, 41, 59, 0.88)';
    roundRect(ctx, 60, 680, 1480, 410, 16, true, false);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 60, 680, 1480, 410, 16, false, true);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    roundRect(ctx, 60, 680, 1480, 65, 16, true, false);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(76, 680, 1448, 5);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 30px "Noto Sans Tamil"';
    ctx.fillText('2.2 கரதர்சனம் ஸ்லோகம் — தெய்வீகம் நம்மிலும் உள்ளது! (Audio 9, 19)', 85, 724);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    roundRect(ctx, 85, 765, 1430, 80, 10, true, false);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 28px "Noto Sans Tamil"';
    ctx.fillText('"கராக்ரே வசதே லக்ஷ்மீ: கரமத்யே ஸரஸ்வதீ | கரமூலே ஸ்திதே கௌரீ ப்ரபாதே கரதர்சனம் ||"', 800, 815);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px "Noto Sans Tamil"';
    ctx.fillText('• ஸ்லோகப் பொருள் விளக்கம்:', 85, 885);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '22px "Noto Sans Tamil"';
    ctx.fillText('விரல் நுனியில் லட்சுமி (தொழில்/செல்வம்) • உள்ளங்கையின் நடுவில் சரஸ்வதி (கல்வி/ஞானம்) • மணிக்கட்டில் கௌரி (ஆற்றல்/சக்தி).', 115, 925);
    ctx.fillText('காலையில் கண் விழித்தவுடன் நமது உள்ளங்கையைப் பார்ப்பதன் மூலம், அனைத்து தெய்வீக ஆற்றல்களும் நமது சுய உழைப்பிலும்', 115, 970);
    ctx.fillText('கரங்களிலும் குடி கொண்டுள்ளன என்பதை உணர்ந்து மகத்தான தன்னம்பிக்கையுடன் செயல்பட வேண்டும்.', 115, 1010);

    // 2.3 Stories
    function drawLargeStoryCard(x, y, w, h, title, p1, p2, p3) {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.88)';
        roundRect(ctx, x, y, w, h, 16, true, false);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, x, y, w, h, 16, false, true);

        ctx.fillStyle = '#e11d48';
        ctx.fillRect(x + 16, y, w - 32, 5);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        roundRect(ctx, x, y, w, 65, 16, true, false);

        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 27px "Noto Sans Tamil"';
        ctx.fillText(title, x + 25, y + 44);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 24px "Noto Sans Tamil"';
        ctx.fillText(p1.h, x + 25, y + 105);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '22px "Noto Sans Tamil"';
        drawWrappedText(ctx, p1.b, x + 40, y + 140, w - 65, 34);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 24px "Noto Sans Tamil"';
        ctx.fillText(p2.h, x + 25, y + 270);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '22px "Noto Sans Tamil"';
        drawWrappedText(ctx, p2.b, x + 40, y + 305, w - 65, 34);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 24px "Noto Sans Tamil"';
        ctx.fillText(p3.h, x + 25, y + 435);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '22px "Noto Sans Tamil"';
        drawWrappedText(ctx, p3.b, x + 40, y + 470, w - 65, 34);
    }

    drawLargeStoryCard(60, 1120, 725, 600, 'ஸ்ரீ ராமகிருஷ்ணர் உவமை (Audio 8, 19)',
        { h: '• உருவமும் அருவமும்:', b: 'இறைவன் அனைத்திலும் நீக்கமற உறைகிறார் என்பதை ஸ்ரீ ராமகிருஷ்ண பரமஹம்சர் எளிய உவமையால் விளக்கினார்.' },
        { h: '• நீர் மற்றும் பனிக்கட்டி தத்துவம்:', b: 'நீர் எப்படி திரவமாகவும், உறைந்த பனிக்கட்டியாகவும் உள்ளதோ, அதுபோல இறைவன் அருவமாகவும் உருவமாகவும் விளங்குகிறார்.' },
        { h: '• மெய்யான பக்தி:', b: 'உலக உயிர்கள் அனைத்திலும் அந்த பரம்பொருளின் இருப்பைக் காண்பதே மெய்யான பக்தி நெறியாகும்.' }
    );

    drawLargeStoryCard(815, 1120, 725, 600, 'குரு-சிஷ்யர்-யானை கதை (பக்தியுடன் விவேகம்)',
        { h: '• மதம் பிடித்த யானை நிகழ்வு:', b: '"எல்லாம் நாராயணன்" என்ற உபதேசத்தைக் கேட்டு, ஓடிவந்த யானையைக் கண்டு விலகாத சிஷ்யனை யானை தூக்கி வீசியது.' },
        { h: '• குருவின் விளக்கம்:', b: '"யானையில் நாராயணன் இருப்பது உண்மையே; ஆனால் யானை மேல் அமர்ந்து \'விலகிப் போ!\' என்று எச்சரித்த பாகனிலும் நாராயணனே பேசினான்!"' },
        { h: '• வாழ்க்கைப் பாடம்:', b: 'பக்தி என்பது மூடநம்பிக்கை அல்ல; விவேகத்துடனும் பகுத்தறிவுடனும் செயல்படுவதே மெய்ஞ்ஞானம் ஆகும்.' }
    );

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Noto Sans Tamil"';
    ctx.fillText('நம்ம சாமி நம்ம கோவில் • தலைப்பு 2: நம்ம சாமி (பாகம் 1 - பெரிய எழுத்து வடிவம்)', 800, 2240);

    const buf = await canvas.toBuffer('png');
    const outPath = path.join(OUTPUT_DIR, '2A_நம்ம_சாமி_பாகம்_1.png');
    fs.writeFileSync(outPath, buf);
    console.log(`Saved: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

// Page 2B: 3 நிலைகள், கம்பராமாயணம், கருணைக்கதைகள்
async function generatePoster2B() {
    console.log('Generating 2B_நம்ம_சாமி_பாகம்_2.png...');
    const width = 1600;
    const height = 2450;
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(0.5, '#31102e');
    bgGrad.addColorStop(1, '#0a0e17');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 3;
    roundRect(ctx, 30, 30, width - 60, height - 60, 24, false, true);

    // Header Banner
    const headGrad = ctx.createLinearGradient(60, 60, width - 60, 240);
    headGrad.addColorStop(0, '#881337');
    headGrad.addColorStop(0.5, '#be123c');
    headGrad.addColorStop(1, '#e11d48');
    ctx.fillStyle = headGrad;
    roundRect(ctx, 60, 60, 1480, 180, 16, true, false);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    roundRect(ctx, 75, 75, 1450, 150, 12, true, false);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px "Noto Sans Tamil"';
    ctx.fillText('தலைப்பு 2: நம்ம சாமி (பாகம் 2)', 800, 135);

    ctx.fillStyle = '#ffe4e6';
    ctx.font = 'bold 26px "Noto Sans Tamil"';
    ctx.fillText('3 வழிபாட்டு நிலைகள் • கம்பராமாயணம் • கருணாமூர்த்தி இறைவனின் திருவிளையாடல்கள்', 800, 185);

    ctx.textAlign = 'left';

    // 2.4 Three Tiers of Sami
    ctx.fillStyle = 'rgba(30, 41, 59, 0.88)';
    roundRect(ctx, 60, 270, 1480, 890, 16, true, false);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 60, 270, 1480, 890, 16, false, true);

    ctx.fillStyle = '#e11d48';
    ctx.fillRect(76, 270, 1448, 5);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    roundRect(ctx, 60, 270, 1480, 65, 16, true, false);

    ctx.fillStyle = '#fda4af';
    ctx.font = 'bold 30px "Noto Sans Tamil"';
    ctx.fillText('2.4 சாமியின் மூன்று நிலைகள் (Three Tiers of Deities - Audio 10, 16, 17)', 85, 314);

    function drawLargeTierBox(x, y, w, h, title, col, pts, verse) {
        ctx.fillStyle = '#1e1b4b';
        roundRect(ctx, x, y, w, h, 12, true, false);
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        roundRect(ctx, x, y, w, h, 12, false, true);

        ctx.fillStyle = col;
        roundRect(ctx, x, y, w, 52, 12, true, false);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px "Noto Sans Tamil"';
        ctx.textAlign = 'center';
        ctx.fillText(title, x + w / 2, y + 36);
        ctx.textAlign = 'left';

        let curY = y + 85;
        for (const p of pts) {
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 22px "Noto Sans Tamil"';
            ctx.fillText(p.h, x + 20, curY);
            curY += 32;

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '20px "Noto Sans Tamil"';
            curY = drawWrappedText(ctx, p.b, x + 30, curY, w - 50, 30);
            curY += 12;
        }

        if (verse) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            roundRect(ctx, x + 16, curY, w - 32, 160, 8, true, false);
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 17px "Noto Sans Tamil"';
            ctx.textAlign = 'center';
            ctx.fillText(verse.t1, x + w / 2, curY + 45);
            ctx.fillText(verse.t2, x + w / 2, curY + 80);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '16px "Noto Sans Tamil"';
            ctx.fillText(verse.auth, x + w / 2, curY + 125);
            ctx.textAlign = 'left';
        }
    }

    drawLargeTierBox(85, 360, 455, 770, 'நிலை 1: குலதெய்வம்', '#f59e0b', [
        { h: '• குலம் என்றால் என்ன?:', b: 'ஒரே முன்னோர்களை அடிப்படையாகக் கொண்டு, இரத்த உறவு மற்றும் வம்சாவழி பாரம்பரியத்தால் இணைக்கப்பட்ட பெருங்குடும்பம்.' },
        { h: '• குலத்தைக் காப்பவர்:', b: 'இந்த குலத்தைக் காப்பவரே குலசாமி. குலதெய்வ வழிபாடு ஒருபோதும் விடுபடக் கூடாது.' },
        { h: '• குடும்ப ஒற்றுமை:', b: 'ஆண்டுக்கொரு முறையாவது சென்று வணங்குவது வம்சவிருத்தியைத் தரும்.' }
    ], {
        t1: '"குலம் தரும் செல்வம் தந்திடும் அடியார்',
        t2: 'படுதுயர் ஆயின எல்லாம் நிலந்தரம் செய்யும்..."',
        auth: '— திருமங்கையாழ்வார்'
    });

    drawLargeTierBox(570, 360, 455, 770, 'நிலை 2: கிராம சாமி', '#38bdf8', [
        { h: '• சமுதாய ஒருமைப்பாடு:', b: 'ஊர் மக்கள் அனைவரையும் பேதமின்றி ஒன்றிணைக்கும் பெருஞ்சக்தியாக கிராமக் கோவில் விளங்குகிறது.' },
        { h: '• எல்லை காவல் தெய்வங்கள்:', b: 'அய்யனார், மாரியம்மன், காளியம்மன் போன்ற தெய்வங்கள் ஊரின் காவல் அரண்.' },
        { h: '• ஊர் செழிப்பு & நலம்:', b: 'விவசாய வளம், நோய் நொடிகள் நீங்குதல் மற்றும் சமூக நல்லிணக்கத்திற்கு திருவிழாக்களே மையம்.' }
    ]);

    drawLargeTierBox(1055, 360, 455, 770, 'நிலை 3: இஷ்டதெய்வம்', '#ec4899', [
        { h: '• தனிமனித மேம்பாடு:', b: 'தனிமனித மன அமைதியையும் ஆன்மீக மேம்பாட்டையும் உறுதி செய்வது இஷ்டதெய்வம்.' },
        { h: '• பூரண ஆன்மீகச் சுதந்திரம்:', b: 'தனக்குப் பிடித்த இறைவனைத் தேர்ந்தெடுத்து வழிபடும் உரிமை நமது தர்மத்தின் உன்னதம்.' },
        { h: '• நண்பனைப் போன்ற பக்தி:', b: 'சிவன், முருகன், பெருமாள் என உள்ளம் உருகி நினைக்கும் தெய்வம் நண்பனைப் போல் அரவணைக்கும்.' }
    ]);

    // 2.5 Kamban Verse Box
    ctx.fillStyle = 'rgba(30, 41, 59, 0.88)';
    roundRect(ctx, 60, 1190, 1480, 470, 16, true, false);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 60, 1190, 1480, 470, 16, false, true);

    ctx.fillStyle = '#e11d48';
    ctx.fillRect(76, 1190, 1448, 5);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    roundRect(ctx, 60, 1190, 1480, 65, 16, true, false);

    ctx.fillStyle = '#fda4af';
    ctx.font = 'bold 30px "Noto Sans Tamil"';
    ctx.fillText('2.5 கம்பராமாயணம் — இரணியன் வதைப்படலம் (எங்கும் நிறைந்த இறைவன் - Audio 8, 17, 19)', 85, 1234);

    // Left Verse Box (Width 680px)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    roundRect(ctx, 85, 1275, 680, 360, 10, true, false);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 22px "Noto Sans Tamil"';
    ctx.fillText('"சாணினும் உளன்; ஓர் தன்மை அணுவினைச்', 105, 1330);
    ctx.fillText('சத கூறிட்ட கோணினும் உளன்; மா மேருக்', 105, 1375);
    ctx.fillText('குன்றினும் உளன்; இந் நின்ற தூணினும் உளன்;', 105, 1420);
    ctx.fillText('நீ சொன்ன சொல்லினும் உளன்; இத் தன்மை', 105, 1465);
    ctx.fillText('காணுதி விரைவின்” என்றான்;', 105, 1510);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '19px "Noto Sans Tamil"';
    ctx.fillText('— கவிச்சக்கரவர்த்தி கம்பர் (கம்பராமாயணம்)', 105, 1585);

    // Right Meaning Box (Starts at x = 790px)
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 24px "Noto Sans Tamil"';
    ctx.fillText('• பாடல் பொருள் விளக்கம்:', 800, 1310);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '21px "Noto Sans Tamil"';
    let kY = 1355;
    kY = drawWrappedText(ctx, 'பிரஹலாதன் இரணியனிடம் சர்வ வியாபகத்தை முழங்குகிறான்:', 800, kY, 710, 32);
    kY += 8;
    kY = drawWrappedText(ctx, '1. சாண் அளவிலும் இறைவன் இருப்பான்\n2. அணுவை 100 கூறாக்கிய நுண்மையிலும் இருப்பான்\n3. மாமேரு மலையிலும் இருப்பான், எதிரில் உள்ள தூணிலும் இருப்பான்\n4. நீ பேசிய சொல்லிலும் இருப்பான் என்று இறைவனின் இருப்பை நிலைநாட்டுகிறான்.', 820, kY, 690, 34);

    // 2.6 Divine Grace Stories
    ctx.fillStyle = 'rgba(30, 41, 59, 0.88)';
    roundRect(ctx, 60, 1690, 1480, 560, 16, true, false);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 60, 1690, 1480, 560, 16, false, true);

    ctx.fillStyle = '#d97706';
    ctx.fillRect(76, 1690, 1448, 5);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    roundRect(ctx, 60, 1690, 1480, 65, 16, true, false);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 30px "Noto Sans Tamil"';
    ctx.fillText('2.6 எளியோர்க்கு எளிய கருணாமூர்த்தி இறைவனின் திருவிளையாடல்கள் (Audio 17, 19)', 85, 1734);

    const graceCardsLarge = [
        {
            t: 'தாயுமானவர் வரலாறு (திருச்சி):',
            b: 'கர்ப்பிணிப் பெண் ரத்தினாவதிக்கு தாயின் வடிவில் வந்து பிரசவம் பார்த்து கருணை பொழிந்த சிவபெருமான்.'
        },
        {
            t: 'வந்தி பாட்டி வரலாறு (மதுரை):',
            b: 'கூலியாகப் பிட்டு உண்டு வைகை அணை கட்ட மண் சுமந்து பிரம்படி பட்ட எளியோரின் பரம்பொருள்.'
        },
        {
            t: 'அபிராமி பட்டர் பக்தி (திருக்கடையூர்):',
            b: 'பக்தனின் வாக்கு தவறாமல் இருக்க தை அமாவாசையை பௌர்ணமி முழுநிலவாக்கிய அம்பிகையின் திருவருள்.'
        },
        {
            t: 'அவ்வையார் & ஆழ்வார்கள் பாசுரங்கள்:',
            b: '"அணுவிற்கணுவாய் அப்பாலுக்கு அப்பாலாய்" (அகவல்) • "பச்சை மாமலை போல் மேனி" (தொண்டரடிப்பொடி ஆழ்வார்).'
        }
    ];

    let gX = 85;
    for (const gc of graceCardsLarge) {
        ctx.fillStyle = '#1e1b4b';
        roundRect(ctx, gX, 1775, 345, 445, 12, true, false);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        roundRect(ctx, gX, 1775, 345, 445, 12, false, true);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 22px "Noto Sans Tamil"';
        drawWrappedText(ctx, gc.t, gX + 18, 1820, 310, 30);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '20px "Noto Sans Tamil"';
        drawWrappedText(ctx, gc.b, gX + 18, 1920, 310, 32);

        gX += 365;
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Noto Sans Tamil"';
    ctx.fillText('நம்ம சாமி நம்ம கோவில் • தலைப்பு 2: நம்ம சாமி (பாகம் 2 - பெரிய எழுத்து வடிவம்)', 800, 2390);

    const buf = await canvas.toBuffer('png');
    const outPath = path.join(OUTPUT_DIR, '2B_நம்ம_சாமி_பாகம்_2.png');
    fs.writeFileSync(outPath, buf);
    console.log(`Saved: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

// Page 3A: சொல்லிலக்கணம், 4 யுகங்கள், 5 வடிவங்கள், திருமூலர், மகான்கள்
async function generatePoster3A() {
    console.log('Generating 3A_நம்ம_கோவில்_பாகம்_1.png...');
    const width = 1600;
    const height = 2650; // Increased to 2650px to eliminate any overlap
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#042f2e');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
    ctx.lineWidth = 3;
    roundRect(ctx, 30, 30, width - 60, height - 60, 24, false, true);

    // Header Banner
    const headGrad = ctx.createLinearGradient(60, 60, width - 60, 240);
    headGrad.addColorStop(0, '#0d9488');
    headGrad.addColorStop(0.5, '#0f766e');
    headGrad.addColorStop(1, '#115e59');
    ctx.fillStyle = headGrad;
    roundRect(ctx, 60, 60, 1480, 180, 16, true, false);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    roundRect(ctx, 75, 75, 1450, 150, 12, true, false);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px "Noto Sans Tamil"';
    ctx.fillText('தலைப்பு 3: நம்ம கோவில் (பாகம் 1)', 800, 135);

    ctx.fillStyle = '#ccfbf1';
    ctx.font = 'bold 26px "Noto Sans Tamil"';
    ctx.fillText('ஆலய அறிவியல் • 4 யுகங்கள் • திருமூலர் பாடல்கள் • மூர்த்தி-தலம்-தீர்த்தம்', 800, 185);

    ctx.textAlign = 'left';

    function drawLargeKovilCard(x, y, w, h, title, pts) {
        ctx.fillStyle = 'rgba(19, 78, 74, 0.55)';
        roundRect(ctx, x, y, w, h, 16, true, false);
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, x, y, w, h, 16, false, true);

        ctx.fillStyle = '#0d9488';
        ctx.fillRect(x + 16, y, w - 32, 5);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        roundRect(ctx, x, y, w, 65, 16, true, false);

        ctx.fillStyle = '#5eead4';
        ctx.font = 'bold 30px "Noto Sans Tamil"';
        ctx.fillText(title, x + 25, y + 44);

        let curY = y + 105;
        for (const p of pts) {
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 24px "Noto Sans Tamil"';
            curY = drawWrappedText(ctx, p.h, x + 25, curY, w - 50, 34);
            curY += 4;

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '22px "Noto Sans Tamil"';
            curY = drawWrappedText(ctx, p.b, x + 40, curY, w - 65, 34);
            curY += 12;
        }
    }

    // 3.1 & 3.2
    drawLargeKovilCard(60, 270, 725, 440, '3.1 கோவில் & ஆலயம் சொல்லிலக்கணம்', [
        { h: '• கோவில் (கோ + இல் - Audio 11):', b: 'கோ = தலைவன் (இறைவன்) | இல் = வீடு (வசிப்பிடம்).\nகோவில் என்றால் "இறைவனின் அரண்மனை" என்று பொருள்.' },
        { h: '• ஆலயம் (ஆ + லயம்):', b: 'ஆ = ஆன்மா / ஜீவாத்மா | லயம் = ஒடுங்குதல்.\nஆலயம் என்றால் "ஜீவாத்மா இறைவனிடம் லயித்து அமைதி பெறும் இடம்".' }
    ]);

    drawLargeKovilCard(815, 270, 725, 440, '3.2 நான்கு யுகங்களும் கலியுக வழிபாடும்', [
        { h: '• 4 யுகங்கள் (Audio 11):', b: 'கிருத யுகம் • திரேதா யுகம் • துவாபர யுகம் • கலியுகம்' },
        { h: '• முதல் 3 யுகங்கள்:', b: 'யாகங்கள், தவம், யோகாப்பியாசம், இறைவனுடன் வாழ்தல்.' },
        { h: '• கலியுக வரம் (விக்ரக ஆராதனை):', b: 'மூர்த்தி வழிபாடு மனித மனதை ஒருமுகப்படுத்தி பக்குவப்படுத்துகிறது.' }
    ]);

    // 3.3 Five Forms (Height 620px)
    drawLargeKovilCard(60, 740, 725, 620, '3.3 ஐந்து வகை வழிபாட்டு வடிவங்கள்', [
        { h: '1. பட வழிபாடு (Audio 11):', b: 'இல்லங்களில் திருவுருவப் படங்களை வைத்து நெய் தீபமிட்டு வழிபடுவது.' },
        { h: '2. கல் & பளிங்குச் சிலைகள்:', b: 'ஆகம முறைப்படி பிரதிஷ்டை செய்யப்பட்ட திருமேனிகள்.' },
        { h: '3. யந்திர வழிபாடு:', b: 'பிரபஞ்ச ஆற்றலை ஈர்க்கும் வடிவியல் தகடுகள் (ஸ்ரீசக்ரம்).' },
        { h: '4. விளக்கு & அக்கினி (யாகம்):', b: 'தீபத்தை ஜோதி வடிவமாகவும், அக்னி மூலமாகவும் ஆராதித்தல்.' },
        { h: '5. மண் & பஞ்சலோக மூர்த்திகள்:', b: 'மண் பொம்மைகள் & உற்சவ திருமேனிகள்.' }
    ]);

    ctx.fillStyle = 'rgba(19, 78, 74, 0.55)';
    roundRect(ctx, 815, 740, 725, 620, 16, true, false);
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 815, 740, 725, 620, 16, false, true);

    ctx.fillStyle = '#0d9488';
    ctx.fillRect(831, 740, 693, 5);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    roundRect(ctx, 815, 740, 725, 65, 16, true, false);

    ctx.fillStyle = '#5eead4';
    ctx.font = 'bold 30px "Noto Sans Tamil"';
    ctx.fillText('3.4 திருமூலர் திருமந்திரப் பாடல்கள்', 835, 784);

    // Song 1
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    roundRect(ctx, 835, 825, 685, 230, 10, true, false);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 20px "Noto Sans Tamil"';
    ctx.fillText('பாடல் 1 (நடமாடும் கோவில் - மக்கள் தொண்டே மகேசன் தொண்டு):', 850, 860);
    ctx.fillStyle = '#5eead4';
    ctx.font = '19px "Noto Sans Tamil"';
    ctx.fillText('"படமாடக் கோயில் பகவற்கு ஒன்று ஈயில் நடமாடக் கோயில் நம்பர்க்கு அங்கு ஆகா', 850, 900);
    ctx.fillText('நடமாடக் கோயில் நம்பர்க்கு ஒன்று ஈயில் படமாடக் கோயில் பகவற்கு அது ஆமே"', 850, 940);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px "Noto Sans Tamil"';
    ctx.fillText('பொருள்: சக மனிதனுக்குச் செய்யும் தொண்டே இறைவனைச் சென்றடையும் வழிபாடு.', 850, 1005);

    // Song 2
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    roundRect(ctx, 835, 1080, 685, 250, 10, true, false);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 20px "Noto Sans Tamil"';
    ctx.fillText('பாடல் 2 (உடம்பே ஆலயம் - சரீரமே திருக்கோவில்):', 850, 1115);
    ctx.fillStyle = '#5eead4';
    ctx.font = '19px "Noto Sans Tamil"';
    ctx.fillText('"உள்ளம் பெருங்கோயில் ஊனுடம்பு ஆலயம் வள்ளற் பிரானார்க்கு வாய் கோபுர வாசல்', 850, 1155);
    ctx.fillText('தெள்ளத் தெளிந்தார்க்குச் சீவன் சிவலிங்கம் கள்ளப் புலனைந்தும் காளா மணிவிளக்கே"', 850, 1195);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px "Noto Sans Tamil"';
    ctx.fillText('பொருள்: உள்ளமே பெருங்கோவில்; உடலே ஆலயம்; சீவனே சிவலிங்கம்.', 850, 1260);

    // 3.5 Kings/Saints + 3.6 Murthi Thalam Theertham (Positioned safely at y = 1400)
    ctx.fillStyle = 'rgba(19, 78, 74, 0.55)';
    roundRect(ctx, 60, 1400, 1480, 1120, 16, true, false);
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 60, 1400, 1480, 1120, 16, false, true);

    ctx.fillStyle = '#0d9488';
    ctx.fillRect(76, 1400, 1448, 5);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    roundRect(ctx, 60, 1400, 1480, 65, 16, true, false);

    ctx.fillStyle = '#5eead4';
    ctx.font = 'bold 30px "Noto Sans Tamil"';
    ctx.fillText('3.5 மன்னர்களின் திருப்பணிகள் & 3.6 மூர்த்தி-தலம்-தீர்த்தம் (Audio 12, 13)', 85, 1444);

    function drawLargeKovilCol(x, y, w, h, title, items) {
        ctx.fillStyle = '#042f2e';
        roundRect(ctx, x, y, w, h, 12, true, false);
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, w, h, 12, false, true);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 24px "Noto Sans Tamil"';
        ctx.fillText(title, x + 20, y + 45);

        let curY = y + 90;
        for (const it of items) {
            ctx.fillStyle = it.bold ? '#5eead4' : '#cbd5e1';
            ctx.font = it.bold ? 'bold 21px "Noto Sans Tamil"' : '20px "Noto Sans Tamil"';
            curY = drawWrappedText(ctx, it.t, x + 20, curY, w - 40, 32);
            curY += 8;
        }
    }

    drawLargeKovilCol(85, 1490, 455, 990, 'மன்னர்கள் & தியாகங்கள்', [
        { t: '• சேரன் செங்குட்டுவன் கண்ணகிக்குக் கோவில் அமைக்க இமயத்திலிருந்து கல் கொண்டு வந்த வரலாறு.' },
        { t: '• மன்னர்கள் நிலம், ஆபரணங்கள், தேர்கள் வழங்கி கோவில்களைப் பொக்கிஷங்களாகப் பாதுகாத்தனர்.' },
        { t: '• குங்கிலியக்கலய நாயனார்: கழுத்தில் கயிறு கட்டி சிவலிங்கத்தை நிமிர்த்திய பக்தி.' },
        { t: '• பூசலார் நாயனார்: மனதிற்குள்ளேயே கோவில் கட்டி இறைவனை எழுந்தருளச் செய்த மகிமை.' },
        { t: '• தஞ்சைப் பெரிய கோவில்: விமான உச்சிக்கு ஒற்றைக் கருங்கல்லைத் தந்த அழகி பாட்டியின் தூய பக்தி.' }
    ]);

    drawLargeKovilCol(570, 1490, 455, 990, 'புனிதத் தலங்களின் வகைகள்', [
        { t: '• 52 சக்தி பீடங்கள் & 12 ஜோதிர்லிங்கங்கள்' },
        { t: '• 108 வைணவ திவ்ய தேசங்கள் & பாடல் பெற்ற தலங்கள்' },
        { t: '• பஞ்சபூதத் தலங்கள்:', bold: true },
        { t: '  நிலம் (காஞ்சிபுரம்)\n  நீர் (திருவானைக்காவல்)\n  நெருப்பு (திருவண்ணாமலை)\n  காற்று (காளஹஸ்தி)\n  ஆகாயம் (சிதம்பரம்)' },
        { t: '• புண்ணிய நதிகள்:', bold: true },
        { t: '  தாமிரபரணி, வைகை, காவிரி, தென்பெண்ணை, பாலாறு' }
    ]);

    drawLargeKovilCol(1055, 1490, 455, 990, 'அவதரித்த மகான்கள் & ஆகமம்', [
        { t: '• ஆதிசங்கரர் (காலடி)' },
        { t: '• ஸ்ரீ ராமானுஜர் (ஸ்ரீபெரும்புதூர்)' },
        { t: '• வள்ளலார் ராமலிங்க அடிகள் (வடலூர்)' },
        { t: '• தாயுமானவர் சுவாமிகள் (திருச்சி)' },
        { t: '• பட்டினத்தார் (திருவொற்றியூர்)' },
        { t: '• கிருபானந்த வாரியார் • பாம்பன் சுவாமிகள்' },
        { t: '• ஆகம வழிபாட்டுச் சுதந்திரம்:', bold: true },
        { t: '  விரும்பிய வடிவில் வழிபடும் சுதந்திரமே நமது தர்மத்தைச் சிரஞ்சீவியாக வாழ வைக்கிறது (மந்திரம்-யந்திரம்-தந்திரம்).' }
    ]);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Noto Sans Tamil"';
    ctx.fillText('நம்ம சாமி நம்ம கோவில் • தலைப்பு 3: நம்ம கோவில் (பாகம் 1 - பெரிய எழுத்து வடிவம்)', 800, 2590);

    const buf = await canvas.toBuffer('png');
    const outPath = path.join(OUTPUT_DIR, '3A_நம்ம_கோவில்_பாகம்_1.png');
    fs.writeFileSync(outPath, buf);
    console.log(`Saved: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

// Page 3B: 10 சமுதாயப் பெருமைகள்
async function generatePoster3B() {
    console.log('Generating 3B_நம்ம_கோவில்_பாகம்_2.png...');
    const width = 1600;
    const height = 2450;
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#042f2e');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
    ctx.lineWidth = 3;
    roundRect(ctx, 30, 30, width - 60, height - 60, 24, false, true);

    // Header Banner
    const headGrad = ctx.createLinearGradient(60, 60, width - 60, 240);
    headGrad.addColorStop(0, '#0d9488');
    headGrad.addColorStop(0.5, '#0f766e');
    headGrad.addColorStop(1, '#115e59');
    ctx.fillStyle = headGrad;
    roundRect(ctx, 60, 60, 1480, 180, 16, true, false);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    roundRect(ctx, 75, 75, 1450, 150, 12, true, false);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px "Noto Sans Tamil"';
    ctx.fillText('தலைப்பு 3: நம்ம கோவில் (பாகம் 2)', 800, 135);

    ctx.fillStyle = '#ccfbf1';
    ctx.font = 'bold 26px "Noto Sans Tamil"';
    ctx.fillText('ஆகம விதிகளும் திருக்கோவிலின் 10 சமுதாயப் பெருமைகளும்', 800, 185);

    ctx.textAlign = 'left';

    const benefits = [
        { num: '1', h: 'நகர நிர்மாணம் (Town Planning):', b: 'ஊரின் மையத்தில் கருவறை அமைத்து, அதைச் சுற்றி சமச்சீரான சதுர, செவ்வக மாட வீதிகளை ஆகம முறைப்படி வடிவமைத்தனர்.' },
        { num: '2', h: 'தூய்மையான வீதிகள் & மழைநீர் வடிகால்:', b: 'கோவிலைச் சுற்றியுள்ள தெருக்கள் அகலமாகவும், மழைநீர் தேங்காத சிறந்த வடிகால் அமைப்போடும் கட்டப்பட்டன.' },
        { num: '3', h: 'விண்ணுயர்ந்த ராஜகோபுரங்கள்:', b: 'கோபுர கலசங்கள் இடிதாங்கிகளாக (Lightning Arresters) செயல்பட்டன; தானியங்களைச் சேமிக்கும் களஞ்சியங்களாகவும் இருந்தன.' },
        { num: '4', h: 'திருக்குளங்கள் & நிலத்தடி நீர் மேலாண்மை:', b: 'மழைநீரைச் சேகரித்து நிலத்தடி நீர்மட்டத்தை உயர்த்தும் மிகப்பெரிய நீராதாரங்களாகத் திருக்குளங்கள் விளங்கின.' },
        { num: '5', h: 'கல்வெட்டுகள் & வரலாற்று ஆவணங்கள்:', b: 'அரச கட்டளைகள், தானங்கள், வரி விலக்குகள் மற்றும் வானியல் குறிப்புகள் கல்வெட்டுகளாகவும் செப்புப் பட்டயங்களாகவும் பதியப்பட்டன.' },
        { num: '6', h: '64 கலைகளின் பண்பாட்டு அரங்கம்:', b: 'இயல், இசை, நாடகம், சிற்பக்கலை மற்றும் நூல் அரங்கேற்றங்கள் (சேக்கிழார் பெரியபுராணம் தில்லையில் அரங்கேற்றம்) கோவிலிலேயே நடந்தன.' },
        { num: '7', h: 'சமூக நல்லிணக்கத் திருவிழாக்கள்:', b: 'அனைத்து சமுதாய மக்களுக்கும் தனித்தனி பொறுப்புகள் வழங்கப்பட்டு, ஒற்றுமையுடன் கொண்டாடும் பெருவிழாக்களாக அமைந்தன.' },
        { num: '8', h: 'உள்ளூர்ப் பொருளாதாரம் & வணிகம்:', b: 'பூக்கள், பால், பழங்கள், எண்ணெய், கைவினைப் பொருட்கள் விற்பனை மூலம் பல்லாயிரக்கணக்கானோருக்கு வாழ்வாதாரம் கிடைத்தது.' },
        { num: '9', h: 'தேர்த்திருவிழா (சமத்துவ வடம்):', b: 'சாதி, மத, ஏழை, பணக்கார பேதமின்றி ஊர் மக்கள் அனைவரும் ஒன்றுகூடி வடம்பிடித்துத் தேர் இழுக்கும் மகத்தான சமத்துவ நெறி.' },
        { num: '10', h: 'தியாக வரலாறு & 5 நல்வழிப் பண்புகள்:', b: 'அன்னிய படையெடுப்புகளிலிருந்து கோவில்களைக் காக்க முன்னோர்கள் தன்னுயிர் ஈந்தனர். கோவில் நம்மை: 1. ஒருங்கிணைக்கிறது 2. நெறிப்படுத்துகிறது 3. மகிழ்வுறச் செய்கிறது 4. பிறவிப்பயன் பெறச் செய்கிறது 5. வருங்காலத் தலைமுறையை நல்வழிப்படுத்துகிறது!' }
    ];

    let rowY = 270;
    for (let i = 0; i < benefits.length; i += 2) {
        const b1 = benefits[i];
        const b2 = benefits[i + 1];

        // Box 1
        ctx.fillStyle = '#042f2e';
        roundRect(ctx, 60, rowY, 725, 380, 14, true, false);
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 1.5;
        roundRect(ctx, 60, rowY, 725, 380, 14, false, true);

        // Num Badge 1
        ctx.fillStyle = '#14b8a6';
        roundRect(ctx, 85, rowY + 22, 45, 45, 8, true, false);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 26px "Noto Sans Tamil"';
        ctx.textAlign = 'center';
        ctx.fillText(b1.num, 107, rowY + 54);
        ctx.textAlign = 'left';

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 25px "Noto Sans Tamil"';
        ctx.fillText(b1.h, 145, rowY + 54);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '22px "Noto Sans Tamil"';
        drawWrappedText(ctx, b1.b, 85, rowY + 105, 675, 36);

        // Box 2
        if (b2) {
            ctx.fillStyle = '#042f2e';
            roundRect(ctx, 815, rowY, 725, 380, 14, true, false);
            ctx.strokeStyle = '#14b8a6';
            ctx.lineWidth = 1.5;
            roundRect(ctx, 815, rowY, 725, 380, 14, false, true);

            // Num Badge 2
            ctx.fillStyle = '#14b8a6';
            roundRect(ctx, 840, rowY + 22, 45, 45, 8, true, false);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 26px "Noto Sans Tamil"';
            ctx.textAlign = 'center';
            ctx.fillText(b2.num, 862, rowY + 54);
            ctx.textAlign = 'left';

            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 25px "Noto Sans Tamil"';
            ctx.fillText(b2.h, 900, rowY + 54);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '22px "Noto Sans Tamil"';
            drawWrappedText(ctx, b2.b, 840, rowY + 105, 675, 36);
        }

        rowY += 410;
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Noto Sans Tamil"';
    ctx.fillText('நம்ம சாமி நம்ம கோவில் • தலைப்பு 3: நம்ம கோவில் (பாகம் 2 - பெரிய எழுத்து வடிவம்)', 800, 2390);

    const buf = await canvas.toBuffer('png');
    const outPath = path.join(OUTPUT_DIR, '3B_நம்ம_கோவில்_பாகம்_2.png');
    fs.writeFileSync(outPath, buf);
    console.log(`Saved: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

async function renderAllLarge() {
    await generatePoster1A();
    await generatePoster1B();
    await generatePoster2A();
    await generatePoster2B();
    await generatePoster3A();
    await generatePoster3B();
    console.log('ALL 6 EXPANDED LARGE-FONT POSTERS RE-GENERATED PERFECTLY!');
}

renderAllLarge().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
