const fs = require('fs');
const path = require('path');
const { Canvas, FontLibrary } = require('skia-canvas');
const sharp = require('sharp');

// Register Fonts
FontLibrary.use('NotoSansTamil', './NotoSansTamil-Regular.ttf');
FontLibrary.use('NotoSansTamilBold', './NotoSansTamil-Bold.ttf');

const W = 1280;
const H = 720;

const BASE_CUPS = [
    { id: 1, name: "1. ஆகமம்", role: "base" },
    { id: 2, name: "2. அர்ச்சகர்", role: "base" },
    { id: 3, name: "3. சமுதாய ஒருங்கிணைப்பு", role: "base" },
    { id: 4, name: "4. சத்சங்கம்", role: "base" },
    { id: 5, name: "5. பஞ்சபூதம் பாதுகாப்பு", role: "base" }
];

const MIDDLE_CUPS = [
    { id: 6, name: "6. கல்வி", role: "middle" },
    { id: 7, name: "7. மருத்துவம்", role: "middle" },
    { id: 8, name: "8. கலை", role: "middle" },
    { id: 9, name: "9. பொருளாதாரம்", role: "middle" }
];

const TOP_CUP = { id: 10, name: "10. கோவில்", role: "top" };

function drawBackground(ctx) {
    const bgGrad = ctx.createRadialGradient(W/2, H*0.4, 100, W/2, H*0.4, W*0.8);
    bgGrad.addColorStop(0, '#151d30');
    bgGrad.addColorStop(0.6, '#0b101c');
    bgGrad.addColorStop(1, '#05070d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for(let x = 0; x < W; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    const spotGrad = ctx.createRadialGradient(W/2, 120, 10, W/2, 120, 480);
    spotGrad.addColorStop(0, 'rgba(245, 158, 11, 0.14)');
    spotGrad.addColorStop(0.5, 'rgba(20, 184, 166, 0.06)');
    spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, 0, W, H);

    // Large Rich Wooden Table
    const tableY = 510;
    ctx.fillStyle = '#1e140d';
    ctx.beginPath();
    ctx.ellipse(W/2, tableY, 520, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    const woodGrad = ctx.createLinearGradient(W/2 - 500, tableY - 60, W/2 + 500, tableY + 60);
    woodGrad.addColorStop(0, '#2c1e14');
    woodGrad.addColorStop(0.5, '#452b1b');
    woodGrad.addColorStop(1, '#2c1e14');
    ctx.fillStyle = woodGrad;
    ctx.beginPath();
    ctx.ellipse(W/2, tableY, 510, 65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6b472e';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#1c130c';
    ctx.beginPath();
    ctx.rect(W/2 - 500, tableY, 1000, 24);
    ctx.fill();

    const shadowGrad = ctx.createRadialGradient(W/2, tableY + 90, 80, W/2, tableY + 90, 460);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.7)');
    shadowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(W/2, tableY + 90, 460, 40, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawHeader(ctx, stepText, badgeText) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(W/2 - 380, 20, 760, 46);
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(W/2 - 380, 20, 760, 46);

    ctx.font = 'bold 18px NotoSansTamilBold';
    ctx.fillStyle = '#5eead4';
    ctx.textAlign = 'center';
    ctx.fillText("நம்ம சாமி நம்ம கோவில் — 10 தூண்கள் தாங்கும் சமுதாயக் கூரை மாதிரி", W/2, 50);

    ctx.font = 'bold 22px NotoSansTamilBold';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText(stepText, W/2, 98);
}

function drawPaperCup(ctx, x, y, label, role, wobbleAngle = 0, opacity = 1.0, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(wobbleAngle);
    ctx.globalAlpha = opacity;

    let cupGrad, rimColor, textColor;
    if (role === 'base') {
        cupGrad = ctx.createLinearGradient(-26, -55, 26, 5);
        cupGrad.addColorStop(0, '#0f766e');
        cupGrad.addColorStop(0.5, '#14b8a6');
        cupGrad.addColorStop(1, '#0d9488');
        rimColor = '#5eead4';
        textColor = '#ffffff';
    } else if (role === 'middle') {
        cupGrad = ctx.createLinearGradient(-24, -50, 24, 5);
        cupGrad.addColorStop(0, '#4338ca');
        cupGrad.addColorStop(0.5, '#6366f1');
        cupGrad.addColorStop(1, '#4f46e5');
        rimColor = '#a5b4fc';
        textColor = '#ffffff';
    } else {
        cupGrad = ctx.createLinearGradient(-26, -60, 26, 5);
        cupGrad.addColorStop(0, '#b45309');
        cupGrad.addColorStop(0.5, '#f59e0b');
        cupGrad.addColorStop(1, '#d97706');
        rimColor = '#fef08a';
        textColor = '#ffffff';
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const topW = 28;
    const botW = 20;
    const cupH = 58;

    ctx.beginPath();
    ctx.moveTo(-topW, -cupH);
    ctx.lineTo(topW, -cupH);
    ctx.lineTo(botW, 0);
    ctx.lineTo(-botW, 0);
    ctx.closePath();
    ctx.fillStyle = cupGrad;
    ctx.fill();
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, 0, botW, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, -cupH, topW, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label pill
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(-70, -34, 140, 22);
    ctx.strokeStyle = rimColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(-70, -34, 140, 22);

    ctx.font = 'bold 11px NotoSansTamilBold';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, -23);

    if (role === 'top') {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(0, -cupH - 18);
        ctx.lineTo(8, -cupH - 4);
        ctx.lineTo(-8, -cupH - 4);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -cupH - 22, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawCardboardRoof(ctx, x, y, width, thickness, label, wobble = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(wobble);

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(-width/2, 6, width, thickness, 4);
    ctx.fill();

    const cardGrad = ctx.createLinearGradient(-width/2, 0, width/2, thickness);
    cardGrad.addColorStop(0, '#ca8a04');
    cardGrad.addColorStop(0.5, '#eab308');
    cardGrad.addColorStop(1, '#a16207');
    ctx.fillStyle = cardGrad;
    ctx.beginPath();
    ctx.roundRect(-width/2, 0, width, thickness, 4);
    ctx.fill();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 13px NotoSansTamilBold';
    ctx.fillStyle = '#422006';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, thickness / 2);

    ctx.restore();
}

function drawSubtitlePill(ctx, text) {
    ctx.save();
    ctx.font = 'bold 16px NotoSansTamilBold';
    const textMetrics = ctx.measureText(text);
    const pillWidth = Math.min(W - 80, textMetrics.width + 50);
    const pillHeight = 44;
    const pillX = W/2 - pillWidth/2;
    const pillY = H - 65;

    ctx.fillStyle = 'rgba(10, 15, 26, 0.94)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 22);
    ctx.fill();
    ctx.strokeStyle = '#5eead4';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W/2, pillY + pillHeight/2);
    ctx.restore();
}

// -------------------------------------------------------------
// RENDER SCENE 1: Writing on 10 cups
// -------------------------------------------------------------
async function renderScene1() {
    const canvas = new Canvas(W, H);
    const ctx = canvas.getContext('2d');
    drawBackground(ctx);
    drawHeader(ctx, "படி 1: 10 காகிதக் குவளைகளில் பெயர்களை எழுதுதல் (Preparation & Words)");

    // Tray box
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.beginPath();
    ctx.roundRect(W/2 - 470, 150, 940, 340, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Section Labels inside tray
    ctx.font = 'bold 14px NotoSansTamilBold';
    ctx.fillStyle = '#2dd4bf';
    ctx.textAlign = 'left';
    ctx.fillText("அடித்தளத் தூண்கள் (5 குவளைகள்):", W/2 - 440, 185);

    ctx.fillStyle = '#818cf8';
    ctx.fillText("நடுத்தளத் தூண்கள் (4 குவளைகள்):", W/2 - 440, 290);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText("உச்சி சிகரம் (1 குவளை):", W/2 - 440, 395);

    // Row 1: Base 5
    const baseStartX = W/2 - 360;
    BASE_CUPS.forEach((cup, idx) => {
        drawPaperCup(ctx, baseStartX + idx * 180, 235, cup.name, cup.role, 0, 1.0, 0.95);
    });

    // Row 2: Middle 4
    const midStartX = W/2 - 270;
    MIDDLE_CUPS.forEach((cup, idx) => {
        drawPaperCup(ctx, midStartX + idx * 180, 340, cup.name, cup.role, 0, 1.0, 0.95);
    });

    // Top 1: Kovil
    drawPaperCup(ctx, W/2, 445, TOP_CUP.name, TOP_CUP.role, 0, 1.0, 1.05);

    drawSubtitlePill(ctx, "10 பங்கேற்பாளர்களிடம் குவளைகளை வழங்கி, அடிப்பகுதியில் 10 சொற்களை எழுதச் செய்கிறோம்.");
    return canvas.toBuffer('image/png');
}

// -------------------------------------------------------------
// RENDER SCENE 2: Constructing 3-Tier Temple Model
// -------------------------------------------------------------
async function renderScene2() {
    const canvas = new Canvas(W, H);
    const ctx = canvas.getContext('2d');
    drawBackground(ctx);
    drawHeader(ctx, "படி 2: 3 அடுக்குக் கோவில் மாதிரி அமைத்தல் (Constructing 3-Tier Model)");

    const tableLevelY = 480;
    const roof1TargetY = tableLevelY - 60;
    const roof2TargetY = roof1TargetY - 60;

    // Base 5 Cups
    const basePos = [-280, -140, 0, 140, 280];
    BASE_CUPS.forEach((cup, idx) => {
        drawPaperCup(ctx, W/2 + basePos[idx], tableLevelY, cup.name, 'base', 0, 1.0, 0.95);
    });

    // Roof 1
    drawCardboardRoof(ctx, W/2, roof1TargetY, 680, 14, "1-ஆம் கூரை பலகை (Roof 1)");

    // Middle 4 Cups
    const midPos = [-200, -65, 65, 200];
    MIDDLE_CUPS.forEach((cup, idx) => {
        drawPaperCup(ctx, W/2 + midPos[idx], roof1TargetY, cup.name, 'middle', 0, 1.0, 0.92);
    });

    // Roof 2
    drawCardboardRoof(ctx, W/2, roof2TargetY, 480, 12, "2-ஆம் கூரை பலகை (Roof 2)");

    // Crown Kovil Cup
    drawPaperCup(ctx, W/2, roof2TargetY, TOP_CUP.name, 'top', 0, 1.0, 1.08);

    // Radiant Golden Glow
    const auraGrad = ctx.createRadialGradient(W/2, roof2TargetY - 30, 10, W/2, roof2TargetY - 30, 95);
    auraGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(W/2, roof2TargetY - 30, 95, 0, Math.PI * 2);
    ctx.fill();

    // Key insight banner
    ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
    ctx.fillRect(W/2 - 400, 120, 800, 48);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.strokeRect(W/2 - 400, 120, 800, 48);

    ctx.font = 'bold 15px NotoSansTamilBold';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText("💡 வெளியில் தெரிவது உச்சி 'கோவில்' மட்டுமே; ஆனால் தாங்கி நிற்பது 9 சமுதாயத் தூண்கள்!", W/2, 150);

    drawSubtitlePill(ctx, "3 அடுக்குக் கோபுரம் கம்பீரமாக நிற்கிறது: 5 அடித்தளம் + கூரை 1 + 4 நடுத்தளம் + கூரை 2 + கோவில் சிகரம்.");
    return canvas.toBuffer('image/png');
}

// -------------------------------------------------------------
// RENDER SCENE 3: Random Removal & Precarious Balance
// -------------------------------------------------------------
async function renderScene3() {
    const canvas = new Canvas(W, H);
    const ctx = canvas.getContext('2d');
    drawBackground(ctx);
    drawHeader(ctx, "படி 3: தன்னிச்சையாக அகற்றுதல் & சமநிலை சரிவு (Precarious Balance & Rebuild)");

    const tableLevelY = 480;
    const roof1TargetY = tableLevelY - 60;
    const roof2TargetY = roof1TargetY - 60;
    const wobble = 0.035;

    // BASE: Only Center cup remains! 4 removed
    // Center cup is idx 2: 3. சமுதாய ஒருங்கிணைப்பு
    drawPaperCup(ctx, W/2, tableLevelY, BASE_CUPS[2].name, 'base', 0, 1.0, 0.95);

    // Faded ghost cups representing removed pillars
    const basePos = [-280, -140, 0, 140, 280];
    [0, 1, 3, 4].forEach(idx => {
        drawPaperCup(ctx, W/2 + basePos[idx], tableLevelY, BASE_CUPS[idx].name, 'base', 0, 0.2, 0.95);
    });

    // Roof 1 wobbling on 1 center cup
    drawCardboardRoof(ctx, W/2, roof1TargetY, 680, 14, "1-ஆம் கூரை பலகை (தள்ளாடுகிறது!)", wobble);

    // MIDDLE: Only Center cup remains! 3 removed
    drawPaperCup(ctx, W/2, roof1TargetY, MIDDLE_CUPS[1].name, 'middle', wobble, 1.0, 0.92);

    // Faded ghost cups for removed middle pillars
    const midPos = [-200, -65, 65, 200];
    [0, 2, 3].forEach(idx => {
        drawPaperCup(ctx, W/2 + midPos[idx], roof1TargetY, MIDDLE_CUPS[idx].name, 'middle', wobble, 0.2, 0.92);
    });

    // Roof 2 wobbling on 1 middle cup
    drawCardboardRoof(ctx, W/2, roof2TargetY, 480, 12, "2-ஆம் கூரை பலகை (அபாய நிலை)", wobble * 1.5);

    // Top Kovil cup teetering
    drawPaperCup(ctx, W/2, roof2TargetY, TOP_CUP.name, 'top', wobble * 1.8, 1.0, 1.08);

    // Warning Banner
    ctx.fillStyle = 'rgba(239, 68, 68, 0.92)';
    ctx.fillRect(W/2 - 380, 115, 760, 46);
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.strokeRect(W/2 - 380, 115, 760, 46);

    ctx.font = 'bold 15px NotoSansTamilBold';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText("⚠️ அபாயகரமான சமநிலை: தளம் ஒன்றுக்கு 1 மையக் குவளையின் மீது கோபுரம் தள்ளாடுகிறது!", W/2, 144);

    // Historical Revelation Banner
    ctx.fillStyle = 'rgba(13, 148, 136, 0.95)';
    ctx.fillRect(W/2 - 460, 170, 920, 50);
    ctx.strokeStyle = '#5eead4';
    ctx.lineWidth = 2;
    ctx.strokeRect(W/2 - 460, 170, 920, 50);

    ctx.font = 'bold 14px NotoSansTamilBold';
    ctx.fillStyle = '#ffffff';
    ctx.fillText("📜 வரலாற்று உண்மை: கல்வியும் மருத்துவமும் பறிக்கப்பட்டதால் கோவில் பலவீனமானது; நாம் மீண்டும் கட்டமைக்க வேண்டும்!", W/2, 201);

    drawSubtitlePill(ctx, "கீழே 4 நீக்கப்பட்டு 1 மையக் குவளையும், நடுவில் 3 நீக்கப்பட்டு 1 மையக் குவளையும் மட்டுமே தாங்கி நிற்கின்றன.");
    return canvas.toBuffer('image/png');
}

// -------------------------------------------------------------
// RENDER SCENE 4: Pradakshina & Sacred Pledge
// -------------------------------------------------------------
async function renderScene4() {
    const canvas = new Canvas(W, H);
    const ctx = canvas.getContext('2d');
    drawBackground(ctx);
    drawHeader(ctx, "படி 4: கோவில் பிரதக்ஷிணம் & புனித அறப்பணி உறுதிமொழி (Pradakshina & Sacred Pledge)");

    const tableLevelY = 480;
    const roof1TargetY = tableLevelY - 60;
    const roof2TargetY = roof1TargetY - 60;

    // Rebuilt temple in center
    BASE_CUPS.forEach((cup, idx) => {
        const basePos = [-280, -140, 0, 140, 280];
        drawPaperCup(ctx, W/2 + basePos[idx], tableLevelY, cup.name, 'base', 0, 1.0, 0.95);
    });
    drawCardboardRoof(ctx, W/2, roof1TargetY, 680, 14, "1-ஆம் கூரை பலகை", 0);

    MIDDLE_CUPS.forEach((cup, idx) => {
        const midPos = [-200, -65, 65, 200];
        drawPaperCup(ctx, W/2 + midPos[idx], roof1TargetY, cup.name, 'middle', 0, 1.0, 0.92);
    });
    drawCardboardRoof(ctx, W/2, roof2TargetY, 480, 12, "2-ஆம் கூரை பலகை", 0);
    drawPaperCup(ctx, W/2, roof2TargetY, TOP_CUP.name, 'top', 0, 1.0, 1.08);

    // Participants standing around table with raised hands
    const numPeople = 8;
    for (let i = 0; i < numPeople; i++) {
        const angle = (i / numPeople) * Math.PI * 2;
        const px = W/2 + Math.cos(angle) * 450;
        const py = tableLevelY + Math.sin(angle) * 85 - 15;

        ctx.save();
        ctx.translate(px, py);

        // Head
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -32, 10, 0, Math.PI * 2);
        ctx.fill();

        // Torso
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(-10, -20, 20, 28, 4);
        ctx.fill();

        // Raised hands in pledge
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-9, -15);
        ctx.lineTo(-16, -38);
        ctx.moveTo(9, -15);
        ctx.lineTo(16, -38);
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(-16, -38, 3, 0, Math.PI * 2);
        ctx.arc(16, -38, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Floating Sacred Pledge Card Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(W/2 - 470, 115, 940, 165);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(W/2 - 470, 115, 940, 165);

    ctx.font = 'bold 16px NotoSansTamilBold';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText("🙏 சமுதாய அறப்பணிப் புனித உறுதிமொழி (Sacred Pledge)", W/2, 142);

    ctx.font = '13px NotoSansTamilBold';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('"வணக்கம்! அருள்நிறை அறம்வளர்த்தநாயகியின் பேரருளாலும், சுவாமி தயானந்த சரஸ்வதி அவர்களின் ஆசிகளாலும்,', W/2, 172);
    ctx.fillText('சுவாமி சக்ஷாத்கிருதானந்தா அவர்களின் வழிகாட்டுதலில் அறம்வளர்த்தநாயகி சேவை மையத்தின் கீழ்...', W/2, 198);
    ctx.fillText('நமது திட்டமான நம்ம சாமி நம்ம கோவிலில் இணைந்து ஊழியர்களுக்கு பயிற்சி அளிக்கும் சிறப்பு பணியை ஆற்றுவேன்!"', W/2, 224);

    ctx.font = 'bold 12px NotoSansTamilBold';
    ctx.fillStyle = '#5eead4';
    ctx.fillText('— அறம்வளர்த்தநாயகியின் திருவடிகளை பணிந்து வேண்டுகிறேன்.', W/2, 252);

    drawSubtitlePill(ctx, "அனைவரும் மேசையை வலம் வந்து (பிரதக்ஷிணம்), கரம் ஏந்தி ஒருமித்த குரலில் புனித உறுதிமொழி ஏற்கின்றனர்.");
    return canvas.toBuffer('image/png');
}

// -------------------------------------------------------------
// MAIN EXECUTION
// -------------------------------------------------------------
async function main() {
    console.log("Rendering 4 scenes...");
    const b1 = await renderScene1();
    const b2 = await renderScene2();
    const b3 = await renderScene3();
    const b4 = await renderScene4();

    const artifactDir = '/home/sabrisatharamanathan/.gemini/antigravity-cli/brain/20ca972e-49a6-409c-98e0-6b8be248ec53';
    const localAssetDir = path.join(__dirname, 'NSNK-ProgramBrief', 'assets');
    if (!fs.existsSync(localAssetDir)) fs.mkdirSync(localAssetDir, { recursive: true });

    // Save PNG files to both locations
    const files = [
        { name: 'demo_step1_words.png', buf: b1 },
        { name: 'demo_step2_assembly.png', buf: b2 },
        { name: 'demo_step3_wobble.png', buf: b3 },
        { name: 'demo_step4_pledge.png', buf: b4 }
    ];

    for (const f of files) {
        fs.writeFileSync(path.join(localAssetDir, f.name), f.buf);
        fs.writeFileSync(path.join(artifactDir, f.name), f.buf);
        console.log(`Saved ${f.name}`);
    }

    // Now generate an animated GIF from the 4 frames (scaled down to 800x450 for fast loading & smooth playback)
    console.log("Generating animated GIF preview...");
    const targetW = 800;
    const targetH = 450;

    const scaledFrames = await Promise.all(
        [b1, b2, b3, b4].map(b => sharp(b).resize(targetW, targetH).png().toBuffer())
    );

    const stacked = await sharp({
        create: {
            width: targetW,
            height: targetH * 4,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 }
        }
    }).composite(scaledFrames.map((f, i) => ({ input: f, top: i * targetH, left: 0 })))
      .png()
      .toBuffer();

    const gifBuffer = await sharp(stacked, { animated: false })
        .gif({
            pageHeight: targetH,
            delay: [2500, 3000, 3000, 3000], // duration per frame in ms
            loop: 0 // infinite loop
        })
        .toBuffer();

    fs.writeFileSync(path.join(localAssetDir, 'temple_activity_demo_preview.gif'), gifBuffer);
    fs.writeFileSync(path.join(artifactDir, 'temple_activity_demo_preview.gif'), gifBuffer);
    console.log("Saved temple_activity_demo_preview.gif! Size:", gifBuffer.length);
}

main().catch(err => {
    console.error("Error generating snapshots:", err);
    process.exit(1);
});
