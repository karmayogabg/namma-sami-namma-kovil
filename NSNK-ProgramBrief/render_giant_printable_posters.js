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

// Utility: Wrap text cleanly with giant line-height
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

// Base template builder - BRIGHT / LIGHT THEME
function createBasePoster(width, height, theme, sheetNumber, title, subtitle, footerText) {
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    // Bright Canvas Background (Ivory / Soft Crisp White)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (theme === 'namma') {
        bgGrad.addColorStop(0, '#fefce8');
        bgGrad.addColorStop(0.5, '#fffbeb');
        bgGrad.addColorStop(1, '#fef3c7');
    } else if (theme === 'sami') {
        bgGrad.addColorStop(0, '#fff1f2');
        bgGrad.addColorStop(0.5, '#fff5f5');
        bgGrad.addColorStop(1, '#ffe4e6');
    } else { // kovil
        bgGrad.addColorStop(0, '#f0fdfa');
        bgGrad.addColorStop(0.5, '#f8fafc');
        bgGrad.addColorStop(1, '#ccfbf1');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer Border Frame
    const borderCol = theme === 'namma' ? '#d97706' : (theme === 'sami' ? '#be123c' : '#0f766e');
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 4;
    roundRect(ctx, 30, 30, width - 60, height - 60, 24, false, true);

    // Inner subtle border
    ctx.strokeStyle = theme === 'namma' ? 'rgba(217, 119, 6, 0.25)' : (theme === 'sami' ? 'rgba(190, 18, 60, 0.25)' : 'rgba(15, 118, 110, 0.25)');
    ctx.lineWidth = 1.5;
    roundRect(ctx, 42, 42, width - 84, height - 84, 18, false, true);

    // Header Banner
    const headGrad = ctx.createLinearGradient(60, 60, width - 60, 260);
    if (theme === 'namma') {
        headGrad.addColorStop(0, '#b45309');
        headGrad.addColorStop(0.5, '#d97706');
        headGrad.addColorStop(1, '#f59e0b');
    } else if (theme === 'sami') {
        headGrad.addColorStop(0, '#881337');
        headGrad.addColorStop(0.5, '#be123c');
        headGrad.addColorStop(1, '#e11d48');
    } else {
        headGrad.addColorStop(0, '#115e59');
        headGrad.addColorStop(0.5, '#0f766e');
        headGrad.addColorStop(1, '#0d9488');
    }
    ctx.fillStyle = headGrad;
    roundRect(ctx, 60, 60, width - 120, 200, 18, true, false);

    // Inner banner subtle shadow overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    roundRect(ctx, 75, 75, width - 150, 170, 14, true, false);

    // Header Number Badge
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 95, 95, 130, 130, 14, true, false);
    ctx.fillStyle = borderCol;
    ctx.font = 'bold 52px "Noto Sans Tamil"';
    ctx.textAlign = 'center';
    ctx.fillText(sheetNumber, 160, 178);

    // Header Titles
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Noto Sans Tamil"';
    ctx.fillText(title, 255, 142);

    const subColor = theme === 'namma' ? '#fef08a' : (theme === 'sami' ? '#ffe4e6' : '#ccfbf1');
    ctx.fillStyle = subColor;
    ctx.font = 'bold 23px "Noto Sans Tamil"';
    ctx.fillText(subtitle, 255, 195);

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 24px "Noto Sans Tamil"';
    ctx.fillText(footerText, width / 2, height - 60);

    return { canvas, ctx, borderCol };
}

// Utility: Draw Giant Card - BRIGHT THEME
function drawGiantCard(ctx, x, y, w, h, title, items, theme = 'namma') {
    // Card Body Background: Crisp White
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, x, y, w, h, 18, true, false);

    // Card Outer Border
    const borderCol = theme === 'namma' ? '#f59e0b' : (theme === 'sami' ? '#f43f5e' : '#14b8a6');
    const headerBg = theme === 'namma' ? '#fef3c7' : (theme === 'sami' ? '#ffe4e6' : '#ccfbf1');
    const titleCol = theme === 'namma' ? '#9a3412' : (theme === 'sami' ? '#881337' : '#115e59');
    const headCol = theme === 'namma' ? '#b45309' : (theme === 'sami' ? '#be123c' : '#0f766e');

    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 2.5;
    roundRect(ctx, x, y, w, h, 18, false, true);

    // Card Header Strip
    ctx.fillStyle = headerBg;
    roundRect(ctx, x, y, w, 80, 18, true, false);

    // Top Accent Bar
    ctx.fillStyle = borderCol;
    ctx.fillRect(x + 18, y, w - 36, 6);

    // Title Text
    ctx.fillStyle = titleCol;
    ctx.font = 'bold 31px "Noto Sans Tamil"';
    ctx.textAlign = 'left';
    ctx.fillText(title, x + 30, y + 54);

    let curY = y + 130;
    for (const it of items) {
        if (it.head) {
            ctx.fillStyle = headCol;
            ctx.font = 'bold 32px "Noto Sans Tamil"';
            curY = drawWrappedText(ctx, it.head, x + 30, curY, w - 60, 46);
            curY += 6;
        }
        if (it.body) {
            ctx.fillStyle = '#1e293b'; // High-contrast Charcoal Body
            ctx.font = '30px "Noto Sans Tamil"';
            curY = drawWrappedText(ctx, it.body, x + 45, curY, w - 85, 48);
            curY += 24;
        }
    }
}

// =========================================================================
// TOPIC 1: நம்ம (NAMMA) — 4 PRINTABLE SHEETS (1A, 1B, 1C, 1D) - BRIGHT THEME
// =========================================================================

