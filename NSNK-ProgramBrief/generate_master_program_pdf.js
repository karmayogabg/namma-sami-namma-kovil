const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const REGULAR_FONT = path.join(__dirname, '../MuktaMalar-Regular.ttf');
const BOLD_FONT = path.join(__dirname, '../MuktaMalar-Bold.ttf');
const OUTPUT_PDF = path.join(__dirname, 'நம்ம_சாமி_நம்ம_கோவில்_கையேடு.pdf');
const CACHE_JSON = path.join(__dirname, 'audio_transcripts.json');

console.log('Generating Master NSNK Program Briefing PDF...');

// Load audio transcripts cache if available
let audioCache = {};
if (fs.existsSync(CACHE_JSON)) {
    try {
        audioCache = JSON.parse(fs.readFileSync(CACHE_JSON, 'utf8'));
        console.log(`Loaded ${Object.keys(audioCache).length} audio transcript entries.`);
    } catch (e) {
        console.warn('Could not read audio transcripts cache:', e.message);
    }
}

const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 45, left: 45, right: 45 },
    autoFirstPage: false,
    info: {
        Title: 'நம்ம சாமி நம்ம கோவில் - விரிவான விளக்கக் கையேடு (NSNK Program Briefing)',
        Author: 'அறம் அறக்கட்டளை - NSNK Initiative',
        Subject: 'தலைப்பு 1: நம்ம, தலைப்பு 2: நம்ம சாமி, தலைப்பு 3: நம்ம கோவில்',
        Keywords: 'NSNK, Tamil, Temple, Heritage, Spirituality, Survey Guide'
    }
});

const writeStream = fs.createWriteStream(OUTPUT_PDF);
doc.pipe(writeStream);

doc.registerFont('Tamil', REGULAR_FONT);
doc.registerFont('Tamil-Bold', BOLD_FONT);

// Styling Helpers
const COLORS = {
    primary: '#d97706',      // Saffron dark
    primaryLight: '#f59e0b', // Saffron gold
    maroon: '#991b1b',       // Traditional temple red
    darkSlate: '#0f172a',    // Deep slate black
    bodyText: '#334155',     // Readable slate
    bgLight: '#f8fafc',      // Card background
    goldBorder: '#fde68a',   // Gold outline
    teal: '#0d9488',         // Accent teal
    blue: '#1d4ed8'          // Accent blue
};

let pageNum = 0;
const totalPagesEst = 8;

function addNewPageWithHeader(title, subtitle) {
    doc.addPage();
    pageNum++;

    // Top Decorative Bar
    doc.rect(45, 20, 505, 4).fill(COLORS.primaryLight);

    // Header Text
    doc.font('Tamil-Bold').fontSize(9).fillColor(COLORS.maroon)
       .text('நம்ம சாமி நம்ம கோவில் (NSNK) • விரிவான திட்ட விளக்கக் கையேடு', 45, 28, { align: 'left' });

    if (title) {
        doc.font('Tamil-Bold').fontSize(8).fillColor(COLORS.bodyText)
           .text(title, 45, 28, { align: 'right', width: 505 });
    }

    doc.moveTo(45, 38).lineTo(550, 38).lineWidth(0.5).strokeColor('#e2e8f0').stroke();

    // Footer
    const bottomY = 790;
    doc.moveTo(45, bottomY).lineTo(550, bottomY).lineWidth(0.5).strokeColor('#e2e8f0').stroke();
    doc.font('Tamil').fontSize(8).fillColor('#94a3b8')
       .text('அறம் அறக்கட்டளை — நல்வாழ்வு & பண்பாட்டு மறுமலர்ச்சி இயக்கம்', 45, bottomY + 6, { align: 'left' });
    doc.font('Tamil-Bold').fontSize(8).fillColor(COLORS.maroon)
       .text(`பக்கம் ${pageNum}`, 45, bottomY + 6, { align: 'right', width: 505 });

    doc.y = 48;
}

function drawSectionHeading(num, title, subtitle) {
    const startY = doc.y + 10;
    doc.rect(45, startY, 505, 28).fill('#fffbeb');
    doc.rect(45, startY, 5, 28).fill(COLORS.primary);

    doc.font('Tamil-Bold').fontSize(12).fillColor(COLORS.maroon)
       .text(`${num}. ${title}`, 56, startY + 4);
    if (subtitle) {
        doc.font('Tamil').fontSize(8.5).fillColor(COLORS.bodyText)
           .text(subtitle, 56, startY + 16);
    }
    doc.y = startY + 34;
}

function drawSubHeading(title) {
    doc.y += 6;
    doc.font('Tamil-Bold').fontSize(10.5).fillColor(COLORS.primary)
       .text(title, { paragraphGap: 3 });
}

function drawParagraph(text) {
    doc.font('Tamil').fontSize(9.5).fillColor(COLORS.bodyText)
       .text(text, { align: 'justify', lineGap: 3, paragraphGap: 6 });
}

