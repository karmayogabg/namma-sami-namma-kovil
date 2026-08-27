const { Canvas, FontLibrary } = require('skia-canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'NSNK-ProgramBrief');

// Register Tamil Font
FontLibrary.use('Noto Sans Tamil', [
    path.join(__dirname, 'fonts', 'NotoSansTamil-Regular.ttf'),
    path.join(__dirname, 'fonts', 'NotoSansTamil-Bold.ttf')
]);

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

async function renderAgendaPoster() {
    const width = 1600;
    const height = 2540;
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Background (Warm Ivory / Pearl Bright Theme)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#fefce8');
    bgGrad.addColorStop(0.3, '#ffffff');
    bgGrad.addColorStop(0.7, '#fffbeb');
    bgGrad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Outer Border Frame
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    roundRect(ctx, 30, 30, width - 60, height - 60, 24, false, true);

    ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 42, 42, width - 84, height - 84, 18, false, true);

    // 3. Header Banner
    const headGrad = ctx.createLinearGradient(60, 60, width - 60, 260);
    headGrad.addColorStop(0, '#9a3412');
    headGrad.addColorStop(0.5, '#d97706');
    headGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = headGrad;
    roundRect(ctx, 60, 60, width - 120, 190, 18, true, false);

    // Header Badge Icon Box
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 85, 85, 140, 140, 14, true, false);
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 36px "Noto Sans Tamil"';
    ctx.textAlign = 'center';
    ctx.fillText('3 மணி', 155, 145);
    ctx.font = 'bold 24px "Noto Sans Tamil"';
    ctx.fillText('நேரம்', 155, 190);

    // Header Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Noto Sans Tamil"';
    ctx.fillText('நம்ம சாமி நம்ம கோவில் — பயிற்சிப் பட்டறை அட்டவணை', 255, 135);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 24px "Noto Sans Tamil"';
    ctx.fillText('Workshop & Training Program Schedule • மொத்தம் 14 கட்டங்கள் (180 நிமிடங்கள்)', 255, 185);

    // 4. Session Stages Overview Strip (3 Phase Cards)
    const phases = [
        { title: 'கட்டம் 1: தொடக்கம் & அறிமுகம்', time: '35 நிமிடம் (1-3)', bg: '#fef3c7', col: '#9a3412', border: '#f59e0b' },
        { title: 'கட்டம் 2: மூன்று முதன்மைத் தூண்கள்', time: '115 நிமிடம் (4-12)', bg: '#fee2e2', col: '#9f1239', border: '#f43f5e' },
        { title: 'கட்டம் 3: மாதிரி & சமர்ப்பணம்', time: '30 நிமிடம் (13-14)', bg: '#ccfbf1', col: '#115e59', border: '#14b8a6' }
    ];

    let phX = 60;
    for (const ph of phases) {
        ctx.fillStyle = ph.bg;
        roundRect(ctx, phX, 275, 470, 75, 12, true, false);
        ctx.strokeStyle = ph.border;
        ctx.lineWidth = 1.5;
        roundRect(ctx, phX, 275, 470, 75, 12, false, true);

        ctx.textAlign = 'center';
        ctx.fillStyle = ph.col;
        ctx.font = 'bold 22px "Noto Sans Tamil"';
        ctx.fillText(ph.title, phX + 235, 308);
        ctx.font = 'bold 18px "Noto Sans Tamil"';
        ctx.fillStyle = '#475569';
        ctx.fillText(ph.time, phX + 235, 335);

        phX += 505;
    }

    // 5. Main 14 Timetable Rows
    const agendaItems = [
        {
            num: '1',
            title: 'பிரார்த்தனை (Prarthana)',
            time: '5 நிமி',
            desc: 'இறை வணக்கம், அமைதிப் பிரார்த்தனை & மங்கள தொடக்கம்',
            type: 'intro',
            accent: '#b45309',
            bg: '#ffffff'
        },
        {
            num: '2',
            title: 'சுய அறிமுகம் (Self Intro)',
            time: '15 நிமி',
            desc: 'பங்கேற்பாளர்கள், பயிற்றுநர்கள் மற்றும் ஒருங்கிணைப்பாளர்கள் பரஸ்பர அறிமுகம்',
            type: 'intro',
            accent: '#b45309',
            bg: '#ffffff'
        },
        {
            num: '3',
            title: 'திட்டத்தின் நோக்கம் (Motto of Program)',
            time: '15 நிமி',
            desc: 'நம்ம சாமி நம்ம கோவில் இயக்கத்தின் அடிப்படை இலக்கு, பார்வை & சமூகத் தேவை',
            type: 'intro',
            accent: '#b45309',
            bg: '#ffffff'
        },
        {
            num: '4',
            title: 'தலைப்பு 1: நம்ம — விளக்கம் (Namma Exp)',
            time: '20 நிமி',
            desc: 'தாய்மொழி, வணக்கம் மரபு, பாரத உடை, தமிழ் வானியல், குடும்பம், உறவுகள் & பஞ்சாங்கம்',
            type: 'topic1',
            accent: '#d97706',
            bg: '#fffbeb'
        },
        {
            num: '5',
            title: 'தலைப்பு 1: செயல்பாடுகள் (Namma Activity)',
            time: '10 நிமி',
            desc: 'சுய அடையாளம், உறவுமுறைகள் & பாரம்பரியப் பெருமிதம் குறித்த குழு விவாதம்',
            type: 'topic1',
            accent: '#d97706',
            bg: '#fffbeb'
        },
        {
            num: '6',
            title: 'தேநீர் இடைவேளை (Tea Break)',
            time: '15 நிமி',
            desc: 'தேநீர் அருந்துதல், புத்துணர்ச்சி & பங்கேற்பாளர்கள் நட்புறவுப் பகிர்வு',
            type: 'break',
            accent: '#0284c7',
            bg: '#f0f9ff'
        },
        {
            num: '7',
            title: 'தலைப்பு 2: நம்ம சாமி — விளக்கம் (Namma Saami Exp)',
            time: '20 நிமி',
            desc: 'சாமி யார்? "உடையவர்" • கரதர்சனம் • ராமகிருஷ்ணர் உவமை • 3 நிலைகள் • கம்பன் பாடல்',
            type: 'topic2',
            accent: '#be123c',
            bg: '#fff1f2'
        },
        {
            num: '8',
            title: 'தலைப்பு 2: செயல்பாடுகள் (Namma Saami Act)',
            time: '10 நிமி',
            desc: 'குலதெய்வம், கிராம சாமி & இஷ்டதெய்வம் வழிபாட்டு அனுபவங்கள் & வழிபாட்டுப் பயிற்சி',
            type: 'topic2',
            accent: '#be123c',
            bg: '#fff1f2'
        },
        {
            num: '9',
            title: 'சிறிய இடைவேளை (Short Break)',
            time: '5 நிமி',
            desc: 'அடுத்த அமர்விற்கான சிறிய ஆசுவாச இடைவேளை',
            type: 'break',
            accent: '#64748b',
            bg: '#f8fafc'
        },
        {
            num: '10',
            title: 'தலைப்பு 3: நம்ம கோவில் — விளக்கம் (Namma Kovil Exp)',
            time: '20 நிமி',
            desc: 'கோவில் சொல்லிலக்கணம் • 5 வழிபாட்டு வடிவங்கள் • திருமூலர் பாடல்கள் • 10 சமுதாயப் பெருமைகள்',
            type: 'topic3',
            accent: '#0f766e',
            bg: '#f0fdfa'
        },
        {
            num: '11',
            title: 'தலைப்பு 3: செயல்பாடுகள் (Namma Kovil Act)',
            time: '10 நிமி',
            desc: 'கோவில் பராமரிப்பு, சமுதாய ஒற்றுமை & ஆலயத் திருத்தொண்டு திட்டமிடல்',
            type: 'topic3',
            accent: '#0f766e',
            bg: '#f0fdfa'
        },
        {
            num: '12',
            title: 'சிறிய இடைவேளை (Short Break)',
            time: '5 நிமி',
            desc: 'கள மாதிரிப் பயிற்சிக்கான தயார் நிலை இடைவேளை',
            type: 'break',
            accent: '#64748b',
            bg: '#f8fafc'
        },
        {
            num: '13',
            title: 'கள மாதிரிப் பயிற்சி (Trial Calling & Survey Mock)',
            time: '20 நிமி',
            desc: '3 முதன்மைக் கேள்விகள் (பெயர் பொருள், பரம்பரை, கோத்திரம்) தொலைபேசி அழைப்பு மாதிரிப் பயிற்சி',
            type: 'trial',
            accent: '#4338ca',
            bg: '#eef2ff'
        },
        {
            num: '14',
            title: 'சங்கல்பம் & சமர்ப்பணம் (Sankalp & Samarpanam)',
            time: '10 நிமி',
            desc: 'தர்மப் பணிக்கான உளமார்ந்த உறுதிமொழி, நன்றி நவிலல் மற்றும் நிறைவு சமர்ப்பணம்',
            type: 'final',
            accent: '#059669',
            bg: '#ecfdf5'
        }
    ];

    let rowY = 370;
    const rowH = 120;
    const gap = 16;

    for (const it of agendaItems) {
        // Card Body
        ctx.fillStyle = it.bg;
        roundRect(ctx, 60, rowY, 1480, rowH, 14, true, false);
        ctx.strokeStyle = it.accent;
        ctx.lineWidth = 2;
        roundRect(ctx, 60, rowY, 1480, rowH, 14, false, true);

        // Left Colored Indicator Strip
        ctx.fillStyle = it.accent;
        roundRect(ctx, 60, rowY, 12, rowH, 6, true, false);

        // Number Badge
        ctx.fillStyle = it.accent;
        roundRect(ctx, 90, rowY + 22, 75, 75, 12, true, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Noto Sans Tamil"';
        ctx.textAlign = 'center';
        ctx.fillText(it.num, 127, rowY + 72);

        // Title
        ctx.textAlign = 'left';
        ctx.fillStyle = it.accent;
        ctx.font = 'bold 28px "Noto Sans Tamil"';
        ctx.fillText(it.title, 185, rowY + 50);

        // Description
        ctx.fillStyle = '#334155';
        ctx.font = '21px "Noto Sans Tamil"';
        ctx.fillText(it.desc, 185, rowY + 92);

        // Right Time Duration Pill
        ctx.fillStyle = it.accent;
        roundRect(ctx, 1370, rowY + 32, 145, 55, 28, true, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 23px "Noto Sans Tamil"';
        ctx.textAlign = 'center';
        ctx.fillText(it.time, 1442, rowY + 68);

        rowY += rowH + gap;
    }

    // 6. Summary Footer Banner
    const footY = 2360;
    ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
    roundRect(ctx, 60, footY, 1480, 75, 14, true, false);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 60, footY, 1480, 75, 14, false, true);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#9a3412';
    ctx.font = 'bold 25px "Noto Sans Tamil"';
    ctx.fillText('✨ மொத்தம் 14 கட்டங்கள் • 180 நிமிடங்கள் (3 மணி நேரம்) • நம்ம சாமி நம்ம கோவில் அதிகாரப்பூர்வ பயிற்சி அட்டவணை ✨', width / 2, footY + 48);

    const outPath = path.join(OUTPUT_DIR, 'Training_Program_Agenda_Posters.png');
    const outPathTamil = path.join(OUTPUT_DIR, 'பயிற்சி_பட்டறை_கால_அட்டவணை.png');
    const buf = await canvas.toBuffer('png');
    fs.writeFileSync(outPath, buf);
    fs.writeFileSync(outPathTamil, buf);

    // Also copy to brain artifact dir
    const brainDir = '/home/sabrisatharamanathan/.gemini/antigravity-cli/brain/16330e89-d880-4b57-bdd0-9af8238942c4';
    fs.writeFileSync(path.join(brainDir, 'Training_Program_Agenda_Posters.png'), buf);
    fs.writeFileSync(path.join(brainDir, 'பயிற்சி_பட்டறை_கால_அட்டவணை.png'), buf);

    console.log(`Saved clean high-res image: ${outPath}`);
}

renderAgendaPoster().catch(err => {
    console.error(err);
    process.exit(1);
});