// Sheet 1A: மொழி & வணக்கம்
async function generateSheet1A() {
    const width = 1600, height = 2100;
    const { canvas, ctx } = createBasePoster(width, height, 'namma', '1A', 'தலைப்பு 1: நம்ம — மொழி & வணக்கம்', 'நமது தாய்மொழிச் சிந்தனை & வணக்கம் வேத மரபு', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 1: நம்ம (பாகம் 1A - பெரிய எழுத்து அச்சுப் பிரதி)');

    drawGiantCard(ctx, 60, 290, 1480, 780, '1.1 நமது மொழி & சிந்தனைப் பகிர்வு (Audio 1, 18)', [
        {
            head: '• மொழியின் தோற்றமும் சிந்தனைப் பகிர்வும்:',
            body: 'கூடி வாழும் மனிதர்களிடையே எண்ணங்களையும், உயர்ந்த கருத்துக்களையும், தத்துவங்களையும் பரிமாறிக் கொள்ளவே மொழி உருவானது.'
        },
        {
            head: '• தாய்மொழியின் தனித்துவ மகத்துவம்:',
            body: 'மக்களின் உள்ளார்ந்த சிந்தனைகளும், தத்துவங்களும், ஆழமான உணர்வுகளும் தாய்மொழியில் மட்டுமே முழுமையாக வெளிப்பட முடியும்.'
        },
        {
            head: '• சமுதாய வலிமை & ஐநா சபை பிரகடனம்:',
            body: 'தாய்மொழியைப் பயன்படுத்துவது நமது சிந்தனையைத் தெளிவாக்கி சமூகத்தை வலிமைப்படுத்துகிறது. தமிழ் உலகின் மூத்த மொழி என உலகளவில் போற்றப்படுகிறது.'
        }
    ], 'namma');

    drawGiantCard(ctx, 60, 1110, 1480, 850, '1.2 வணக்கம் சொல்லும் வேத மரபு (Audio 2, 18)', [
        {
            head: '• கொரோனா கால உலகளாவிய ஏற்பு:',
            body: 'கொரோனா பேரிடர் காலத்தில் தொற்று பரவுவதைத் தவிர்க்க, உலக நாடுகள் அனைத்தும் கைகுலுக்குவதைத் தவிர்த்து நமது பாரம்பரிய \'வணக்கம்\' முறையை ஏற்றன.'
        },
        {
            head: '• "இருப்பதெல்லாம் இறைவனே" — "ஈசா வாஸ்யம் இதம் சர்வம்":',
            body: 'எதிரில் இருக்கும் சக மனிதரிடம் உறையும் பரம்பொருளைத் தலைவணங்கி ஏற்கும் உயர்ந்த சமத்துவ ஆன்மீக நெறி.'
        },
        {
            head: '• இதயப்பூர்வமான சமத்துவம்:',
            body: 'இரு கரங்களையும் குவித்து மார்பருகே குவித்து வணங்குவது ஆழ்ந்த மரியாதையையும் சமத்துவ உணர்வையும் ஊட்டுகிறது.'
        }
    ], 'namma');

    const outPath = path.join(OUTPUT_DIR, '1A_நம்ம_மொழி_வணக்கம்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

// Sheet 1B: உடை & வானவியல்
async function generateSheet1B() {
    const width = 1600, height = 2100;
    const { canvas, ctx } = createBasePoster(width, height, 'namma', '1B', 'தலைப்பு 1: நம்ம — உடை & வானவியல்', 'பாரதப் பாரம்பரிய உடை & விழாக்களின் வானவியல் அறிவியல்', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 1: நம்ம (பாகம் 1B - பெரிய எழுத்து அச்சுப் பிரதி)');

    drawGiantCard(ctx, 60, 290, 1480, 800, '1.3 பாரதப் பாரம்பரிய உடை (வேட்டி & சேலை - Audio 3)', [
        {
            head: '• உலகின் முதல் ஆடை நாகரிகம்:',
            body: 'உலகில் முதன்முதலில் நூல் நூற்று, நெய்து, ஆடை உடுத்திய பெருமை நமது தொன்மையான பாரதப் பண்பாட்டிற்கே உரியது.'
        },
        {
            head: '• கம்பீரமான வேட்டியும் சேலையும்:',
            body: 'பல்லாயிரக்கணக்கான ஆண்டுகளாக நாம் பின்பற்றி வரும் பண்பாட்டு அடையாளம். இன்றும் உலகளவில் சேலை மிக கண்ணியமான, நேர்த்தியான உடையாகப் போற்றப்படுகிறது.'
        },
        {
            head: '• தட்பவெப்ப நிலையும் உடைக் கலாச்சாரமும்:',
            body: 'நமது தட்பவெப்ப நிலைக்கு ஏற்ற வேட்டி உடைக் கலாச்சாரத்தைப் போற்றிப் பேணி வாய்ப்புள்ள போதெல்லாம் பெருமிதத்துடன் உடுத்த வேண்டும்.'
        }
    ], 'namma');

    drawGiantCard(ctx, 60, 1130, 1480, 830, '1.4 விழாக்களும் தமிழ் வானவியலும் (Audio 4, 15)', [
        {
            head: '• வானியல் & புவியியல் அறிவியல்:',
            body: 'நமது திருவிழாக்களும் பண்டிகைகளும் வானவியலோடும் (Astronomy) புவியியலோடும் (Geography) இணைந்து அறிவியல் பூர்வமாகக் கணிக்கப்பட்டவை.'
        },
        {
            head: '• பிறந்தநாள் கணக்கீட்டு மரபு:',
            body: 'பூமி சூரியனைச் சுற்றி வரும் பாதையில், நாம் பிறந்த அதே புள்ளியில் மீண்டும் பூமி வரும் நாளைக் கணிப்பதே நமது உண்மையான பிறந்தநாள் மரபு.'
        },
        {
            head: '• சூரியமானம் & சந்திரமானம்:',
            body: 'சூரியன் மற்றும் சந்திரனின் சுழற்சியை இணைத்து உருவாக்கப்பட்ட தமிழ் நாட்காட்டி உலகிற்கே வழிகாட்டும் அறிவியல் அற்புதம்.'
        }
    ], 'namma');

    const outPath = path.join(OUTPUT_DIR, '1B_நம்ம_பாரத_உடை_வானவியல்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

// Sheet 1C: குடும்பம் & உறவுகள்
async function generateSheet1C() {
    const width = 1600, height = 2100;
    const { canvas, ctx } = createBasePoster(width, height, 'namma', '1C', 'தலைப்பு 1: நம்ம — குடும்பம் & உறவுகள்', 'கூட்டுக்குடும்ப அமைப்பும் 6 தர்ம கர்மங்களும் • மரபணு அறிவியல்', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 1: நம்ம (பாகம் 1C - பெரிய எழுத்து அச்சுப் பிரதி)');

    drawGiantCard(ctx, 60, 290, 1480, 840, '1.5 குடும்ப அமைப்பும் 6 தர்ம கர்மங்களும் (Audio 5, 14)', [
        {
            head: '• கூட்டுக்குடும்பத்தின் வலிமை:',
            body: 'பாரதக் குடும்ப அமைப்பு என்பது உலகிற்கே வழிகாட்டும் மாபெரும் பாதுகாப்புத் தூண்.'
        },
        {
            head: '• 6 நித்திய தர்ம கர்மங்கள் (யக்ஞங்கள்):',
            body: '1. தேவ யக்ஞம் — இறை வழிபாடு & ஆலயப் பணி\n2. பித்ரு யக்ஞம் — முன்னோர்கள் வழிபாடு & தர்மம்\n3. மனுஷ்ய யக்ஞம் — விருந்தோம்பல் & மனிதநேய நற்பணி\n4. பூத யக்ஞம் — விலங்குகள், பறவைகளுக்கு உணவளித்தல்\n5. பிரம்ம யக்ஞம் — வேத, தமிழ் நூல்கள் கற்றல் & கற்பித்தல்\n6. சமுதாய தர்மம் — ஊர் நலம், சமூக ஒற்றுமை & தர்மத் தொண்டு'
        }
    ], 'namma');

    drawGiantCard(ctx, 60, 1170, 1480, 790, '1.6 தமிழர் உறவுமுறைகளின் அறிவியல் (Audio 6)', [
        {
            head: '• மரபணுப் பாதுகாப்பு (Genetic Safeguarding):',
            body: 'தாய்மாமன், அத்தை, பெரியப்பா, சித்தப்பா போன்ற உறவுமுறைகள் வெறும் பெயர்கள் அல்ல; அவை மரபணுக் குறைபாடுகளைத் தவிர்க்கும் உன்னத கட்டமைப்பு.'
        },
        {
            head: '• உளவியல் அரணும் சமூகப் பிணைப்பும்:',
            body: 'குழந்தைகள் வளர்ப்பில் தாய்மாமனின் பாசமும் வழிகாட்டலும் குடும்பத்திற்கு மாபெரும் உளவியல் அரணாகத் திகழ்கிறது. துன்பக் காலங்களில் கை கொடுக்கும் குடும்பப் பிணைப்பு மன அழுத்தத்தைத் தடுக்கிறது.'
        }
    ], 'namma');

    const outPath = path.join(OUTPUT_DIR, '1C_நம்ம_குடும்பம்_உறவுகள்_அறிவியல்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

// Sheet 1D: பஞ்சாங்கம் & தியாகம்
async function generateSheet1D() {
    const width = 1600, height = 2100;
    const { canvas, ctx } = createBasePoster(width, height, 'namma', '1D', 'தலைப்பு 1: நம்ம — பஞ்சாங்கம் & தியாகம்', 'பாரம்பரிய பஞ்சாங்கம் • உபசார வார்த்தைகள் & தியாகத்தின் மேன்மை', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 1: நம்ம (பாகம் 1D - பெரிய எழுத்து அச்சுப் பிரதி)');

    drawGiantCard(ctx, 60, 290, 1480, 830, '1.7 பாரம்பரிய பஞ்சாங்கம் & காலக்கணக்கீடு (Audio 7, 15)', [
        {
            head: '• பஞ்சாங்கம் (5 அங்கங்கள்):',
            body: '1. திதி — சந்திரனின் கோண நிலை (திதியின் வளர்ச்சி/தேய்வு)\n2. வாரம் — 7 கிழமைகள் (கோள்களின் சுழற்சி முறை)\n3. நட்சத்திரம் — 27 விண்மீன் மண்டலங்கள்\n4. யோகம் — சூரியன் மற்றும் சந்திரனின் கூட்டு இயக்கம்\n5. கரணம் — திதியின் அரைப் பங்கு கால அளவு'
        },
        {
            head: '• அதிநவீன வானியல் காலக்கண்ணாடி:',
            body: 'விவசாயம், பண்டிகைகள், மங்கள நிகழ்வுகளை இயற்கை மாற்றங்களோடு இணைத்துச் செயல்படுத்தும் ஒப்பற்ற காலக் கண்ணாடி.'
        }
    ], 'namma');

    drawGiantCard(ctx, 60, 1160, 1480, 800, '1.8 உபசார மொழியின் உன்னதம் & தியாகம் (Audio 18)', [
        {
            head: '• இன்சொல் வரவேற்பும் உபநிடத தியாக வாசகமும்:',
            body: 'இல்லத்திற்கு வருபவர்களை இன்முகத்தோடு "வாங்க" என அழைத்து உபசரிப்பது தமிழரின் தலையாய பண்பாடு.\n"ந கர்மணா ந ப்ரஜயா தனேன த்யாகேனைகே அம்ருதத்வ மானஸுஹ்"\n(செயல்களாலோ, செல்வத்தாலோ அல்ல, தியாகத்தினால் மட்டுமே அமரத்துவம் பெற முடியும்).'
        },
        {
            head: '• திருக்குறள் அறம்:',
            body: '"யாதனின் யாதனின் நீங்கியான் நோதல் அதனின் அதனின் இலன்"\n(பற்றுக்களைத் துறந்து பிறருக்கு உதவும் தியாக மனப்பான்மையே சமுதாயத்தை உயர்த்துகிறது).'
        }
    ], 'namma');

    const outPath = path.join(OUTPUT_DIR, '1D_நம்ம_பஞ்சாங்கம்_தியாகம்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

// =========================================================================
// TOPIC 2: நம்ம சாமி (NAMMA SAMI) — 4 PRINTABLE SHEETS (2A, 2B, 2C, 2D) - BRIGHT THEME
// =========================================================================

// Sheet 2A: சாமி தத்துவம் & கரதர்சனம்
async function generateSheet2A() {
    const width = 1600, height = 2100;
    const { canvas, ctx } = createBasePoster(width, height, 'sami', '2A', 'தலைப்பு 2: நம்ம சாமி — தத்துவம் & கரதர்சனம்', 'சாமி என்றால் யார்? • கரதர்சனம் பிரபாத ஸ்லோகம்', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 2: நம்ம சாமி (பாகம் 2A - பெரிய எழுத்து அச்சுப் பிரதி)');

    drawGiantCard(ctx, 60, 290, 1480, 820, '2.1 சாமி என்றால் என்ன? எங்கே இருக்கிறார்? (Audio 8, 19)', [
        {
            head: '• சாமி என்றால் என்ன? — "உடையவர்":',
            body: 'அனைத்து பிரபஞ்சத்தையும், சகல ஜீவராசிகளையும் தனக்கு உடைமையாகக் கொண்டு காக்கும் பரம்பொருள்.'
        },
        {
            head: '• சாமி மொத்தம் எத்தனை? — ஒன்றே பல திருநாமங்கள்:',
            body: 'ஒரே பரம்பொருள் பல வடிவங்களாகவும், உருவங்களாகவும், திருநாமங்களாகவும் அன்போடு வழிபடப்படுகிறார்.'
        },
        {
            head: '• சாமி எங்கே இருக்கிறார்? — "ஈசா வாஸ்யம் இதம் சர்வம்":',
            body: 'அங்கிங்கெனாதபடி எங்கும் பிரகாசமாய், தூணிலும் துரும்பிலும் ஆனந்த பூர்த்தியாகி விளங்கும் மெய்ப்பொருள்.'
        }
    ], 'sami');

    // Karadharshanam Card
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 60, 1150, 1480, 810, 18, true, false);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    roundRect(ctx, 60, 1150, 1480, 810, 18, false, true);

    ctx.fillStyle = '#ffe4e6';
    roundRect(ctx, 60, 1150, 1480, 80, 18, true, false);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(78, 1150, 1444, 6);

    ctx.fillStyle = '#881337';
    ctx.font = 'bold 34px "Noto Sans Tamil"';
    ctx.textAlign = 'left';
    ctx.fillText('2.2 கரதர்சனம் ஸ்லோகம் — தெய்வீகம் நம்மிலும் உள்ளது! (Audio 9, 19)', 90, 1204);

    // Shloka Banner
    ctx.fillStyle = '#fff1f2';
    roundRect(ctx, 90, 1260, 1420, 130, 14, true, false);
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 90, 1260, 1420, 130, 14, false, true);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#9f1239';
    ctx.font = 'bold 32px "Noto Sans Tamil"';
    ctx.fillText('"கராக்ரே வசதே லக்ஷ்மீ: கரமத்யே ஸரஸ்வதீ |', 800, 1315);
    ctx.fillText('கரமூலே ஸ்திதே கௌரீ ப்ரபாதே கரதர்சனம் ||"', 800, 1365);

    ctx.textAlign = 'left';
    let sY = 1430;
    const shlokaPts = [
        { h: '• விரல் நுனியில் லட்சுமி:', b: 'தொழில், செல்வம் மற்றும் பொருள் வளம் விரல் நுனிகளில் உறைகிறது.' },
        { h: '• உள்ளங்கையின் நடுவில் சரஸ்வதி:', b: 'கல்வி, அறிவு மற்றும் மெய்ஞ்ஞானம் உள்ளங்கையின் நடுவில் உறைகிறது.' },
        { h: '• மணிக்கட்டில் கௌரி (சக்தி):', b: 'ஆற்றல், வீரியம் மற்றும் மன உறுதி மணிக்கட்டில் நிலைபெற்றுள்ளது.' },
        { h: '• மகத்தான தன்னம்பிக்கை:', b: 'காலையில் கண் விழித்தவுடன் நமது உள்ளங்கையைப் பார்ப்பதன் மூலம் அனைத்து தெய்வீக ஆற்றல்களும் நமது கரங்களிலும் சுய உழைப்பிலும் குடி கொண்டுள்ளன என்பதை உணர்ந்து செயல்பட வேண்டும்.' }
    ];

    for (const sp of shlokaPts) {
        ctx.fillStyle = '#be123c';
        ctx.font = 'bold 28px "Noto Sans Tamil"';
        ctx.fillText(sp.h, 90, sY);
        ctx.fillStyle = '#1e293b';
        ctx.font = '26px "Noto Sans Tamil"';
        sY = drawWrappedText(ctx, sp.b, 110, sY + 36, 1360, 40);
        sY += 12;
    }

    const outPath = path.join(OUTPUT_DIR, '2A_நம்ம_சாமி_தத்துவம்_கரதர்சனம்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

// Sheet 2B: ஆன்மீகக் கதைகள் (ராமகிருஷ்ணர் & யானை)
async function generateSheet2B() {
    const width = 1600, height = 2100;
    const { canvas, ctx } = createBasePoster(width, height, 'sami', '2B', 'தலைப்பு 2: நம்ம சாமி — ஆன்மீகக் கதைகள்', 'ஸ்ரீ ராமகிருஷ்ணர் உவமை & குரு-சிஷ்யர்-யானை கதை (பக்தியுடன் விவேகம்)', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 2: நம்ம சாமி (பாகம் 2B - பெரிய எழுத்து அச்சுப் பிரதி)');

    drawGiantCard(ctx, 60, 290, 1480, 820, '2.3 ஸ்ரீ ராமகிருஷ்ணர் அருளிய ஆன்மீக உவமை (Audio 8, 19)', [
        {
            head: '• உருவமும் அருவமும் (Form & Formless):',
            body: 'இறைவன் அனைத்திலும் நீக்கமற உறைகிறார் என்பதை ஸ்ரீ ராமகிருஷ்ண பரமஹம்சர் மிக எளிய உவமையால் தெளிவுபடுத்தினார்.'
        },
        {
            head: '• நீர் மற்றும் பனிக்கட்டி தத்துவம்:',
            body: 'நீர் எப்படி கண்ணுக்குத் தெரியும் திரவமாகவும், உறைந்த பனிக்கட்டியாகவும் மாறுகிறதோ, அதுபோல ஒரே பரம்பொருள் பக்தர்களின் அன்புக்காக அருவமாகவும் திருவுருவமாகவும் காட்சியளிக்கிறார்.'
        },
        {
            head: '• மெய்யான பக்தி நெறி:',
            body: 'உலகில் உள்ள அனைத்து உயிர்களிலும் அந்த பரம்பொருளின் அருட்பெரும் இருப்பைக் காண்பதே உண்மையான ஆன்மீகப் பார்வையாகும்.'
        }
    ], 'sami');

    drawGiantCard(ctx, 60, 1150, 1480, 810, '2.4 குரு - சிஷ்யர் & யானை கதை (பக்தியுடன் கூடிய பகுத்தறிவு)', [
        {
            head: '• மதம் பிடித்த யானை நிகழ்வு:',
            body: '"எங்கும் நாராயணனே நிறைந்திருக்கிறார்" என்ற குருவின் உபதேசத்தைக் கேட்டு, எதிரில் மதம் பிடித்து ஓடிவந்த யானையைக் கண்டு விலகாமல் நின்ற சிஷ்யனை யானை தூக்கி வீசியது.'
        },
        {
            head: '• குருவின் தெளிவான விளக்கம்:',
            body: '"யானையில் நாராயணன் இருப்பது உண்மையே; ஆனால் யானையின் மேல் அமர்ந்து \'விலகிப் போ! விலகிப் போ!\' என்று எச்சரித்த யானைப் பாகனிலும் அதே நாராயணனே பேசினான்!"'
        },
        {
            head: '• வாழ்க்கைப் பாடம்:',
            body: 'பக்தி என்பது குருட்டு நம்பிக்கை அல்ல; உலக விவகாரங்களில் விவேகத்துடனும் பகுத்தறிவுடனும் செயல்படுவதே மெய்ஞ்ஞானம் ஆகும்.'
        }
    ], 'sami');

    const outPath = path.join(OUTPUT_DIR, '2B_நம்ம_சாமி_ஆன்மீகக்_கதைகள்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

// Sheet 2C: 3 வழிபாட்டு நிலைகள்
async function generateSheet2C() {
    const width = 1600, height = 2100;
    const { canvas, ctx } = createBasePoster(width, height, 'sami', '2C', 'தலைப்பு 2: நம்ம சாமி — 3 வழிபாட்டு நிலைகள்', 'குலதெய்வம் • கிராம சாமி • இஷ்டதெய்வம் (Three Tiers of Deities)', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 2: நம்ம சாமி (பாகம் 2C - பெரிய எழுத்து அச்சுப் பிரதி)');

    // 3 Large Columns
    function drawGiantTier(x, y, w, h, title, col, pts, verse) {
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, x, y, w, h, 16, true, false);
        ctx.strokeStyle = col;
        ctx.lineWidth = 2.5;
        roundRect(ctx, x, y, w, h, 16, false, true);

        ctx.fillStyle = col;
        roundRect(ctx, x, y, w, 70, 16, true, false);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px "Noto Sans Tamil"';
        ctx.textAlign = 'center';
        ctx.fillText(title, x + w / 2, y + 48);
        ctx.textAlign = 'left';

        let curY = y + 115;
        for (const p of pts) {
            ctx.fillStyle = col;
            ctx.font = 'bold 26px "Noto Sans Tamil"';
            ctx.fillText(p.h, x + 25, curY);
            curY += 38;

            ctx.fillStyle = '#1e293b';
            ctx.font = '24px "Noto Sans Tamil"';
            curY = drawWrappedText(ctx, p.b, x + 35, curY, w - 60, 38);
            curY += 16;
        }

        if (verse) {
            ctx.fillStyle = '#fefce8';
            roundRect(ctx, x + 20, curY, w - 40, 220, 12, true, false);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            roundRect(ctx, x + 20, curY, w - 40, 220, 12, false, true);

            ctx.fillStyle = '#9a3412';
            ctx.font = 'bold 23px "Noto Sans Tamil"';
            ctx.textAlign = 'center';
            ctx.fillText(verse.t1, x + w / 2, curY + 50);
            ctx.fillText(verse.t2, x + w / 2, curY + 95);
            ctx.fillText(verse.t3, x + w / 2, curY + 140);
            ctx.fillStyle = '#64748b';
            ctx.font = '20px "Noto Sans Tamil"';
            ctx.fillText(verse.auth, x + w / 2, curY + 190);
            ctx.textAlign = 'left';
        }
    }

    drawGiantTier(60, 290, 470, 1680, 'நிலை 1: குலதெய்வம்', '#d97706', [
        { h: '• குலம் என்றால் என்ன?:', b: 'ஒரே முன்னோர்களை அடிப்படையாகக் கொண்டு, இரத்த உறவு மற்றும் வம்சாவழி பாரம்பரியத்தால் இணைக்கப்பட்ட பெருங்குடும்பம்.' },
        { h: '• குலத்தைக் காப்பவர்:', b: 'இந்த வம்சத்தைக் காப்பவரே குலசாமி. குலதெய்வ வழிபாடு ஒருபோதும் விடுபடக் கூடாது.' },
        { h: '• குடும்ப ஒற்றுமை:', b: 'ஆண்டுக்கொரு முறையாவது குடும்பத்துடன் சென்று வணங்குவது வம்சவிருத்தியையும் பாதுகாப்பையும் தரும்.' }
    ], {
        t1: '"குலம் தரும் செல்வம் தந்திடும்',
        t2: 'அடியார் படுதுயர் ஆயின எல்லாம்',
        t3: 'நிலந்தரம் செய்யும்..."',
        auth: '— திருமங்கையாழ்வார்'
    });

    drawGiantTier(565, 290, 470, 1680, 'நிலை 2: கிராம சாமி', '#0284c7', [
        { h: '• சமுதாய ஒருமைப்பாடு:', b: 'ஊர் மக்கள் அனைவரையும், அனைத்து சமுதாய மக்களையும் பேதமின்றி ஒன்றிணைக்கும் பெருஞ்சக்தியாக கிராமக் கோவில் விளங்குகிறது.' },
        { h: '• எல்லை காவல் தெய்வங்கள்:', b: 'அய்யனார், மாரியம்மன், காளியம்மன், முனீஸ்வரர் போன்ற தெய்வங்கள் ஊரின் காவல் அரணாக விளங்குகின்றன.' },
        { h: '• ஊர் செழிப்பு & நலம்:', b: 'மழை வளம், விவசாய முன்னேற்றம், நோய் நொடிகள் நீங்குதல் மற்றும் கிராமிய நல்லிணக்கத்திற்கு ஊர் திருவிழாக்களே மையம்.' }
    ]);

    drawGiantTier(1070, 290, 470, 1680, 'நிலை 3: இஷ்டதெய்வம்', '#db2777', [
        { h: '• தனிமனித மேம்பாடு:', b: 'தனிமனித மன அமைதியையும், ஆன்மீக மேம்பாட்டையும் உறுதி செய்வது இஷ்டதெய்வம்.' },
        { h: '• பூரண ஆன்மீகச் சுதந்திரம்:', b: 'தனக்குப் பிடித்த இறைவனைத் தேர்ந்தெடுத்து வழிபடும் பூரண உரிமை இந்து தர்மத்தின் உன்னத சிறப்பு.' },
        { h: '• நண்பனைப் போன்ற பக்தி:', b: 'சிவன், முருகன், பெருமாள் என உள்ளம் உருகி நினைக்கும் தெய்வம் உற்ற நண்பனைப் போல அரவணைக்கிறது.' }
    ]);

    const outPath = path.join(OUTPUT_DIR, '2C_நம்ம_சாமி_3_வழிபாட்டு_நிலைகள்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

// Sheet 2D: கம்பராமாயணம் & கருணைக்கதைகள்
async function generateSheet2D() {
    const width = 1600, height = 2150;
    const { canvas, ctx } = createBasePoster(width, height, 'sami', '2D', 'தலைப்பு 2: நம்ம சாமி — கம்பராமாயணம் & கருணைக்கதைகள்', 'எங்கும் நிறைந்த இறைவன் பாடல் & எளியோர்க்கு எளிய கருணாமூர்த்தி', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 2: நம்ம சாமி (பாகம் 2D - பெரிய எழுத்து அச்சுப் பிரதி)');

    // 2.5 Kamban Verse Box
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 60, 290, 1480, 840, 18, true, false);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    roundRect(ctx, 60, 290, 1480, 840, 18, false, true);

    ctx.fillStyle = '#ffe4e6';
    roundRect(ctx, 60, 290, 1480, 80, 18, true, false);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(78, 290, 1444, 6);

    ctx.fillStyle = '#881337';
    ctx.font = 'bold 31px "Noto Sans Tamil"';
    ctx.textAlign = 'left';
    ctx.fillText('2.5 கம்பராமாயணம் — இரணியன் வதைப்படலம் (Audio 8, 17, 19)', 90, 344);

    // Verse Banner
    ctx.fillStyle = '#fff1f2';
    roundRect(ctx, 90, 395, 1420, 220, 14, true, false);
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 90, 395, 1420, 220, 14, false, true);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#9f1239';
    ctx.font = 'bold 26px "Noto Sans Tamil"';
    ctx.fillText('"சாணினும் உளன்; ஓர் தன்மை அணுவினைச் சத கூறிட்ட கோணினும் உளன்;', 800, 450);
    ctx.fillText('மா மேருக் குன்றினும் உளன்; இந் நின்ற தூணினும் உளன்;', 800, 500);
    ctx.fillText('நீ சொன்ன சொல்லினும் உளன்; இத் தன்மை காணுதி விரைவின்” என்றான்;', 800, 550);

    ctx.fillStyle = '#64748b';
    ctx.font = '22px "Noto Sans Tamil"';
    ctx.fillText('— கவிச்சக்கரவர்த்தி கம்பர் (கம்பராமாயணம்)', 800, 595);

    // Meaning List Below
    ctx.textAlign = 'left';
    ctx.fillStyle = '#be123c';
    ctx.font = 'bold 28px "Noto Sans Tamil"';
    ctx.fillText('• பிரகலாதனின் வாக்கு — 4 முக்கிய விளக்கங்கள்:', 90, 660);

    ctx.fillStyle = '#1e293b';
    ctx.font = '25px "Noto Sans Tamil"';
    let ky = 705;
    ky = drawWrappedText(ctx, '1. சாண் அளவிலும் இறைவன் இருப்பான்\n2. அணுவை 100 கூறாக்கிய நுண்மையிலும் இறைவன் இருப்பான்\n3. மாமேரு மலையிலும் இருப்பான், எதிரில் உள்ள தூணிலும் இருப்பான்\n4. நீ பேசிய சொல்லிலும் இருப்பான் என்று இறைவனின் சர்வ வியாபகத்தை நிலைநாட்டுகிறான்.', 110, ky, 1380, 40);

    // 2.6 Divine Grace Stories
    drawGiantCard(ctx, 60, 1170, 1480, 850, '2.6 கருணாமூர்த்தி இறைவனின் திருவிளையாடல்கள் (Audio 17, 19)', [
        {
            head: '• தாயுமானவர் வரலாறு (திருச்சி):',
            body: 'பிரசவ வேதனையில் தவித்த கர்ப்பிணிப் பெண் ரத்னாவதிக்கு அவளது தாயின் வடிவிலேயே வந்து பிரசவம் பார்த்து கருணை பொழிந்த தாயான சிவபெருமான்.'
        },
        {
            head: '• வந்தி பாட்டி வரலாறு (மதுரை):',
            body: 'கூலியாகப் பிட்டு உண்டு வைகை அணை கட்ட மண் சுமந்து பிரம்படி பட்ட எளியோரின் பரம்பொருள்.'
        },
        {
            head: '• அபிராமி பட்டர் பக்தி (திருக்கடையூர்):',
            body: 'பக்தனின் வாக்கு தவறாமல் இருக்க தை அமாவாசையை பௌர்ணமி முழுநிலவாக்கிய அம்பிகையின் மாபெரும் திருவருள்.'
        },
        {
            head: '• அவ்வையார் & ஆழ்வார்கள் திருப்பாசுரங்கள்:',
            body: '"அணுவிற்கணுவாய் அப்பாலுக்கு அப்பாலாய்" (அகவல்) • "பச்சை மாமலை போல் மேனி" (தொண்டரடிப்பொடியாழ்வார்).'
        }
    ], 'sami');

    const outPath = path.join(OUTPUT_DIR, '2D_நம்ம_சாமி_கம்பராமாயணம்_கருணைக்கதைகள்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

// =========================================================================
// TOPIC 3: நம்ம கோவில் (NAMMA KOVIL) — 4 PRINTABLE SHEETS (3A, 3B, 3C, 3D) - BRIGHT THEME
// =========================================================================

// Sheet 3A: சொல்லிலக்கணம் & வழிபாட்டு வடிவங்கள்
async function generateSheet3A() {
    const width = 1600, height = 2100;
    const { canvas, ctx } = createBasePoster(width, height, 'kovil', '3A', 'தலைப்பு 3: நம்ம கோவில் — சொல்லிலக்கணம் & வடிவங்கள்', 'கோவில் & ஆலயம் சொல்லிலக்கணம் • 4 யுகங்கள் • 5 வழிபாட்டு வடிவங்கள்', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 3: நம்ம கோவில் (பாகம் 3A - பெரிய எழுத்து அச்சுப் பிரதி)');

    drawGiantCard(ctx, 60, 290, 1480, 780, '3.1 கோவில் & ஆலயம் சொல்லிலக்கணம் (Audio 11)', [
        {
            head: '• கோவில் (கோ + இல்):',
            body: 'கோ = தலைவன் (இறைவன்) | இல் = வீடு (வசிப்பிடம்).\nகோவில் என்றால் "இறைவனின் வசிப்பிடம் / அரண்மனை" என்று பொருள்.'
        },
        {
            head: '• ஆலயம் (ஆ + லயம்):',
            body: 'ஆ = ஆன்மா / ஜீவாத்மா | லயம் = ஒடுங்குதல் (கரைதல்).\nஆலயம் என்றால் "ஜீவாத்மா இறைவனிடம் லயித்து அமைதி பெறும் புனித இடம்".'
        },
        {
            head: '• நான்கு யுகங்களும் கலியுக விக்ரக வழிபாடும்:',
            body: 'கிருத, திரேதா, துவாபர யுகங்களைத் தொடர்ந்து கலியுகத்தில் மனித மனதை ஒருமுகப்படுத்தி பக்குவப்படுத்த உருவ மூர்த்தி வழிபாடு அருளப்பட்டது.'
        }
    ], 'kovil');

    drawGiantCard(ctx, 60, 1110, 1480, 850, '3.2 ஐந்து வகை வழிபாட்டு வடிவங்கள் (Audio 11)', [
        {
            head: '1. பட வழிபாடு:',
            body: 'இல்லங்களில் இறைவனின் திருவுருவப் படங்களை வைத்து நெய் தீபமிட்டு வழிபடுவது.'
        },
        {
            head: '2. கல் & பளிங்குச் சிலைகள்:',
            body: 'ஆகம முறைப்படி வடிக்கப்பட்டு முறைப்படி பிரதிஷ்டை செய்யப்பட்ட மூலவர் திருமேனிகள்.'
        },
        {
            head: '3. யந்திர வழிபாடு:',
            body: 'பிரபஞ்ச ஆற்றலை ஈர்க்கும் வடிவியல் தகடுகள் (ஸ்ரீசக்ரம் போன்ற யந்திரங்கள்).'
        },
        {
            head: '4. விளக்கு & அக்கினி (யாகம்):',
            body: 'தீபத்தை ஜோதி வடிவமாகவும், ஹோம குண்டத்தில் அக்னி மூலமாகவும் ஆராதித்தல்.'
        },
        {
            head: '5. மண் & பஞ்சலோக மூர்த்திகள்:',
            body: 'பஞ்சபூத தத்துவ மண் பொம்மைகள் & ஊர்வலம் வரும் உற்சவ திருமேனிகள்.'
        }
    ], 'kovil');

    const outPath = path.join(OUTPUT_DIR, '3A_நம்ம_கோவில்_சொல்லிலக்கணம்_வழிபாட்டு_வடிவங்கள்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

// Sheet 3B: திருமூலர் பாடல்கள் & தியாகங்கள்
async function generateSheet3B() {
    const width = 1600, height = 2100;
    const { canvas, ctx } = createBasePoster(width, height, 'kovil', '3B', 'தலைப்பு 3: நம்ம கோவில் — திருமூலர் பாடல்கள் & தியாகங்கள்', 'திருமூலர் அருளிய 2 திருமந்திரப் பாடல்கள் & மன்னர்கள்-பக்தர்கள் தியாகம்', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 3: நம்ம கோவில் (பாகம் 3B - பெரிய எழுத்து அச்சுப் பிரதி)');

    // 3.4 Thirumoolar Songs Box
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 60, 290, 1480, 820, 18, true, false);
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 2.5;
    roundRect(ctx, 60, 290, 1480, 820, 18, false, true);

    ctx.fillStyle = '#ccfbf1';
    roundRect(ctx, 60, 290, 1480, 80, 18, true, false);
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(78, 290, 1444, 6);

    ctx.fillStyle = '#115e59';
    ctx.font = 'bold 31px "Noto Sans Tamil"';
    ctx.textAlign = 'left';
    ctx.fillText('3.4 திருமூலர் திருமந்திரப் பாடல்கள் (Audio 11)', 90, 344);

    // Song 1 Box
    ctx.fillStyle = '#f0fdfa';
    roundRect(ctx, 90, 395, 1420, 310, 14, true, false);
    ctx.strokeStyle = '#5eead4';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 90, 395, 1420, 310, 14, false, true);

    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 28px "Noto Sans Tamil"';
    ctx.fillText('பாடல் 1: நடமாடும் கோவில் (மக்கள் தொண்டே மகேசன் தொண்டு)', 120, 445);
    ctx.fillStyle = '#115e59';
    ctx.font = 'bold 26px "Noto Sans Tamil"';
    ctx.fillText('"படமாடக் கோயில் பகவற்கு ஒன்று ஈயில் நடமாடக் கோயில் நம்பர்க்கு அங்கு ஆகா', 120, 500);
    ctx.fillText('நடமாடக் கோயில் நம்பர்க்கு ஒன்று ஈயில் படமாடக் கோயில் பகவற்கு அது ஆமே"', 120, 545);
    ctx.fillStyle = '#334155';
    ctx.font = '24px "Noto Sans Tamil"';
    ctx.fillText('பொருள்: சக மனிதனுக்குச் செய்யும் தொண்டே இறைவனை நேரில் சென்றடையும் உன்னத வழிபாடு.', 120, 620);

    // Song 2 Box
    ctx.fillStyle = '#f0fdfa';
    roundRect(ctx, 90, 735, 1420, 340, 14, true, false);
    ctx.strokeStyle = '#5eead4';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 90, 735, 1420, 340, 14, false, true);

    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 28px "Noto Sans Tamil"';
    ctx.fillText('பாடல் 2: உடம்பே ஆலயம் (சரீரமே திருக்கோவில்)', 120, 785);
    ctx.fillStyle = '#115e59';
    ctx.font = 'bold 26px "Noto Sans Tamil"';
    ctx.fillText('"உள்ளம் பெருங்கோயில் ஊனுடம்பு ஆலயம் வள்ளற் பிரானார்க்கு வாய் கோபுர வாசல்', 120, 840);
    ctx.fillText('தெள்ளத் தெளிந்தார்க்குச் சீவன் சிவலிங்கம் கள்ளப் புலனைந்தும் காளா மணிவிளக்கே"', 120, 885);
    ctx.fillStyle = '#334155';
    ctx.font = '24px "Noto Sans Tamil"';
    ctx.fillText('பொருள்: உள்ளமே பெருங்கோவில்; உடலே ஆலயம்; வாயே கோபுர வாசல்; சீவனே சிவலிங்கம்.', 120, 960);

    // 3.5 Kings & Devotees Sacrifices
    drawGiantCard(ctx, 60, 1145, 1480, 815, '3.5 மன்னர்கள் & பக்தர்களின் அளப்பரிய தியாகங்கள் (Audio 12, 13)', [
        {
            head: '• சேரன் செங்குட்டுவன் கண்ணகி வரலாறு:',
            body: 'கண்ணகிக்குக் கோவில் அமைக்க இமயமலையிலிருந்து புனிதக் கல் கொண்டு வந்த தியாக வரலாறு.'
        },
        {
            head: '• நாயன்மார்கள் பக்தி (குங்கிலியக்கலயர் & பூசலார்):',
            body: 'கழுத்தில் கயிறு கட்டி சிவலிங்கத்தை நிமிர்த்திய குங்கிலியக்கலயர் பக்தி • மனதிற்குள்ளேயே கோவில் கட்டி இறைவனை எழுந்தருளச் செய்த பூசலார் நாயனார் பெருமை.'
        },
        {
            head: '• தஞ்சைப் பெரிய கோவில் அழகி பாட்டி:',
            body: 'மாமன்னன் ராஜராஜ சோழன் கட்டிய பெரிய கோவிலின் விமான உச்சிக்கு ஒற்றைக் கருங்கல்லைத் தந்த அழகி பாட்டியின் தூய பக்தி.'
        }
    ], 'kovil');

    const outPath = path.join(OUTPUT_DIR, '3B_நம்ம_கோவில்_திருமூலர்_பாடல்கள்_தியாகங்கள்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

// Sheet 3C: மூர்த்தி-தலம்-தீர்த்தம் & மகான்கள்
async function generateSheet3C() {
    const width = 1600, height = 2100;
    const { canvas, ctx } = createBasePoster(width, height, 'kovil', '3C', 'தலைப்பு 3: நம்ம கோவில் — தலங்கள் & மகான்கள்', 'மூர்த்தி-தலம்-தீர்த்தம் • பஞ்சபூதத் தலங்கள் • அவதரித்த மகான்கள்', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 3: நம்ம கோவில் (பாகம் 3C - பெரிய எழுத்து அச்சுப் பிரதி)');

    drawGiantCard(ctx, 60, 290, 1480, 830, '3.6 மூர்த்தி - தலம் - தீர்த்தம் (கருடபுராண முக்கூட்டு - Audio 12, 13)', [
        {
            head: '• பாரதத்தின் புனிதத் தலங்கள்:',
            body: '52 சக்தி பீடங்கள் • 12 ஜோதிர்லிங்கங்கள் • 108 வைணவ திவ்ய தேசங்கள் • பாடல் பெற்ற சிவத்தலங்கள்.'
        },
        {
            head: '• பஞ்சபூதத் தலங்கள் (ஐம்பூத அறிவியல்):',
            body: '1. நிலம் (காஞ்சிபுரம்) — ஏகாம்பரேஸ்வரர்\n2. நீர் (திருவானைக்காவல்) — ஜம்புகேஸ்வரர்\n3. நெருப்பு (திருவண்ணாமலை) — அருணாசலேஸ்வரர்\n4. காற்று (திருக்காளஹஸ்தி) — காளத்தீஸ்வரர்\n5. ஆகாயம் (சிதம்பரம்) — நடராஜர்'
        },
        {
            head: '• புண்ணிய நதிகள் & தீர்த்தங்கள்:',
            body: 'தாமிரபரணி, வைகை, காவிரி, தென்பெண்ணை, பாலாறு போன்ற ஜீவநதிகளும் திருக்குளங்களும்.'
        }
    ], 'kovil');

    drawGiantCard(ctx, 60, 1160, 1480, 800, '3.7 அவதரித்த மகான்கள் & ஆகம வழிபாட்டுச் சுதந்திரம் (Audio 12, 13)', [
        {
            head: '• அவதரித்த ஞானிகளும் மகான்களும்:',
            body: 'ஆதிசங்கரர் (காலடி) • ஸ்ரீ ராமானுஜர் (ஸ்ரீபெரும்புதூர்) • வள்ளலார் ராமலிங்க அடிகள் (வடலூர்) • தாயுமானவர் சுவாமிகள் (திருச்சி) • பட்டினத்தார் (திருவொற்றியூர்) • கிருபானந்த வாரியார் • பாம்பன் சுவாமிகள்.'
        },
        {
            head: '• ஆகம வழிபாட்டுச் சுதந்திரம் (மந்திரம்-யந்திரம்-தந்திரம்):',
            body: 'ஒவ்வொரு மனிதரும் தனக்கு விருப்பமான முறையில், பிடித்த தெய்வத்தை வழிபடும் பூரண ஆன்மீகச் சுதந்திரமே நமது சனாதன தர்மத்தை என்றும் சிரஞ்சீவியாக வாழ வைக்கிறது.'
        }
    ], 'kovil');

    const outPath = path.join(OUTPUT_DIR, '3C_நம்ம_கோவில்_மூர்த்தி_தலம்_தீர்த்தம்_மகான்கள்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

// Sheet 3D: 10 சமுதாயப் பெருமைகள்
async function generateSheet3D() {
    const width = 1600, height = 2300;
    const { canvas, ctx } = createBasePoster(width, height, 'kovil', '3D', 'தலைப்பு 3: நம்ம கோவில் — 10 சமுதாயப் பெருமைகள்', 'ஆகம விதிகளும் திருக்கோவிலின் 10 சமுதாயப் பெருமைகளும் (Audio 13)', 'நம்ம சாமி நம்ம கோவில் • தலைப்பு 3: நம்ம கோவில் (பாகம் 3D - பெரிய எழுத்து அச்சுப் பிரதி)');

    const benefits = [
        { num: '1', h: 'நகர நிர்மாணம்:', b: 'ஊரின் மையத்தில் கருவறை அமைத்து, அதைச் சுற்றி சமச்சீரான மாட வீதிகளை ஆகம முறைப்படி வடிவமைத்தனர்.' },
        { num: '2', h: 'தூய்மையான வீதிகள் & வடிகால்:', b: 'தெருக்கள் அகலமாகவும், மழைநீர் தேங்காத சிறந்த வடிகால் அமைப்போடும் கட்டப்பட்டன.' },
        { num: '3', h: 'ராஜகோபுரங்கள் (இடிதாங்கி):', b: 'கோபுர கலசங்கள் இடிதாங்கிகளாகவும் தானியக் களஞ்சியங்களாகவும் செயல்பட்டன.' },
        { num: '4', h: 'திருக்குளங்கள் & நிலத்தடி நீர்:', b: 'மழைநீரைச் சேகரித்து நிலத்தடி நீர்மட்டத்தை உயர்த்தும் மிகப்பெரிய நீராதாரங்கள்.' },
        { num: '5', h: 'கல்வெட்டுகள் & ஆவணங்கள்:', b: 'அரச கட்டளைகள், தானங்கள், வரி விலக்குகள் பதியப்பட்ட வரலாற்று ஆவணங்கள்.' },
        { num: '6', h: '64 கலைகளின் பண்பாட்டு அரங்கம்:', b: 'இயல், இசை, நாடகம், சிற்பக்கலை மற்றும் நூல் அரங்கேற்றங்கள் நடந்த அரங்கம்.' },
        { num: '7', h: 'சமூக நல்லிணக்கத் திருவிழாக்கள்:', b: 'அனைத்து சமுதாய மக்களும் ஒற்றுமையுடன் கொண்டாடும் பெருவிழாக்கள்.' },
        { num: '8', h: 'உள்ளூர்ப் பொருளாதாரம்:', b: 'பூக்கள், பால், எண்ணெய், கைவினைப் பொருட்கள் மூலம் ஆயிரக்கணக்கானோருக்கு வாழ்வாதாரம்.' },
        { num: '9', h: 'தேர்த்திருவிழா சமத்துவ வடம்:', b: 'சாதி, மத, ஏழை, பணக்கார பேதமின்றி அனைவரும் ஒன்றுகூடி தேர் இழுக்கும் சமத்துவ நெறி.' },
        { num: '10', h: 'தியாக வரலாறு & 5 நல்வழிப் பண்புகள்:', b: 'கோவில் நம்மை: 1. ஒருங்கிணைக்கிறது 2. நெறிப்படுத்துகிறது 3. மகிழ்வுறச் செய்கிறது 4. பிறவிப்பயன் பெறச் செய்கிறது 5. தலைமுறையை நல்வழிப்படுத்துகிறது!' }
    ];

    let rowY = 290;
    for (let i = 0; i < benefits.length; i += 2) {
        const b1 = benefits[i];
        const b2 = benefits[i + 1];

        // Box 1
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, 60, rowY, 725, 340, 16, true, false);
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 2;
        roundRect(ctx, 60, rowY, 725, 340, 16, false, true);

        ctx.fillStyle = '#ccfbf1';
        roundRect(ctx, 85, rowY + 20, 50, 50, 10, true, false);
        ctx.fillStyle = '#0f766e';
        ctx.font = 'bold 30px "Noto Sans Tamil"';
        ctx.textAlign = 'center';
        ctx.fillText(b1.num, 110, rowY + 56);
        ctx.textAlign = 'left';

        ctx.fillStyle = '#0f766e';
        ctx.font = 'bold 28px "Noto Sans Tamil"';
        ctx.fillText(b1.h, 150, rowY + 56);

        ctx.fillStyle = '#1e293b';
        ctx.font = '24px "Noto Sans Tamil"';
        drawWrappedText(ctx, b1.b, 85, rowY + 110, 675, 38);

        // Box 2
        if (b2) {
            ctx.fillStyle = '#ffffff';
            roundRect(ctx, 815, rowY, 725, 340, 16, true, false);
            ctx.strokeStyle = '#14b8a6';
            ctx.lineWidth = 2;
            roundRect(ctx, 815, rowY, 725, 340, 16, false, true);

            ctx.fillStyle = '#ccfbf1';
            roundRect(ctx, 840, rowY + 20, 50, 50, 10, true, false);
            ctx.fillStyle = '#0f766e';
            ctx.font = 'bold 30px "Noto Sans Tamil"';
            ctx.textAlign = 'center';
            ctx.fillText(b2.num, 865, rowY + 56);
            ctx.textAlign = 'left';

            ctx.fillStyle = '#0f766e';
            ctx.font = 'bold 28px "Noto Sans Tamil"';
            ctx.fillText(b2.h, 905, rowY + 56);

            ctx.fillStyle = '#1e293b';
            ctx.font = '24px "Noto Sans Tamil"';
            drawWrappedText(ctx, b2.b, 840, rowY + 110, 675, 38);
        }

        rowY += 370;
    }

    const outPath = path.join(OUTPUT_DIR, '3D_நம்ம_கோவில்_10_சமுதாயப்_பெருமைகள்.png');
    fs.writeFileSync(outPath, await canvas.toBuffer('png'));
    console.log(`Saved: ${outPath}`);
}

async function renderAll() {
    console.log('Rendering 12 Giant Printable Poster Sheets in Bright / Light Theme...');
    await generateSheet1A();
    await generateSheet1B();
    await generateSheet1C();
    await generateSheet1D();

    await generateSheet2A();
    await generateSheet2B();
    await generateSheet2C();
    await generateSheet2D();

    await generateSheet3A();
    await generateSheet3B();
    await generateSheet3C();
    await generateSheet3D();
    console.log('ALL 12 BRIGHT-THEME GIANT PRINTABLE POSTERS GENERATED SUCCESSFULLY!');
}

renderAll().catch(err => {
    console.error(err);
    process.exit(1);
});