function drawCalloutBox(title, content, bgColor = '#f8fafc', borderColor = '#cbd5e1') {
    const boxY = doc.y + 4;
    doc.font('Tamil').fontSize(9);
    const contentHeight = doc.heightOfString(content, { width: 480, lineGap: 2.5 });
    const totalHeight = contentHeight + (title ? 26 : 16);

    doc.roundedRect(45, boxY, 505, totalHeight, 4).fillAndStroke(bgColor, borderColor);

    let textY = boxY + 8;
    if (title) {
        doc.font('Tamil-Bold').fontSize(9.5).fillColor(COLORS.maroon).text(title, 55, textY, { width: 485 });
        textY += 14;
    }
    doc.font('Tamil').fontSize(9).fillColor(COLORS.darkSlate)
       .text(content, 55, textY, { width: 485, lineGap: 2.5 });

    doc.y = boxY + totalHeight + 6;
}

function drawShlokaBox(shloka, meaning) {
    const boxY = doc.y + 4;
    const sHeight = doc.heightOfString(shloka, { width: 480, lineGap: 3 });
    const mHeight = doc.heightOfString(meaning, { width: 480, lineGap: 2.5 });
    const totalHeight = sHeight + mHeight + 22;

    doc.roundedRect(45, boxY, 505, totalHeight, 6).fillAndStroke('#fffdfa', COLORS.goldBorder);
    doc.rect(45, boxY, 4, totalHeight).fill(COLORS.primaryLight);

    doc.font('Tamil-Bold').fontSize(9.5).fillColor(COLORS.maroon)
       .text(shloka, 56, boxY + 8, { width: 480, align: 'center', lineGap: 3 });

    doc.font('Tamil').fontSize(8.5).fillColor(COLORS.bodyText)
       .text(meaning, 56, boxY + sHeight + 14, { width: 480, align: 'justify', lineGap: 2.5 });

    doc.y = boxY + totalHeight + 8;
}

// ==========================================
// PAGE 1: COVER PAGE
// ==========================================
doc.addPage();
pageNum++;

// Outer decorative border
doc.rect(25, 25, 545, 792).lineWidth(2).strokeColor(COLORS.primary).stroke();
doc.rect(30, 30, 535, 782).lineWidth(0.75).strokeColor(COLORS.goldBorder).stroke();

// Header banner background
doc.rect(31, 31, 533, 140).fill('#78350f');

// Inner gold ornamental line
doc.moveTo(50, 160).lineTo(545, 160).lineWidth(1.5).strokeColor(COLORS.primaryLight).stroke();

// Title inside header banner
doc.font('Tamil-Bold').fontSize(24).fillColor('#ffffff')
   .text('நம்ம சாமி நம்ம கோவில்', 45, 55, { align: 'center' });

doc.font('Tamil-Bold').fontSize(14).fillColor(COLORS.primaryLight)
   .text('(NAMMA SAMI NAMMA KOVIL)', 45, 90, { align: 'center' });

doc.font('Tamil').fontSize(11).fillColor('#fef3c7')
   .text('பண்பாட்டு அடையாளம் • மெய்ஞ்ஞான தத்துவம் • ஆலய அறிவியல்', 45, 115, { align: 'center' });

doc.y = 195;

// Main Cover Subtitle Box
doc.roundedRect(50, doc.y, 495, 55, 6).fillAndStroke('#fffbeb', '#fde68a');
doc.font('Tamil-Bold').fontSize(14).fillColor(COLORS.maroon)
   .text('விரிவான திட்ட விளக்கக் கையேடு (Master Program Guide)', 60, doc.y + 12, { align: 'center' });
doc.font('Tamil').fontSize(10).fillColor(COLORS.bodyText)
   .text('மூன்று முக்கியப் பிரிவுகள்: 1. நம்ம • 2. நம்ம சாமி • 3. நம்ம கோவில்', 60, doc.y + 32, { align: 'center' });

doc.y = 270;

// 3 Pillars Overview Graphic Cards on Cover
const cards = [
    {
        num: 'தலைப்பு 1: நம்ம',
        title: 'நமது அடையாளம் & பண்பாடு',
        desc: 'நமது தாய்மொழி சிந்தனை, வணக்கம் சொல்லும் வேத மரபு, பாரத பாரம்பரிய உடை (வேட்டி/சேலை) மற்றும் வானவியல் சார்ந்த பண்டிகைகள்.'
    },
    {
        num: 'தலைப்பு 2: நம்ம சாமி',
        title: 'இறைத் தத்துவம் & 3 நிலைகள்',
        desc: 'சாமி என்றால் உடையவர். எங்கும் நிறைந்த பரம்பொருள், ராமகிருஷ்ணர் சிந்தனைக் கதைகள், கரதர்சனம், குலசாமி, கிராமசாமி மற்றும் இஷ்டதெய்வம்.'
    },
    {
        num: 'தலைப்பு 3: நம்ம கோவில்',
        title: 'ஆலய அறிவியல் & 10 நன்மைகள்',
        desc: 'கோவில்/ஆலயம் தத்துவம், 5 வழிபாட்டு முறைகள், மூர்த்தி-தலம்-தீர்த்தம், ஆகம நகர நிர்மாணம், குளங்கள், கல்வெட்டுகள் மற்றும் 64 கலைகள்.'
    }
];

cards.forEach(c => {
    const cardY = doc.y;
    doc.roundedRect(50, cardY, 495, 80, 5).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.rect(50, cardY, 5, 80).fill(COLORS.primary);

    doc.font('Tamil-Bold').fontSize(11).fillColor(COLORS.maroon)
       .text(c.num, 65, cardY + 10);
    doc.font('Tamil-Bold').fontSize(10).fillColor(COLORS.darkSlate)
       .text(`— ${c.title}`, 200, cardY + 10);

    doc.font('Tamil').fontSize(9).fillColor(COLORS.bodyText)
       .text(c.desc, 65, cardY + 28, { width: 465, lineGap: 2 });

    doc.y = cardY + 92;
});

// Bottom Cover Box: Audio Archives & Survey Link
doc.y += 10;
doc.roundedRect(50, doc.y, 495, 65, 5).fillAndStroke('#ecfdf5', '#a7f3d0');
doc.font('Tamil-Bold').fontSize(10).fillColor(COLORS.teal)
   .text('🎙️ 19 ஆடியோ விளக்க உரைகளின் விரிவான தொகுப்பு & கள ஆய்வு கையேடு', 65, doc.y + 10);
doc.font('Tamil').fontSize(8.5).fillColor(COLORS.bodyText)
   .text('இக்கையேடு NSNK களப்பணியாளர்கள், அழைப்பாளர்கள் மற்றும் தன்னார்வலர்கள் பொதுமக்களிடம் நமது பண்பாட்டின் ஆழமான கருத்துக்களை எளிய வடிவில் எடுத்துரைக்க உருவாக்கப்பட்ட முழுமையான வழிகாட்டியாகும்.', 65, doc.y + 26, { width: 465, lineGap: 2 });

// Footer of Cover
doc.font('Tamil-Bold').fontSize(9).fillColor(COLORS.maroon)
   .text('வெளியீடு: அறம் அறக்கட்டளை • NSNK Initiative Release v2.0 • 2026', 45, 775, { align: 'center', width: 505 });


// ==========================================
// PAGE 2: EXECUTIVE SUMMARY & SURVEY SYNERGY
// ==========================================
addNewPageWithHeader('அறிமுகம் & திட்ட நோக்கம்', 'Overview & 3 Survey Questions');

drawSectionHeading('முன்னுரை', 'நம்ம சாமி நம்ம கோவில் இயக்கத்தின் நோக்கம்');
drawParagraph('பாரதப் பண்பாடு என்பது வெறும் சடங்குகளின் தொகுப்பு அல்ல; அது பிரபஞ்ச இயக்கத்தோடும், இயற்கையோடும், மனித சமுதாய ஒற்றுமையோடும் பின்னிப்பிணைந்த ஓர் உன்னதமான வாழ்வியல் முறையாகும். பல்லாயிரக்கணக்கான ஆண்டுகளாக நமது முன்னோர்கள் பாதுகாத்து வந்த பண்பாட்டு விழுமியங்கள், ஆன்மீக உண்மைகள் மற்றும் கோவில் அமைப்பின் மகத்துவங்களை இன்றைய தலைமுறைக்கு எளிய, அறிவியல் பூர்வமான முறையில் கொண்டு சேர்ப்பதே "நம்ம சாமி நம்ம கோவில்" திட்டத்தின் தலையாய நோக்கமாகும்.');

drawSectionHeading('கள ஆய்வு', '3 முதன்மைக் கேள்விகளும் தர நிர்ணயமும் (Survey Grading Logic)');
drawParagraph('களப்பணியாளர்கள் மற்றும் தொலைபேசி அழைப்பாளர்கள் பொதுமக்களுடன் உரையாடும் போது, அவர்களின் பாரம்பரிய அறிவை அளவிடவும் வழிகாட்டவும் 3 முதன்மைக் கேள்விகள் முன்வைக்கப்படுகின்றன:');

const questions = [
    { q: 'கேள்வி 1: உங்கள் பெயரின் பொருள் தெரியுமா?', d: 'நமது பெயர் நமது முதல் அடையாளம். முன்னோர்கள் இறைவனின் திருநாமங்களையும், பெருமைமிகு தமிழ்ச் சொற்களையும் குழந்தைகளுக்குச் சூட்டினர். பெயரின் பொருளை அறிவது சுயமரியாதையையும் ஆன்மீக உணர்வையும் ஊட்டுகிறது.' },
    { q: 'கேள்வி 2: உங்கள் பரம்பரை / பாரம்பரியம் தெரியுமா?', d: 'நமது வம்சாவழி, பூர்வீகம் மற்றும் முன்னோர்களின் நற்பண்புகளை அறிந்து அடுத்த தலைமுறைக்குக் கடத்துவது குடும்பப் பிணைப்பையும் நெறிமுறைகளையும் உறுதி செய்கிறது.' },
    { q: 'கேள்வி 3: உங்கள் கோத்திரம் தெரியுமா?', d: 'கோத்திரம் என்பது நாம் எந்த ரிஷியின் வழியில் உதித்தோம் என்பதை விளக்கும் மரபுசார் மரபணு அடையாளம் ஆகும். இது ஒரே குடும்ப வழித்தோன்றல்களின் புனிதத் தொடர்பை உணர்த்துகிறது.' }
];

questions.forEach((item, idx) => {
    drawCalloutBox(item.q, item.d, '#fffbeb', '#fde68a');
});

drawSubHeading('மதிப்பெண் & தர மதிப்பீடு (Points & Grading System):');
drawParagraph('• முழு அறிவு (முழுமையாக அறிந்தவர்) = A (2 புள்ளிகள்)\n• பகுதி அறிவு (ஓரளவு அறிந்தவர்) = B (1 புள்ளி)\n• அறியாதவர் (வழிகாட்டல் தேவைப்படுவோர்) = C (0 புள்ளி)');
drawParagraph('மொத்த மதிப்பெண்கள் 5 முதல் 6 புள்ளிகள் பெற்றோர் 🟢 Grade A (ஆர்வமிக்க வழிகாட்டி), 3 முதல் 4 புள்ளிகள் பெற்றோர் 🔵 Grade B (விழிப்புணர்வுடையவர்), 0 முதல் 2 புள்ளிகள் பெற்றோர் 🟠 Grade C (வழிகாட்டப்பட வேண்டியவர்) என வகைப்படுத்தப்பட்டு தகுந்த விளக்கங்கள் வழங்கப்படுகின்றன.');


// ==========================================
// PAGE 3: TOPIC 1 - NAMMA
// ==========================================
addNewPageWithHeader('தலைப்பு 1: நம்ம', 'Topic 1: Namma - Our Identity & Heritage');

drawSectionHeading('1', 'தலைப்பு 1: நம்ம (நமது அடையாளம், மொழி & பண்பாடு)');
drawParagraph('"நம்ம" என்ற உணர்வே மனித சமுதாயத்தை ஒன்றிணைக்கும் மூலவிசை. பாரத மண்ணில் பிறந்த ஒவ்வொருவருக்கும் தொன்மையான மொழி, உடை, வாழ்த்து மரபு மற்றும் காலக்கணக்கீட்டு அறிவியல் ஆகியவை தனித்துவமான பெருமையை அளிக்கின்றன.');

drawSubHeading('1.1 நமது தாய்மொழி & சிந்தனைப் பகிர்வு:');
drawParagraph('கூடி வாழும் மக்களிடையே உள்ளக் கருத்துக்களையும் உணர்வுகளையும் பரிமாறிக் கொள்ளவே மொழி உருவாகிறது. ஒரு சமூகத்தின் ஆழ்ந்த சிந்தனைகளும் தத்துவங்களும் அந்த மக்களின் தாய்மொழியில் மட்டுமே முழுமையாகப் பிரதிபலிக்க முடியும். தாய்மொழியைப் பயன்படுத்துவது மொழியைப் பாதுகாப்பது மட்டுமின்றி, சிந்தனையைத் தெளிவாக்கி சமுதாயத்தை வலிமைப்படுத்துகிறது.');

drawSubHeading('1.2 வணக்கம் சொல்லும் வேத மரபு:');
drawParagraph('கொரோனா பேரிடர் காலத்தில் நோய் தொற்றைத் தவிர்க்க உலக நாடுகள் அனைத்தும் கை குலுக்குவதைத் தவிர்த்து, நமது பாரம்பரிய "வணக்கம்" முறையைப் பின்பற்றின. இரு கைகளையும் கூப்பி நெஞ்சோடு சேர்த்து வணங்குவது வெறும் உடல் அசைவு அல்ல. "இருப்பதெல்லாம் இறைவனே", "ஈசாவாஸ்யம் இதம் சர்வம்" என்னும் உபநிடதக் கருத்தை ஏற்று, எதிரில் உள்ள மனிதரிடம் உறையும் பரம்பொருளைத் தலைவணங்கி ஏற்கும் உயர்ந்த சமத்துவ வெளிப்பாடே வணக்கம் ஆகும்.');

drawSubHeading('1.3 நமது பாரம்பரிய உடை (வேட்டி & சேலை பெருமிதம்):');
drawParagraph('உலகில் முதன்முதலில் நூல் நூற்று, ஆடை நெய்து உடுத்திய பெருமை நமது பாரத நாகரிகத்திற்கே உரியது. நமது தட்பவெப்ப நிலைக்கு மிகவும் உகந்த, கண்ணியமான உடைகள் வேட்டியும் சேலையும் ஆகும். இன்றும் உலக அரங்கில் சேலை மிக நேர்த்தியான, கம்பீரமான உடையாகப் போற்றப்படுகிறது. நமது பாரம்பரிய உடைகளை விழாக்களிலும் அன்றாட வாழ்விலும் பெருமிதத்துடன் அணிவோம்.');

drawSubHeading('1.4 விழாக்களும் வானவியலும் (தமிழ் நாட்காட்டி):');
drawParagraph('நமது திருவிழாக்களும் பிறந்தநாள் கொண்டாட்டங்களும் வெறும் கற்பனையான தேதிகள் அல்ல; அவை துல்லியமான வானவியல் (Astronomy) மற்றும் புவியியல் (Geography) விதிகளின்படி அமைக்கப்பட்டவை. பூமி சூரியனைச் சுற்றி வரும் பாதையில் நாம் எங்கு பிறந்தோமோ, அதே புள்ளியில் மீண்டும் பூமி வரும் நாளைக் கணிப்பதே நமது பிறந்தநாள் மரபு. சூரியனின் சுழற்சியை அடிப்படையாகக் கொண்ட "சூரியமானம்" மற்றும் சந்திரனின் சுழற்சியை அடிப்படையாகக் கொண்ட "சந்திரமானம்" இணைந்த அறிவியலே நமது தமிழ் நாட்காட்டியாகும்.');


// ==========================================
// PAGE 4: TOPIC 2 - NAMMA SAMI (PART 1)
// ==========================================
addNewPageWithHeader('தலைப்பு 2: நம்ம சாமி', 'Topic 2: Namma Sami - Divine Philosophy');

drawSectionHeading('2', 'தலைப்பு 2: நம்ம சாமி (இறைவன் யார்? எங்கே இருக்கிறார்?)');
drawParagraph('"சாமி" என்ற சொல்லுக்கு "உடையவர்" என்று பொருள். அதாவது இந்த பிரபஞ்சத்தில் உள்ள அனைத்து அண்ட சராசரங்களையும், உயிர்களையும் தனக்கு உடைமையாகக் கொண்டு காப்பவரே சாமி ஆவார்.');

drawSubHeading('2.1 சாமி எங்கே இருக்கிறார்? (எங்கும் நிறைந்த பரம்பொருள்):');
drawParagraph('இறைவன் ஒரு குறிப்பிட்ட இடத்தில் மட்டும் சிறைப்பட்டிருக்கவில்லை. "அங்கிங்கெனாதபடி எங்கும் பிரகாசமாய் ஆனந்த பூர்த்தியாகி விளங்கும் பரம்பொருள்" என்று தாயுமானவ சுவாமிகள் பாடுகிறார். தூணிலும் இருப்பான், துரும்பிலும் இருப்பான். அனைத்துப் பொருட்களிலும் உயிர்களிலும் நீக்கமற நிறைந்திருப்பதே இறைவனின் உண்மை நிலை.');

drawShlokaBox(
    'கராக்ரே வசதே லக்ஷ்மீ: கரமத்யே ஸரஸ்வதீ |\nகரமூலே ஸ்திதே கௌரீ ப்ரபாதே கரதர்சனம் ||',
    'பொருள்: விரல் நுனியில் லட்சுமியும் (செல்வம்/தொழில்), உள்ளங்கையின் நடுவில் சரஸ்வதியும் (கல்வி/ஞானம்), மணிக்கட்டுப் பகுதியில் கௌரியும் (ஆற்றல்/சக்தி) உறைகின்றனர். காலையில் விழித்தவுடன் நமது உள்ளங்கையைப் பார்ப்பதன் மூலம், அனைத்து தெய்வீக ஆற்றல்களும் நமது உழைப்பிலும் கரங்களிலும் குடி கொண்டுள்ளன என்பதை உணர்ந்து தன்னம்பிக்கையுடன் செயல்பட வேண்டும்.'
);

drawSubHeading('2.2 சிந்தனைக்குரிய ஆன்மீகக் கதைகள்:');
drawParagraph('• ஸ்ரீ ராமகிருஷ்ண பரமஹம்சர் உபதேசம்: உலகம் முழுவதும் இறைவனின் வடிவம் என்பதை உணர்வதே மெய்யான பக்தி. எல்லா மனிதர்களிடமும் நாராயணனைக் காண வேண்டும்.');
drawParagraph('• குரு - சிஷ்யர் & யானை கதை (பக்தியுடன் விவேகம்): "எல்லாம் நாராயணன்" என்று குரு உபதேசித்ததால், மதம் பிடித்து ஓடிவந்த யானையை விலகாமல் நின்ற சிஷ்யனை யானை தூக்கி வீசியது. காயம்பட்ட சிஷ்யனிடம் குரு கூறினார்: "யானையில் நாராயணன் இருப்பது உண்மையே; ஆனால் யானையின் மேல் அமர்ந்து \'விலகிப் போ!\' என்று எச்சரித்த பாகனிலும் நாராயணனே பேசினான். அவனது பேச்சை நீ ஏன் கேட்கவில்லை?" — பக்தி என்பது மூடநம்பிக்கை அல்ல; விவேகத்துடனும் அறிவோடும் செயல்படுவதே மெய்ஞ்ஞானம்.');


// ==========================================
// PAGE 5: TOPIC 2 - 3 TIERS OF SAMI
// ==========================================
addNewPageWithHeader('சாமியின் 3 நிலைகள்', '3 Tiers of Deities: Kula, Grama, Ishta');

drawSubHeading('2.3 வழிபாட்டின் மூன்று முக்கிய நிலைகள்:');
drawParagraph('நமது சனாதன தர்மம் இறைவனை மூன்று நிலைகளில் அணுகி வழிபட வழிகாட்டுகிறது:');

const tiers = [
    {
        tier: 'நிலை 1: குலசாமி (குலதெய்வம்)',
        color: '#f59e0b',
        desc: 'குலம் என்பது ஒரே முன்னோர்களின் வம்சாவழியில் இரத்த உறவால் இணைக்கப்பட்ட பெருங்குடும்பம். இந்த வம்சாவழியைக் காக்கும் தெய்வமே குலதெய்வம் ஆகும். குலதெய்வ வழிபாடு ஒரு குடும்பத்தின் பாதுகாப்புக்கும், சந்ததிகளின் நல்வாழ்வுக்கும் முதன்மையானது. "குலம் தரும் செல்வம் தந்திடும்..." என்று திருமங்கையாழ்வார் அருளிச்செய்துள்ளார். குலதெய்வத்தை ஒருபோதும் மறக்கலாகாது.'
    },
    {
        tier: 'நிலை 2: கிராமசாமி (ஊர் சாமி / எல்லைத் தெய்வம்)',
        color: '#1d4ed8',
        desc: 'கிராமத்தில் வாழும் அனைத்து சமுதாய மக்களையும் பேதமின்றி ஒன்றிணைக்கும் சக்தியே கிராமக் கோவில். ஊர் எல்லை காக்கும் அய்யனார், மாரியம்மன், காளியம்மன் போன்ற தெய்வங்கள் ஊர் செழிப்பு, மழை வளம், விவசாய முன்னேற்றம் மற்றும் சமுதாய நல்லிணக்கத்தைக் காக்கின்றன.'
    },
    {
        tier: 'நிலை 3: இஷ்டதெய்வம் (விருப்ப தெய்வம்)',
        color: '#ec4899',
        desc: 'ஒவ்வொரு தனிமனிதனும் தனது மன இயல்பு, ஆன்மீக நாட்டம் மற்றும் விருப்பத்திற்கு ஏற்ப வழிபடும் தெய்வம் இஷ்டதெய்வம் ஆகும் (எ.கா: முருகன், சிவன், பெருமாள், விநாயகர்). இது தனிமனித மன அமைதிக்கும், ஆன்ம ஈடேற்றத்திற்கும் வழிவகுக்கிறது.'
    }
];

tiers.forEach(t => {
    const bY = doc.y + 4;
    doc.roundedRect(45, bY, 505, 68, 5).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.rect(45, bY, 5, 68).fill(t.color);

    doc.font('Tamil-Bold').fontSize(10.5).fillColor(COLORS.maroon)
       .text(t.tier, 58, bY + 8);
    doc.font('Tamil').fontSize(8.8).fillColor(COLORS.darkSlate)
       .text(t.desc, 58, bY + 24, { width: 480, lineGap: 2 });

    doc.y = bY + 76;
});

drawCalloutBox(
    '💡 குலதெய்வமும் கோத்திரமும்:',
    'குலதெய்வம் குடும்பத்தின் ஆணிவேர். கோத்திரம் என்பது ரிஷி பரம்பரை. ஒரு மனிதன் எவ்வளவு பெரிய நிலையை அடைந்தாலும் தனது குலதெய்வக் கோவிலுக்கும், சொந்த கிராமத்திற்கும் ஆண்டுக்கொரு முறையாவது சென்று வழிபாடு செய்வது வம்சவிருத்தியையும் மன அமைதியையும் தரும்.',
    '#fef2f2', '#fecaca'
);


// ==========================================
// PAGE 6: TOPIC 3 - NAMMA KOVIL (PART 1)
// ==========================================
addNewPageWithHeader('தலைப்பு 3: நம்ம கோவில்', 'Topic 3: Namma Kovil - Sacred Science');

drawSectionHeading('3', 'தலைப்பு 3: நம்ம கோவில் (ஆலய தத்துவமும் அமைப்பும்)');
drawParagraph('பாரத மண்ணில் கோவில்கள் என்பவை வெறும் வழிபாட்டுத் தலங்கள் மட்டுமல்ல; அவை அறிவியல், வானவியல், சமூக நலம், கட்டிடக்கலை மற்றும் வாழ்வியல் நெறிகளை ஒன்றிணைக்கும் பண்பாட்டு மையங்களாகும்.');

drawSubHeading('3.1 கோவில் & ஆலயம் சொல்லிலக்கணப் பொருள்:');
drawParagraph('• கோவில் = கோ + இல் (கோ என்றால் இறைவன் அல்லது அரசன்; இல் என்றால் இல்லம். உலகை ஆளும் இறைவனின் மாளிகையே கோவில்).\n• ஆலயம் = ஆ + லயம் (ஆ என்றால் ஆன்மா; லயம் என்றால் கரைதல் அல்லது ஒன்றுபடுதல். மனித ஆன்மா பரம்பொருளோடு லயித்து அமைதி பெறும் இடமே ஆலயம்).');

drawSubHeading('3.2 ஐந்து வகை வழிபாட்டு வடிவங்கள்:');
drawParagraph('1. பட வழிபாடு (சித்திர வடிவம்): இல்லங்களில் இறைவனின் திருவுருவப் படங்களை வைத்து வழிபடுவது.\n2. கல் & பளிங்குச் சிலைகள்: ஆகம முறைப்படி வடிக்கப்பட்டு பிரதிஷ்டை செய்யப்பட்ட திருமேனிகள்.\n3. யந்திர வழிபாடு: பிரபஞ்ச ஆற்றலை ஈர்க்கும் வடிவியல் தகடுகள் (ஸ்ரீசக்ரம் போன்ற யந்திரங்கள்).\n4. தீபம் & அக்கினி (யாகம்): ஒளி வடிவமாகவும், ஹோம அக்னி மூலமாகவும் இறைவனை வழிபடுவது.\n5. மண் & பஞ்சலோக மூர்த்திகள்: பஞ்சபூத தத்துவத்தைக் குறிக்கும் மண் சிலைகள் மற்றும் ஐம்பொன் விக்கிரகங்கள்.');

drawSubHeading('3.3 ஆலயத்தின் மூன்று இன்றியமையாத தூண்கள்:');
drawParagraph('• மூர்த்தி: ஆகம முறைப்படி சக்தி ஊட்டப்பட்ட தெய்வீகத் திருமேனி.\n• தலம்: வரலாற்றுச் சிறப்புமிக்க, மகான்களும் சித்தர்களும் தவமியற்றி புனிதம் சேர்த்த புண்ணிய பூமி.\n• தீர்த்தம்: உடல் நச்சுக்களை நீக்கி மனதை ஒருமுகப்படுத்தும் புனித நீர்நிலைகள் (குளங்கள் & நதிகள்).');


// ==========================================
// PAGE 7: TOPIC 3 - 10 SOCIETAL PILLARS
// ==========================================
addNewPageWithHeader('கோவிலின் 10 நன்மைகள்', '10 Societal Functions of Temples');

drawSubHeading('3.4 ஆகம விதிகளும் கோவிலின் 10 சமுதாயப் பெருமைகளும்:');
drawParagraph('நமது முன்னோர்கள் கிராமங்களையும் நகரங்களையும் நிர்மாணிக்கும் போது கோவிலை மையமாக வைத்தே திட்டமிட்டனர். கோவில்கள் ஆற்றிய 10 பெரும் பணிகள்:');

const benefits = [
    { n: '1', t: 'நகர நிர்மாணம்', d: 'ஊரின் மையத்தில் கருவறை அமைத்து, அதைச் சுற்றி சமச்சீரான சதுர, செவ்வக அமைப்பில் தெருக்களை வடிவமைத்தனர்.' },
    { n: '2', t: 'தூய்மையான வீதிகள் & வடிகால்', d: 'கோவிலைச் சுற்றியுள்ள மாட வீதிகள் அகலமாகவும், மழைநீர் தடையின்றி ஓடும் சிறந்த வடிகால் அமைப்போடும் கட்டப்பட்டன.' },
    { n: '3', t: 'விண்ணுயர்ந்த கோபுரங்கள்', d: 'கோபுர கலசங்கள் இடிதாங்கிகளாக (Lightning Arresters) செயல்பட்டன; தானியங்களைச் சேமிக்கும் களஞ்சியங்களாகவும் இருந்தன.' },
    { n: '4', t: 'திருக்குளங்கள் & நீர் மேலாண்மை', d: 'மழைநீரைச் சேகரித்து நிலத்தடி நீர்மட்டத்தை உயர்த்தும் மிகப்பெரிய நீர்நிலைகளாகத் திருக்குளங்கள் விளங்கின.' },
    { n: '5', t: 'கல்வெட்டுகள் & வரலாற்று ஆவணங்கள்', d: 'அரச கட்டளைகள், தானங்கள், வரி விலக்குகள், வானியல் குறிப்புகள் கல்வெட்டுகளாகவும் செப்பேடுகளாகவும் பதியப்பட்டன.' },
    { n: '6', t: '64 கலைகளின் அரங்கம்', d: 'இயல், இசை, நாடகம், நாட்டியம், சிற்பக்கலை மற்றும் நூல் அரங்கேற்றங்கள் (எ.கா: தில்லையில் பெரியபுராணம்) கோவிலில் நடைபெற்றன.' },
    { n: '7', t: 'சமூக நல்லிணக்கத் திருவிழாக்கள்', d: 'அனைத்து சமுதாய மக்களுக்கும் தனித்தனி பொறுப்புகள் வழங்கப்பட்டு, ஒற்றுமையுடன் கொண்டாடும் பெருவிழாக்களாக அமைந்தன.' },
    { n: '8', t: 'உள்ளூர்ப் பொருளாதாரம்', d: 'பூக்கள், பால், பழங்கள், எண்ணெய், கைவினைப் பொருட்கள் விற்பனை மூலம் பல்லாயிரக்கணக்கானோருக்கு வாழ்வாதாரம் கிடைத்தது.' },
    { n: '9', t: 'தேர்த்திருவிழா (சமத்துவ வடம்)', d: 'சாதி, மத, ஏழை, பணக்கார பேதமின்றி ஊர் மக்கள் அனைவரும் ஒன்றுகூடி வடம்பிடித்துத் தேர் இழுக்கும் மகத்தான சமத்துவ நெறி.' },
    { n: '10', t: 'தியாக வரலாறு & ஆலயப் பாதுகாப்பு', d: 'அன்னியப் படையெடுப்புகளிலிருந்து கோவில்களையும் விக்கிரகங்களையும் காப்பாற்ற எண்ணற்ற முன்னோர்கள் தன்னுயிரை ஈந்தனர்.' }
];

for (let i = 0; i < benefits.length; i += 2) {
    const b1 = benefits[i];
    const b2 = benefits[i+1];
    const rowY = doc.y + 2;

    // Col 1
    doc.roundedRect(45, rowY, 248, 48, 4).fillAndStroke('#f8fafc', '#e2e8f0');
    doc.font('Tamil-Bold').fontSize(8.5).fillColor(COLORS.maroon)
       .text(`${b1.n}. ${b1.t}`, 52, rowY + 5);
    doc.font('Tamil').fontSize(7.8).fillColor(COLORS.bodyText)
       .text(b1.d, 52, rowY + 18, { width: 235, lineGap: 1.5 });

    // Col 2
    if (b2) {
        doc.roundedRect(302, rowY, 248, 48, 4).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.font('Tamil-Bold').fontSize(8.5).fillColor(COLORS.maroon)
           .text(`${b2.n}. ${b2.t}`, 309, rowY + 5);
        doc.font('Tamil').fontSize(7.8).fillColor(COLORS.bodyText)
           .text(b2.d, 309, rowY + 18, { width: 235, lineGap: 1.5 });
    }

    doc.y = rowY + 52;
}


// ==========================================
// PAGE 8: AUDIO INSIGHTS & CALLER GUIDELINES
// ==========================================
addNewPageWithHeader('ஆடியோ சாராம்சம் & களப்பணியாளர் நெறிமுறைகள்', 'Audio Summaries & Caller Instructions');

drawSectionHeading('தொகுப்பு', '19 ஆடியோ விளக்க உரைகளின் முக்கிய சாராம்சங்கள்');
drawParagraph('NSNK கோப்பில் உள்ள 19 ஆடியோ உரைகளில் முன்னோர்கள் விளக்கிய சிறப்புக் குறிப்புகள்:');

const audioHighlights = [
    '• பெயர் என்பது மனிதனின் முதல் அடையாளம்; அதற்குரிய காரணப் பெயரை அறிவது சுயமரியாதையை உயர்த்தும்.',
    '• கோவில் என்பது ஆன்ம அமைதி மட்டுமின்றி, மருத்துவக் குணம் கொண்ட மூலிகைத் தீர்த்தங்கள் மற்றும் பிராண சக்தி நிறைந்த களம்.',
    '• குலதெய்வ வழிபாடு விடுபட்டால் குடும்பத்தில் ஏற்படும் மனக்கலக்கங்கள் மற்றும் அதற்குரிய எளிய பரிகார முறைகள்.',
    '• கிராமக் கோவில் திருவிழாக்களில் அன்னதானம் மற்றும் சமுதாயக் கூட்டு வழிபாட்டின் மகத்துவம்.'
];

audioHighlights.forEach(h => {
    doc.font('Tamil-Bold').fontSize(8.8).fillColor(COLORS.darkSlate).text(h, { lineGap: 2 });
});

doc.y += 6;
drawSectionHeading('வழிகாட்டுதல்', 'களப்பணியாளர்கள் & அழைப்பாளர்களுக்குரிய நெறிமுறைகள்');

const callerSteps = [
    '1. கனிவான முகமன்: தொலைபேசியில் அழைக்கும் போது "வணக்கம்" கூறி அன்போடு உரையாடலைத் தொடங்கவும்.',
    '2. பெயர் விளக்கம்: உறுப்பினரின் பெயருக்குரிய அரிய தமிழ்ப் பொருளை படித்துக் காட்டி மகிழ்ச்சியைப் பகிரவும்.',
    '3. 3 கேள்விகளை அன்புடன் வினவுதல்: பெயர் பொருள், பரம்பரை மற்றும் கோத்திரம் பற்றிய அறிவை எளிய தமிழில் கேட்கவும்.',
    '4. தரக் குறியீடு (A/B/C): பதில்களின் அடிப்படையில் A/B/C குறியீட்டைத் தாளில் கவனமாகக் குறித்துக் கொள்ளவும்.',
    '5. ஊக்கமளித்தல்: குலதெய்வ வழிபாடு மற்றும் குடும்ப மரபுகளைப் பேண அனைவருக்கும் விழிப்புணர்வை ஏற்படுத்தவும்.'
];

callerSteps.forEach(s => {
    drawCalloutBox('', s, '#fffdfa', COLORS.goldBorder);
});

doc.y += 6;
doc.roundedRect(45, doc.y, 505, 38, 4).fillAndStroke('#f0fdf4', '#86efac');
doc.font('Tamil-Bold').fontSize(9).fillColor(COLORS.teal)
   .text('வாழ்க பாரதப் பண்பாடு! • வளர்க நமது ஆன்மீக மரபு! • வெல்க சமுதாய ஒற்றுமை!', 50, doc.y + 12, { align: 'center', width: 495 });

doc.end();

writeStream.on('finish', () => {
    const stats = fs.statSync(OUTPUT_PDF);
    console.log(`\n🎉 Master PDF generated successfully!`);
    console.log(`Path: ${OUTPUT_PDF}`);
    console.log(`Size: ${(stats.size / 1024).toFixed(2)} KB (${stats.size.toLocaleString()} bytes)`);
    console.log(`Total Pages: ${pageNum}`);
});
