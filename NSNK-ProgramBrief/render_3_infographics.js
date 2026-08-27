const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const OUTPUT_DIR = __dirname;
const FONTS = [
    path.join(__dirname, '..', 'fonts', 'NotoSansTamil-Regular.ttf'),
    path.join(__dirname, '..', 'fonts', 'NotoSansTamil-Bold.ttf')
];

function renderSvgToPng(svgString, outputPath) {
    const resvg = new Resvg(svgString, {
        font: {
            fontFiles: FONTS,
            loadSystemFonts: false,
            defaultFontFamily: 'Noto Sans Tamil'
        },
        fitTo: {
            mode: 'width',
            value: 1600
        }
    });
    const pngData = resvg.render();
    fs.writeFileSync(outputPath, pngData.asPng());
    console.log(`Saved: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
}

// ==========================================
// 1. IMAGE 1: நம்ம (NAMMA)
// ==========================================
function generateImage1() {
    const svg = `
<svg width="1600" height="2250" viewBox="0 0 1600 2250" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0a0e17"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="headerGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="50%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg1)"/>

  <!-- Border Frame -->
  <rect x="20" y="20" width="1560" height="2210" rx="24" fill="none" stroke="#f59e0b" stroke-width="2" opacity="0.4"/>
  <rect x="30" y="30" width="1540" height="2190" rx="18" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.2"/>

  <!-- Header Banner -->
  <g transform="translate(60, 60)">
    <rect width="1480" height="180" rx="16" fill="url(#headerGrad1)" filter="url(#shadow)"/>
    <rect x="20" y="20" width="1440" height="140" rx="12" fill="#000000" fill-opacity="0.25"/>
    
    <text x="740" y="75" font-family="Noto Sans Tamil" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">
      தலைப்பு 1: நம்ம (NAMMA)
    </text>
    <text x="740" y="125" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fef08a" text-anchor="middle">
      நமது சுய அடையாளம் • தாய்மொழி • வேத மரபு • பாரத உடை • குடும்ப அமைப்பு &amp; வானவியல் நாட்காட்டி
    </text>
  </g>

  <!-- Card 1.1: நமது மொழி & சிந்தனைப் பகிர்வு -->
  <g transform="translate(60, 270)">
    <rect width="725" height="420" rx="14" fill="url(#cardGrad)" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#d97706" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fbbf24">1.1 நமது மொழி &amp; சிந்தனைப் பகிர்வு</text>
    
    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• மொழியின் தோற்றமும் சிந்தனைப் பகிர்வும்:</text>
    <text x="45" y="130" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">கூடி வாழும் மக்களிடையே எண்ணங்களையும் கருத்துக்களையும்</text>
    <text x="45" y="160" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">பரிமாறிக் கொள்ளவே மொழி உருவாகிறது.</text>

    <text x="25" y="210" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• தாய்மொழியின் தனித்துவ மகத்துவம்:</text>
    <text x="45" y="245" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">மக்களின் உள்ளார்ந்த சிந்தனைகளும், தத்துவங்களும்,</text>
    <text x="45" y="275" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">உணர்வுகளும் தாய்மொழியில் மட்டுமே முழுமையாக வெளிப்பட முடியும்.</text>

    <text x="25" y="325" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• சமுதாய வலிமை:</text>
    <text x="45" y="360" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">தாய்மொழியைப் பயன்படுத்துவது மொழியைக் காப்பதோடு,</text>
    <text x="45" y="390" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">நமது சிந்தனையைத் தெளிவாக்கி சமூகத்தை வலிமைப்படுத்துகிறது.</text>
  </g>

  <!-- Card 1.2: வணக்கம் சொல்லும் வேத மரபு -->
  <g transform="translate(815, 270)">
    <rect width="725" height="420" rx="14" fill="url(#cardGrad)" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#d97706" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fbbf24">1.2 வணக்கம் சொல்லும் வேத மரபு</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• கொரோனா கால உலகளாவிய ஏற்பு:</text>
    <text x="45" y="130" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">தொற்று பேரிடர் காலத்தில் கைகுலுக்குவதைத் தவிர்த்து,</text>
    <text x="45" y="160" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">உலக நாடுகள் நமது 'வணக்கம்' முறையை முழுமையாகப் பின்பற்றின.</text>

    <text x="25" y="210" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• "இருப்பதெல்லாம் இறைவனே" தத்துவம்:</text>
    <text x="45" y="245" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">"ஈசா வாஸ்யம் இதம் சர்வம்" என்னும் வேதக் கருத்தின்படி,</text>
    <text x="45" y="275" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">எதிரில் உள்ளவரிடம் உறையும் பரம்பொருளைத் தலைவணங்கும் நெறி.</text>

    <text x="25" y="325" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• சமத்துவ ஆன்மீக அறிவியல்:</text>
    <text x="45" y="360" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">இரு கரங்களையும் குவித்து மார்பருகே வைப்பது இதயப்பூர்வமான</text>
    <text x="45" y="390" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">மரியாதையையும் சமத்துவ ஆன்மீக உணர்வையும் ஊட்டுகிறது.</text>
  </g>

  <!-- Card 1.3: பாரதப் பாரம்பரிய உடை (வேட்டி & சேலை) -->
  <g transform="translate(60, 720)">
    <rect width="725" height="440" rx="14" fill="url(#cardGrad)" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#d97706" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fbbf24">1.3 பாரதப் பாரம்பரிய உடை (வேட்டி &amp; சேலை)</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• உலகின் முதல் ஆடை நாகரிகம்:</text>
    <text x="45" y="130" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">உலகில் முதன்முதலில் நூல் நூற்று, நெய்து, ஆடை உடுத்திய</text>
    <text x="45" y="160" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">பெருமை நமது பாரதப் பண்பாட்டிற்கே உரியது.</text>

    <text x="25" y="210" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• கம்பீரமான வேட்டியும் சேலையும்:</text>
    <text x="45" y="245" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">பல்லாயிரக்கணக்கான ஆண்டுகளாக நாம் பின்பற்றி வரும் ஆடை.</text>
    <text x="45" y="275" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">இன்றும் உலகளவில் சேலை மிக கண்ணியமான, அழகிய உடை.</text>

    <text x="25" y="325" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• காலச்சூழலும் தட்பவெப்ப நிலையும்:</text>
    <text x="45" y="360" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">நமது தட்பவெப்ப நிலைக்கு ஏற்ற வேட்டி உடைக் கலாச்சாரத்தைப்</text>
    <text x="45" y="390" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">போற்றிப் பேணி பெருமிதத்துடன் உடுத்த வேண்டும்.</text>
  </g>

  <!-- Card 1.4: விழாக்களும் தமிழ் வானவியலும் -->
  <g transform="translate(815, 720)">
    <rect width="725" height="440" rx="14" fill="url(#cardGrad)" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#d97706" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fbbf24">1.4 விழாக்களும் தமிழ் வானவியலும்</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• வானியல் &amp; புவியியல் அறிவியல்:</text>
    <text x="45" y="130" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">நமது திருவிழாக்களும் கொண்டாட்டங்களும் வானவியலோடும்</text>
    <text x="45" y="160" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">(Astronomy) புவியியலோடும் (Geography) இணைந்தவை.</text>

    <text x="25" y="210" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• பிறந்தநாள் கணக்கீட்டு மரபு:</text>
    <text x="45" y="245" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">பூமி சூரியனைச் சுற்றி வரும் பாதையில், நாம் பிறந்த அதே புள்ளியில்</text>
    <text x="45" y="275" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">மீண்டும் பூமி வரும் நாளைக் கணிப்பதே நமது பிறந்தநாள் மரபு.</text>

    <text x="25" y="325" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• சூரியமானம் &amp; சந்திரமானம்:</text>
    <text x="45" y="360" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">சூரியன் மற்றும் சந்திரனின் இயக்கங்களை இணைத்து உருவாக்கப்பட்ட</text>
    <text x="45" y="390" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">தமிழ் நாட்காட்டி உலகிற்கே வழிகாட்டும் அறிவியல் அற்புதம்.</text>
  </g>

  <!-- Card 1.5: குடும்ப அமைப்பும் 6 தர்ம கர்மங்களும் -->
  <g transform="translate(60, 1190)">
    <rect width="725" height="470" rx="14" fill="url(#cardGrad)" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#d97706" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fbbf24">1.5 குடும்ப அமைப்பும் 6 தர்ம கர்மங்களும்</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• கூட்டுக்குடும்பத்தின் வலிமை:</text>
    <text x="45" y="130" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">பாரதக் குடும்ப அமைப்பு என்பது உலகிற்கே வழிகாட்டும் பாதுகாப்புத் தூண்.</text>

    <text x="25" y="175" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• 6 நித்திய தர்ம கர்மங்கள்:</text>
    <text x="45" y="210" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">1. தேவ யக்ஞம் (இறை வழிபாடு &amp; ஆலயப் பணி)</text>
    <text x="45" y="240" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">2. பித்ரு யக்ஞம் (முன்னோர்கள் வழிபாடு &amp; தர்மம்)</text>
    <text x="45" y="270" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">3. மனுஷ்ய யக்ஞம் (விருந்தோம்பல் &amp; மனித நேய உதவி)</text>
    <text x="45" y="300" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">4. பூத யக்ஞம் (விலங்குகள், பறவைகள், தாவரங்களுக்கு உணவளித்தல்)</text>
    <text x="45" y="330" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">5. பிரம்ம யக்ஞம் (வேத, தமிழ் நூல்கள் கற்றல் &amp; கற்பித்தல்)</text>
    <text x="45" y="360" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">6. சமுதாய தர்மம் (ஊர் நலம் &amp; தர்ம தொண்டுகள்)</text>

    <text x="25" y="415" font-family="Noto Sans Tamil" font-size="18" fill="#fbbf24" font-weight="bold">குடும்பத்தில் அமைதியும் ஒழுக்கமும் நிலவ இந்த 6 கர்மங்களே அடிப்படை.</text>
  </g>

  <!-- Card 1.6: தமிழர் உறவுமுறைகளின் அறிவியல் -->
  <g transform="translate(815, 1190)">
    <rect width="725" height="470" rx="14" fill="url(#cardGrad)" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#d97706" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fbbf24">1.6 தமிழர் உறவுமுறைகளின் அறிவியல்</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• மரபணுப் பாதுகாப்பு (Genetic Safeguarding):</text>
    <text x="45" y="130" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">தாய்மாமன், அத்தை, பெரியப்பா, சித்தப்பா போன்ற உறவுமுறைகள்</text>
    <text x="45" y="160" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">வெறும் பெயர்கள் அல்ல; அவை மரபணுக் குறைபாடுகளைத் தவிர்க்கும் கட்டமைப்பு.</text>

    <text x="25" y="210" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• உளவியல் பாதுகாப்பு &amp; சமநிலை:</text>
    <text x="45" y="245" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">குழந்தைகள் வளர்ப்பில் தாய்மாமனின் பாசமும் வழிகாட்டலும்</text>
    <text x="45" y="275" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">குடும்பத்திற்கு மாபெரும் உளவியல் அரணாகத் திகழ்கிறது.</text>

    <text x="25" y="325" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• சமூகப் பிணைப்பும் ஆதரவும்:</text>
    <text x="45" y="360" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">துன்பக் காலங்களில் கை கொடுக்கும் குடும்பப் பிணைப்பு</text>
    <text x="45" y="390" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">தனிமனித மன அழுத்தத்தைத் தடுத்து சமூக ஒற்றுமையை நிலைநிறுத்துகிறது.</text>
  </g>

  <!-- Card 1.7: பாரம்பரிய பஞ்சாங்கம் -->
  <g transform="translate(60, 1690)">
    <rect width="725" height="440" rx="14" fill="url(#cardGrad)" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#d97706" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fbbf24">1.7 பாரம்பரிய பஞ்சாங்கம் &amp; காலக்கணக்கீடு</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• பஞ்சாங்கம் (5 அங்கங்கள்):</text>
    <text x="45" y="135" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">1. திதி (சந்திரனின் கோண நிலை)</text>
    <text x="45" y="170" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">2. வாரம் (கிழமைகள் - 7 கோள்களின் சுழற்சி)</text>
    <text x="45" y="205" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">3. நட்சத்திரம் (27 விண்மீன் மண்டலங்கள்)</text>
    <text x="45" y="240" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">4. யோகம் (சூரிய-சந்திர கூட்டு இயக்கம்)</text>
    <text x="45" y="275" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">5. கரணம் (திதியின் அரைப் பங்கு)</text>

    <text x="25" y="330" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• அதிநவீன காலக்கணக்கீடு:</text>
    <text x="45" y="365" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">விவசாயம், பண்டிகைகள், மங்கள நிகழ்வுகளை இயற்கை மாற்றங்களோடு</text>
    <text x="45" y="395" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">இணைத்துச் செயல்படுத்தும் ஒப்பற்ற அறிவியல் சாதனமாகும்.</text>
  </g>

  <!-- Card 1.8: உபசார மொழியின் உன்னதம் & தியாகம் -->
  <g transform="translate(815, 1690)">
    <rect width="725" height="440" rx="14" fill="url(#cardGrad)" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#d97706" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fbbf24">1.8 உபசார மொழியின் உன்னதம் &amp; தியாகம்</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• இன்சொல் வரவேற்பு ("வாங்க", "வணக்கம்"):</text>
    <text x="45" y="130" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">இல்லத்திற்கு வருபவர்களை இன்முகத்தோடு "வாங்க" என அழைத்து,</text>
    <text x="45" y="160" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">நீர் வழங்கி உபசரிப்பது தமிழரின் தலையாய பண்பாடாகும்.</text>

    <text x="25" y="210" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• சுயநலமற்ற தியாக உணர்வு:</text>
    <text x="45" y="245" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">தன்னலம் கருதாமல் பிறருக்கு உதவும் தியாக மனப்பான்மையே</text>
    <text x="45" y="275" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">ஒரு சமுதாயத்தை ஆன்மீக உன்னத நிலைக்கு உயர்த்துகிறது.</text>

    <text x="25" y="325" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• தலைமுறை வழிகாட்டல்:</text>
    <text x="45" y="360" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">பெரியோர்களை மதித்தல், நற்பண்புகள் மற்றும் அறநெறிகளை</text>
    <text x="45" y="390" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">அடுத்த தலைமுறைக்குக் கடத்துவதே நமது பண்பாட்டுப் பெருமை.</text>
  </g>

  <!-- Footer Branding -->
  <text x="800" y="2185" font-family="Noto Sans Tamil" font-size="18" fill="#94a3b8" text-anchor="middle">
    நம்ம சாமி நம்ம கோவில் • தலைப்பு 1: நம்ம (முழுமையான ஆவண விளக்கப் படம்)
  </text>
</svg>`;
    renderSvgToPng(svg, path.join(OUTPUT_DIR, '1_நம்ம_Namma.png'));
}

// ==========================================
// 2. IMAGE 2: நம்ம சாமி (NAMMA SAMI)
// ==========================================
function generateImage2() {
    const svg = `
<svg width="1600" height="2350" viewBox="0 0 1600 2350" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#31102e"/>
      <stop offset="100%" stop-color="#0a0e17"/>
    </linearGradient>
    <linearGradient id="cardGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f293d" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="headerGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#881337"/>
      <stop offset="50%" stop-color="#be123c"/>
      <stop offset="100%" stop-color="#e11d48"/>
    </linearGradient>
    <filter id="shadow2" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg2)"/>

  <!-- Border Frame -->
  <rect x="20" y="20" width="1560" height="2310" rx="24" fill="none" stroke="#fb7185" stroke-width="2" opacity="0.4"/>
  <rect x="30" y="30" width="1540" height="2290" rx="18" fill="none" stroke="#fb7185" stroke-width="1" opacity="0.2"/>

  <!-- Header Banner -->
  <g transform="translate(60, 60)">
    <rect width="1480" height="180" rx="16" fill="url(#headerGrad2)" filter="url(#shadow2)"/>
    <rect x="20" y="20" width="1440" height="140" rx="12" fill="#000000" fill-opacity="0.25"/>
    
    <text x="740" y="75" font-family="Noto Sans Tamil" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">
      தலைப்பு 2: நம்ம சாமி (NAMMA SAMI)
    </text>
    <text x="740" y="125" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#ffe4e6" text-anchor="middle">
      மெய்ஞ்ஞான இறைத் தத்துவம் • எங்கும் நிறைந்த பரம்பொருள் • 3 வழிபாட்டு நிலைகள் &amp; கம்பராமாயணம்
    </text>
  </g>

  <!-- Card 2.1: சாமி என்றால் என்ன? எங்கே இருக்கிறார்? -->
  <g transform="translate(60, 270)">
    <rect width="1480" height="250" rx="14" fill="url(#cardGrad2)" stroke="#fb7185" stroke-width="1.5" filter="url(#shadow2)"/>
    <rect x="0" y="0" width="1480" height="55" rx="14" fill="#881337" fill-opacity="0.4"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fda4af">2.1 சாமி என்றால் என்ன? எங்கே இருக்கிறார்?</text>

    <text x="35" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f43f5e" font-weight="bold">• சாமி என்றால் என்ன?:</text>
    <text x="270" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9">"உடையவர்" (அனைத்து பிரபஞ்சத்தையும் உயிர்களையும் தனக்கு உடைமையாகக் கொண்டு காப்பவர், தலைவன்).</text>

    <text x="35" y="145" font-family="Noto Sans Tamil" font-size="20" fill="#f43f5e" font-weight="bold">• சாமி மொத்தம் எத்தனை?:</text>
    <text x="285" y="145" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9">சாமி ஒன்றே பல திருநாமங்களாகவும், திருவுருவங்களாகவும் திகழ்கிறார்.</text>

    <text x="35" y="195" font-family="Noto Sans Tamil" font-size="20" fill="#f43f5e" font-weight="bold">• சாமி எங்கே இருக்கிறார்?:</text>
    <text x="285" y="195" font-family="Noto Sans Tamil" font-size="20" fill="#fef08a" font-weight="bold">"ஈசா வாஸ்யம் இதம் சர்வம்"</text>
    <text x="560" y="195" font-family="Noto Sans Tamil" font-size="19" fill="#f1f5f9">— அங்கிங்கெனாதபடி எங்கும் பிரகாசமாய் ஆனந்த பூர்த்தியாகி விளங்கும் பரம்பொருள்.</text>
  </g>

  <!-- Card 2.2: கரதர்சனம் ஸ்லோகம் -->
  <g transform="translate(60, 545)">
    <rect width="1480" height="260" rx="14" fill="url(#cardGrad2)" stroke="#fbbf24" stroke-width="1.5" filter="url(#shadow2)"/>
    <rect x="0" y="0" width="1480" height="55" rx="14" fill="#b45309" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fef08a">2.2 கரதர்சனம் ஸ்லோகம் — தெய்வீகம் நம்மிலும் உள்ளது!</text>

    <rect x="35" y="75" width="1410" height="60" rx="8" fill="#000000" fill-opacity="0.4"/>
    <text x="740" y="112" font-family="Noto Sans Tamil" font-size="22" font-weight="bold" fill="#fde047" text-anchor="middle">
      "கராக்ரே வசதே லக்ஷ்மீ: கரமத்யே ஸரஸ்வதீ | கரமூலே ஸ்திதே கௌரீ ப்ரபாதே கரதர்சனம் ||"
    </text>

    <text x="35" y="170" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">
      <tspan fill="#f59e0b" font-weight="bold">விரல் நுனியில் லட்சுமி</tspan> (செல்வம்/தொழில் வெற்றி) • <tspan fill="#38bdf8" font-weight="bold">உள்ளங்கையின் நடுவில் சரஸ்வதி</tspan> (கல்வி/ஞானம்) • <tspan fill="#f43f5e" font-weight="bold">மணிக்கட்டில் கௌரி</tspan> (ஆற்றல்/சக்தி).
    </text>
    <text x="35" y="205" font-family="Noto Sans Tamil" font-size="18" fill="#e2e8f0">
      காலையில் கண் விழித்தவுடன் நமது உள்ளங்கையைப் பார்ப்பதன் மூலம், அனைத்து தெய்வீக ஆற்றல்களும் நமது சுய உழைப்பிலும் கரங்களிலும் அடங்கியுள்ளன என்ற தன்னம்பிக்கை பிறக்கிறது.
    </text>
  </g>

  <!-- Card 2.3: ஆன்மீகக் கதைகள் (ராமகிருஷ்ணர் & யானை) -->
  <g transform="translate(60, 830)">
    <rect width="725" height="420" rx="14" fill="url(#cardGrad2)" stroke="#fb7185" stroke-width="1.5" filter="url(#shadow2)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#881337" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="23" font-weight="bold" fill="#fda4af">ஸ்ரீ ராமகிருஷ்ணர் அருளிய உவமை</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• உருவமும் அருவமும்:</text>
    <text x="45" y="130" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">இறைவன் அனைத்திலும் நீக்கமற உறைகிறார் என்பதை</text>
    <text x="45" y="160" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">ஸ்ரீ ராமகிருஷ்ண பரமஹம்சர் எளிய உவமையால் விளக்கினார்.</text>

    <text x="25" y="210" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• நீர் மற்றும் பனிக்கட்டி தத்துவம்:</text>
    <text x="45" y="245" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">நீர் எப்படி திரவமாகவும், உறைந்த பனிக்கட்டியாகவும் உள்ளதோ,</text>
    <text x="45" y="275" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">அதுபோல இறைவன் அருவமாகவும் உருவமாகவும் விளங்குகிறார்.</text>

    <text x="25" y="325" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• மெய்யான பக்தி:</text>
    <text x="45" y="360" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">உலக உயிர்கள் அனைத்திலும் அந்த பரம்பொருளின் இருப்பைக்</text>
    <text x="45" y="390" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">காண்பதே மெய்யான பக்தி நெறியாகும்.</text>
  </g>

  <g transform="translate(815, 830)">
    <rect width="725" height="420" rx="14" fill="url(#cardGrad2)" stroke="#fb7185" stroke-width="1.5" filter="url(#shadow2)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#881337" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="23" font-weight="bold" fill="#fda4af">குரு - சிஷ்யர் &amp; யானை கதை (பக்தியுடன் விவேகம்)</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• மதம் பிடித்த யானை நிகழ்வு:</text>
    <text x="45" y="130" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">"எல்லாம் நாராயணன்" என்ற உபதேசத்தைக் கேட்டு,</text>
    <text x="45" y="160" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">ஓடிவந்த யானையைக் கண்டு விலகாத சிஷ்யனை யானை தூக்கி வீசியது.</text>

    <text x="25" y="210" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• குருவின் விளக்கம்:</text>
    <text x="45" y="245" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">"யானையில் நாராயணன் இருப்பது உண்மையே; ஆனால் யானை மேல்</text>
    <text x="45" y="275" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">அமர்ந்து 'விலகிப் போ!' என்று எச்சரித்த பாகனிலும் நாராயணனே பேசினான்!"</text>

    <text x="25" y="325" font-family="Noto Sans Tamil" font-size="20" fill="#f1f5f9" font-weight="bold">• வாழ்க்கைப் பாடம்:</text>
    <text x="45" y="360" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">பக்தி என்பது மூடநம்பிக்கை அல்ல; விவேகத்துடனும்</text>
    <text x="45" y="390" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1">பகுத்தறிவுடனும் செயல்படுவதே மெய்ஞ்ஞானம் ஆகும்.</text>
  </g>

  <!-- Card 2.4: சாமியின் மூன்று நிலைகள் (Three Tiers) -->
  <g transform="translate(60, 1275)">
    <rect width="1480" height="660" rx="14" fill="url(#cardGrad2)" stroke="#fb7185" stroke-width="1.5" filter="url(#shadow2)"/>
    <rect x="0" y="0" width="1480" height="55" rx="14" fill="#881337" fill-opacity="0.4"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fda4af">2.4 சாமியின் மூன்று நிலைகள் (Three Tiers of Deities)</text>

    <!-- Tier 1 -->
    <g transform="translate(25, 75)">
      <rect width="455" height="555" rx="10" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.5"/>
      <rect x="0" y="0" width="455" height="45" rx="10" fill="#b45309" fill-opacity="0.4"/>
      <text x="227" y="30" font-family="Noto Sans Tamil" font-size="20" font-weight="bold" fill="#fbbf24" text-anchor="middle">நிலை 1: குலசாமி (குலதெய்வம்)</text>

      <text x="15" y="75" font-family="Noto Sans Tamil" font-size="17" fill="#f1f5f9" font-weight="bold">• குலம் என்றால் என்ன?:</text>
      <text x="20" y="105" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">ஒரே முன்னோர்களை அடிப்படையாகக் கொண்டு,</text>
      <text x="20" y="130" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">இரத்த உறவு மற்றும் வம்சாவழி பாரம்பரியத்தால்</text>
      <text x="20" y="155" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">இணைக்கப்பட்ட பெருங்குடும்பம்.</text>

      <text x="15" y="195" font-family="Noto Sans Tamil" font-size="17" fill="#f1f5f9" font-weight="bold">• குலத்தைக் காக்கும் தெய்வம்:</text>
      <text x="20" y="225" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">இந்த குலத்தைக் காப்பவரே குலசாமி.</text>

      <rect x="15" y="255" width="425" height="150" rx="6" fill="#000000" fill-opacity="0.3"/>
      <text x="227" y="285" font-family="Noto Sans Tamil" font-size="15" font-weight="bold" fill="#fef08a" text-anchor="middle">"குலம் தரும் செல்வம் தந்திடும் அடியார்</text>
      <text x="227" y="315" font-family="Noto Sans Tamil" font-size="15" font-weight="bold" fill="#fef08a" text-anchor="middle">படுதுயர் ஆயின எல்லாம் நிலந்தரம் செய்யும்..."</text>
      <text x="227" y="350" font-family="Noto Sans Tamil" font-size="14" fill="#cbd5e1" text-anchor="middle">— திருமங்கையாழ்வார்</text>

      <text x="15" y="440" font-family="Noto Sans Tamil" font-size="15" fill="#e2e8f0">• ஆண்டுக்கொரு முறையாவது குடும்பத்துடன் சென்று</text>
      <text x="15" y="465" font-family="Noto Sans Tamil" font-size="15" fill="#e2e8f0">வணங்குவது வம்சவிருத்தியையும் ஒற்றுமையையும் தரும்.</text>
    </g>

    <!-- Tier 2 -->
    <g transform="translate(510, 75)">
      <rect width="455" height="555" rx="10" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
      <rect x="0" y="0" width="455" height="45" rx="10" fill="#1d4ed8" fill-opacity="0.4"/>
      <text x="227" y="30" font-family="Noto Sans Tamil" font-size="20" font-weight="bold" fill="#60a5fa" text-anchor="middle">நிலை 2: கிராம சாமி (ஊர் கோவில்)</text>

      <text x="15" y="75" font-family="Noto Sans Tamil" font-size="17" fill="#f1f5f9" font-weight="bold">• சமுதாய ஒருமைப்பாடு:</text>
      <text x="20" y="105" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">ஊர் மக்கள் அனைவரையும், அனைத்து</text>
      <text x="20" y="130" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">சமுதாய மக்களையும் பேதமின்றி ஒன்றிணைக்கும்</text>
      <text x="20" y="155" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">பெருஞ்சக்தியாக கிராமக் கோவில் விளங்குகிறது.</text>

      <text x="15" y="195" font-family="Noto Sans Tamil" font-size="17" fill="#f1f5f9" font-weight="bold">• எல்லை காவல் தெய்வங்கள்:</text>
      <text x="20" y="225" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">அய்யனார், மாரியம்மன், காளியம்மன், முனீஸ்வரர்</text>
      <text x="20" y="250" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">போன்ற தெய்வங்கள் ஊரின் காவல் அரண்.</text>

      <text x="15" y="290" font-family="Noto Sans Tamil" font-size="17" fill="#f1f5f9" font-weight="bold">• ஊர் வளம் &amp; நல்லிணக்கம்:</text>
      <text x="20" y="320" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">மழை வளம், விவசாய முன்னேற்றம்,</text>
      <text x="20" y="345" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">நோய் நொடிகள் நீங்குதல் மற்றும் கிராமிய</text>
      <text x="20" y="370" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">நல்லிணக்கத்திற்கு ஊர் திருவிழாக்களே மையம்.</text>

      <text x="15" y="440" font-family="Noto Sans Tamil" font-size="15" fill="#e2e8f0">• ஊரின் பொதுவான பிரச்சனைகளைத் தீர்க்கவும்,</text>
      <text x="15" y="465" font-family="Noto Sans Tamil" font-size="15" fill="#e2e8f0">அறம் காக்கவும் ஊர் கோவில் அரணாக உள்ளது.</text>
    </g>

    <!-- Tier 3 -->
    <g transform="translate(995, 75)">
      <rect width="455" height="555" rx="10" fill="#1e1b4b" stroke="#ec4899" stroke-width="1.5"/>
      <rect x="0" y="0" width="455" height="45" rx="10" fill="#be185d" fill-opacity="0.4"/>
      <text x="227" y="30" font-family="Noto Sans Tamil" font-size="20" font-weight="bold" fill="#f472b6" text-anchor="middle">நிலை 3: இஷ்டதெய்வம் (விருப்ப தெய்வம்)</text>

      <text x="15" y="75" font-family="Noto Sans Tamil" font-size="17" fill="#f1f5f9" font-weight="bold">• தனிமனித மேம்பாடு:</text>
      <text x="20" y="105" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">தனிமனித மன அமைதியையும், ஆன்மீக</text>
      <text x="20" y="130" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">மேம்பாட்டையும் உறுதி செய்வது இஷ்டதெய்வம்.</text>

      <text x="15" y="175" font-family="Noto Sans Tamil" font-size="17" fill="#f1f5f9" font-weight="bold">• பூரண ஆன்மீகச் சுதந்திரம்:</text>
      <text x="20" y="205" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">தனக்குப் பிடித்த இறைவனைத் தேர்ந்தெடுத்து</text>
      <text x="20" y="230" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">வழிபடும் பூரண உரிமை இந்து தர்மத்தின் சிறப்பு.</text>

      <text x="15" y="270" font-family="Noto Sans Tamil" font-size="17" fill="#f1f5f9" font-weight="bold">• நண்பனைப் போன்ற பக்தி:</text>
      <text x="20" y="300" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">சிவன், முருகன், பெருமாள், விநாயகர் என</text>
      <text x="20" y="325" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">உள்ளம் உருகி நினைக்கும் தெய்வம் உற்ற</text>
      <text x="20" y="350" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">நண்பனைப் போல மன அழுத்தத்தைப் போக்குகிறது.</text>

      <text x="15" y="440" font-family="Noto Sans Tamil" font-size="15" fill="#e2e8f0">• எந்தவித நிர்ப்பந்தமும் இன்றி மன விருப்பப்படி</text>
      <text x="15" y="465" font-family="Noto Sans Tamil" font-size="15" fill="#e2e8f0">வழிபடும் தனித்துவ சுதந்திரமே இஷ்டதெய்வம்.</text>
    </g>
  </g>

  <!-- Card 2.5: கம்பராமாயணம் — இரணியன் வதைப்படலம் -->
  <g transform="translate(60, 1960)">
    <rect width="1480" height="300" rx="14" fill="url(#cardGrad2)" stroke="#fb7185" stroke-width="1.5" filter="url(#shadow2)"/>
    <rect x="0" y="0" width="1480" height="55" rx="14" fill="#881337" fill-opacity="0.4"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#fda4af">2.5 கம்பராமாயணம் — இரணியன் வதைப்படலம் (எங்கும் நிறைந்த பரம்பொருள்)</text>

    <rect x="35" y="75" width="850" height="195" rx="8" fill="#000000" fill-opacity="0.4"/>
    <text x="50" y="110" font-family="Noto Sans Tamil" font-size="19" font-weight="bold" fill="#fde047">"சாணினும் உளன்; ஓர் தன்மை அணுவினைச் சத கூறிட்ட</text>
    <text x="50" y="145" font-family="Noto Sans Tamil" font-size="19" font-weight="bold" fill="#fde047">கோணினும் உளன்; மா மேருக் குன்றினும் உளன்; இந் நின்ற</text>
    <text x="50" y="180" font-family="Noto Sans Tamil" font-size="19" font-weight="bold" fill="#fde047">தூணினும் உளன்; நீ சொன்ன சொல்லினும் உளன்; இத் தன்மை</text>
    <text x="50" y="215" font-family="Noto Sans Tamil" font-size="19" font-weight="bold" fill="#fde047">காணுதி விரைவின்” என்றான்;</text>
    <text x="50" y="250" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">— கவிச்சக்கரவர்த்தி கம்பர் (கம்பராமாயணம்)</text>

    <g transform="translate(910, 75)">
      <text x="0" y="30" font-family="Noto Sans Tamil" font-size="19" fill="#f43f5e" font-weight="bold">• பாடல் பொருள் விளக்கம்:</text>
      <text x="0" y="65" font-family="Noto Sans Tamil" font-size="16" fill="#cbd5e1">பிரஹலாதன் தந்தை இரணியனிடம் முழங்குகிறான்:</text>
      <text x="0" y="95" font-family="Noto Sans Tamil" font-size="16" fill="#f1f5f9">1. சாண் அளவிலும் இறைவன் இருப்பான்</text>
      <text x="0" y="125" font-family="Noto Sans Tamil" font-size="16" fill="#f1f5f9">2. அணுவை 100 கூறாக்கிய நுண்மையிலும் இருப்பான்</text>
      <text x="0" y="155" font-family="Noto Sans Tamil" font-size="16" fill="#f1f5f9">3. மாமேரு மலையிலும் இருப்பான், தூணிலும் இருப்பான்</text>
      <text x="0" y="185" font-family="Noto Sans Tamil" font-size="16" fill="#f1f5f9">4. நீ பேசிய சொல்லிலும் இருப்பான் என்று சர்வ வியாபகத்தை உணர்த்துகிறான்.</text>
    </g>
  </g>

  <!-- Footer Branding -->
  <text x="800" y="2290" font-family="Noto Sans Tamil" font-size="18" fill="#94a3b8" text-anchor="middle">
    நம்ம சாமி நம்ம கோவில் • தலைப்பு 2: நம்ம சாமி (முழுமையான ஆவண விளக்கப் படம்)
  </text>
</svg>`;
    renderSvgToPng(svg, path.join(OUTPUT_DIR, '2_நம்ம_சாமி_Namma_Sami.png'));
}

// ==========================================
// 3. IMAGE 3: நம்ம கோவில் (NAMMA KOVIL)
// ==========================================
function generateImage3() {
    const svg = `
<svg width="1600" height="2550" viewBox="0 0 1600 2550" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg3" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#042f2e"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>
    <linearGradient id="cardGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#134e4a" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="headerGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0d9488"/>
      <stop offset="50%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#115e59"/>
    </linearGradient>
    <filter id="shadow3" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg3)"/>

  <!-- Border Frame -->
  <rect x="20" y="20" width="1560" height="2510" rx="24" fill="none" stroke="#14b8a6" stroke-width="2" opacity="0.4"/>
  <rect x="30" y="30" width="1540" height="2490" rx="18" fill="none" stroke="#14b8a6" stroke-width="1" opacity="0.2"/>

  <!-- Header Banner -->
  <g transform="translate(60, 60)">
    <rect width="1480" height="180" rx="16" fill="url(#headerGrad3)" filter="url(#shadow3)"/>
    <rect x="20" y="20" width="1440" height="140" rx="12" fill="#000000" fill-opacity="0.25"/>
    
    <text x="740" y="75" font-family="Noto Sans Tamil" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">
      தலைப்பு 3: நம்ம கோவில் (NAMMA KOVIL)
    </text>
    <text x="740" y="125" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#ccfbf1" text-anchor="middle">
      ஆலய அறிவியல் • 4 யுகங்கள் • ஆகம நிர்மாணம் • மூர்த்தி-தலம்-தீர்த்தம் &amp; 10 சமுதாயப் பெருமைகள்
    </text>
  </g>

  <!-- Row 1: 3.1 Etymology & 3.2 Four Yugas -->
  <g transform="translate(60, 270)">
    <rect width="725" height="300" rx="14" fill="url(#cardGrad3)" stroke="#14b8a6" stroke-width="1.5" filter="url(#shadow3)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#0d9488" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="23" font-weight="bold" fill="#5eead4">3.1 கோவில் &amp; ஆலயம் சொல்லிலக்கணம்</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="19" fill="#f1f5f9" font-weight="bold">• கோவில் (கோ + இல்):</text>
    <text x="45" y="125" font-family="Noto Sans Tamil" font-size="17" fill="#cbd5e1">கோ = தலைவன் (இறைவன்) | இல் = வீடு (வசிப்பிடம்)</text>
    <text x="45" y="150" font-family="Noto Sans Tamil" font-size="17" fill="#5eead4" font-weight="bold">கோவில் = "இறைவனின் வசிப்பிடம் / அரண்மனை"</text>

    <text x="25" y="195" font-family="Noto Sans Tamil" font-size="19" fill="#f1f5f9" font-weight="bold">• ஆலயம் (ஆ + லயம்):</text>
    <text x="45" y="225" font-family="Noto Sans Tamil" font-size="17" fill="#cbd5e1">ஆ = ஆன்மா / ஜீவாத்மா | லயம் = ஒடுங்குதல் (கரைதல்)</text>
    <text x="45" y="250" font-family="Noto Sans Tamil" font-size="17" fill="#5eead4" font-weight="bold">ஆலயம் = "ஜீவாத்மா இறைவனிடம் லயித்து அமைதி பெறும் இடம்"</text>
  </g>

  <g transform="translate(815, 270)">
    <rect width="725" height="300" rx="14" fill="url(#cardGrad3)" stroke="#14b8a6" stroke-width="1.5" filter="url(#shadow3)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#0d9488" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="23" font-weight="bold" fill="#5eead4">3.2 நான்கு யுகங்களும் கலியுக வழிபாடும்</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="19" fill="#f1f5f9" font-weight="bold">• 4 யுகங்கள்:</text>
    <text x="45" y="125" font-family="Noto Sans Tamil" font-size="17" fill="#cbd5e1">கிருத யுகம் • திரேதா யுகம் • துவாபர யுகம் • கலியுகம்</text>

    <text x="25" y="165" font-family="Noto Sans Tamil" font-size="19" fill="#f1f5f9" font-weight="bold">• முதல் 3 யுகங்கள்:</text>
    <text x="45" y="195" font-family="Noto Sans Tamil" font-size="17" fill="#cbd5e1">யாகங்கள், தவம், யோகாப்பியாசம், இறைவனுடன் நேரில் வாழ்தல்.</text>

    <text x="25" y="235" font-family="Noto Sans Tamil" font-size="19" fill="#fef08a" font-weight="bold">• கலியுக வரப்பிரசாதம் (விக்ரக ஆராதனை):</text>
    <text x="45" y="265" font-family="Noto Sans Tamil" font-size="17" fill="#cbd5e1">மூர்த்தி வழிபாடு மனித மனதைப் பக்குவப்படுத்தி இறைவனை உணரச் செய்கிறது.</text>
  </g>

  <!-- Row 2: 3.3 Five Forms & 3.4 Thirumoolar Songs -->
  <g transform="translate(60, 600)">
    <rect width="725" height="420" rx="14" fill="url(#cardGrad3)" stroke="#14b8a6" stroke-width="1.5" filter="url(#shadow3)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#0d9488" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="23" font-weight="bold" fill="#5eead4">3.3 ஐந்து வகை வழிபாட்டு வடிவங்கள்</text>

    <text x="25" y="95" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1"><tspan fill="#5eead4" font-weight="bold">1. பட வழிபாடு:</tspan> இல்லங்களில் திருவுருவப் படங்களை வைத்து தீபமிடுதல்.</text>
    <text x="25" y="135" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1"><tspan fill="#5eead4" font-weight="bold">2. கல் &amp; பளிங்குச் சிலைகள்:</tspan> ஆகம முறைப்படி பிரதிஷ்டை செய்த திருமேனிகள்.</text>
    <text x="25" y="175" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1"><tspan fill="#5eead4" font-weight="bold">3. யந்திர வழிபாடு:</tspan> பிரபஞ்ச ஆற்றலை ஈர்க்கும் ஸ்ரீசக்ர வடிவியல் தகடுகள்.</text>
    <text x="25" y="215" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1"><tspan fill="#5eead4" font-weight="bold">4. விளக்கு &amp; அக்கினி:</tspan> ஜோதி வழிபாடு மற்றும் ஹோம குண்ட யாகங்கள்.</text>
    <text x="25" y="255" font-family="Noto Sans Tamil" font-size="18" fill="#cbd5e1"><tspan fill="#5eead4" font-weight="bold">5. மண் &amp; பஞ்சலோகம்:</tspan> மண் பொம்மைகள் &amp; வீதியுலா உற்சவ மூர்த்திகள்.</text>

    <rect x="25" y="295" width="675" height="100" rx="8" fill="#000000" fill-opacity="0.3"/>
    <text x="35" y="325" font-family="Noto Sans Tamil" font-size="16" fill="#fef08a" font-weight="bold">முன்னோர் பொன்மொழிகள்:</text>
    <text x="35" y="355" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">"கோவிலில்லா ஊரில் குடியிருக்க வேண்டாம்" • "ஆலயம் தொழுவது சாலவும் நன்று"</text>
    <text x="35" y="380" font-family="Noto Sans Tamil" font-size="15" fill="#5eead4">"கோபுர தரிசனம் கோடி புண்ணியம்"</text>
  </g>

  <g transform="translate(815, 600)">
    <rect width="725" height="420" rx="14" fill="url(#cardGrad3)" stroke="#14b8a6" stroke-width="1.5" filter="url(#shadow3)"/>
    <rect x="0" y="0" width="725" height="55" rx="14" fill="#0d9488" fill-opacity="0.3"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="23" font-weight="bold" fill="#5eead4">3.4 திருமூலர் திருமந்திரப் பாடல்கள்</text>

    <!-- Song 1 -->
    <rect x="20" y="75" width="685" height="150" rx="8" fill="#000000" fill-opacity="0.3"/>
    <text x="35" y="100" font-family="Noto Sans Tamil" font-size="15" font-weight="bold" fill="#fef08a">பாடல் 1 (நடமாடும் கோவில் - மக்கள் தொண்டே மகேசன் தொண்டு):</text>
    <text x="35" y="125" font-family="Noto Sans Tamil" font-size="14" fill="#5eead4">"படமாடக் கோயில் பகவற்கு ஒன்று ஈயில் நடமாடக் கோயில் நம்பர்க்கு அங்கு ஆகா</text>
    <text x="35" y="148" font-family="Noto Sans Tamil" font-size="14" fill="#5eead4">நடமாடக் கோயில் நம்பர்க்கு ஒன்று ஈயில் படமாடக் கோயில் பகவற்கு அது ஆமே"</text>
    <text x="35" y="180" font-family="Noto Sans Tamil" font-size="14" fill="#cbd5e1">பொருள்: மனிதனுக்குச் செய்யும் தொண்டே இறைவனுக்குச் சேரும் வழிபாடு.</text>

    <!-- Song 2 -->
    <rect x="20" y="240" width="685" height="160" rx="8" fill="#000000" fill-opacity="0.3"/>
    <text x="35" y="265" font-family="Noto Sans Tamil" font-size="15" font-weight="bold" fill="#fef08a">பாடல் 2 (உடம்பே ஆலயம் - சரீரமே திருக்கோவில்):</text>
    <text x="35" y="290" font-family="Noto Sans Tamil" font-size="14" fill="#5eead4">"உள்ளம் பெருங்கோயில் ஊனுடம்பு ஆலயம் வள்ளற் பிரானார்க்கு வாய் கோபுர வாசல்</text>
    <text x="35" y="313" font-family="Noto Sans Tamil" font-size="14" fill="#5eead4">தெள்ளத் தெளிந்தார்க்குச் சீவன் சிவலிங்கம் கள்ளப் புலனைந்தும் காளா மணிவிளக்கே"</text>
    <text x="35" y="345" font-family="Noto Sans Tamil" font-size="14" fill="#cbd5e1">பொருள்: உள்ளமே பெருங்கோவில்; உடலே ஆலயம்; சீவனே சிவலிங்கம்.</text>
  </g>

  <!-- Row 3: 3.5 Kings & Saints + 3.6 Murthi Thalam Theertham -->
  <g transform="translate(60, 1050)">
    <rect width="1480" height="470" rx="14" fill="url(#cardGrad3)" stroke="#14b8a6" stroke-width="1.5" filter="url(#shadow3)"/>
    <rect x="0" y="0" width="1480" height="55" rx="14" fill="#0d9488" fill-opacity="0.4"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#5eead4">3.5 மன்னர்களின் திருப்பணிகள் &amp; 3.6 மூர்த்தி-தலம்-தீர்த்தம் (கருடபுராண முக்கூட்டு)</text>

    <g transform="translate(25, 75)">
      <rect width="455" height="370" rx="10" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">மன்னர்கள் &amp; பக்தர்களின் தியாகம்</text>
      
      <text x="20" y="70" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• சேரன் கண்ணகி கோவில் இமயக்கல்லெடுப்பு</text>
      <text x="20" y="100" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• நிலம், ஆபரணங்கள், தேர்கள் வழங்கல்</text>
      <text x="20" y="130" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• குங்கிலியக்கலய நாயனாரின் கயிறு பக்தி</text>
      <text x="20" y="160" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• பூசலார் நாயனாரின் மனக்கோவில் அற்புதம்</text>
      <text x="20" y="190" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• பெரியாழ்வாரின் திருப்பல்லாண்டு பாசம்</text>
      <text x="20" y="220" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• தஞ்சை பெரிய கோவில் உச்சிக்கு ஒற்றைக்கல் தந்த அழகி பாட்டியின் தூய பக்தி</text>
    </g>

    <g transform="translate(510, 75)">
      <rect width="455" height="370" rx="10" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">புனிதத் தலங்களின் வகைகள்</text>

      <text x="20" y="70" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• 52 சக்தி பீடங்கள் &amp; 12 ஜோதிர்லிங்கங்கள்</text>
      <text x="20" y="100" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• 108 வைணவ திவ்ய தேசங்கள் &amp; பாடல் பெற்ற தலங்கள்</text>
      <text x="20" y="130" font-family="Noto Sans Tamil" font-size="15" fill="#5eead4" font-weight="bold">• பஞ்சபூதத் தலங்கள்:</text>
      <text x="35" y="160" font-family="Noto Sans Tamil" font-size="14" fill="#cbd5e1">நிலம் (காஞ்சி) • நீர் (திருவானைக்காவல்) • நெருப்பு (திருவண்ணாமலை) • காற்று (காளஹஸ்தி) • ஆகாயம் (சிதம்பரம்)</text>
      <text x="20" y="200" font-family="Noto Sans Tamil" font-size="15" fill="#5eead4" font-weight="bold">• புண்ணிய நதிகள்:</text>
      <text x="35" y="230" font-family="Noto Sans Tamil" font-size="14" fill="#cbd5e1">தாமிரபரணி, வைகை, காவிரி, தென்பெண்ணை, பாலாறு</text>
    </g>

    <g transform="translate(995, 75)">
      <rect width="455" height="370" rx="10" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">அவதரித்த புனித மகான்கள்</text>

      <text x="20" y="70" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• ஆதிசங்கரர் (காலடி)</text>
      <text x="20" y="100" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• ஸ்ரீ ராமானுஜர் (ஸ்ரீபெரும்புதூர்)</text>
      <text x="20" y="130" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• வள்ளலார் ராமலிங்க அடிகள் (வடலூர்)</text>
      <text x="20" y="160" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• தாயுமானவர் சுவாமிகள் (திருச்சி)</text>
      <text x="20" y="190" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• பட்டினத்தார் (திருவொற்றியூர்)</text>
      <text x="20" y="220" font-family="Noto Sans Tamil" font-size="15" fill="#f1f5f9">• கிருபானந்த வாரியார் • ரமணர் • பாம்பன் சுவாமிகள்</text>
    </g>
  </g>

  <!-- Row 4: 3.8 Ten Societal Benefits of Kovil -->
  <g transform="translate(60, 1550)">
    <rect width="1480" height="880" rx="14" fill="url(#cardGrad3)" stroke="#14b8a6" stroke-width="1.5" filter="url(#shadow3)"/>
    <rect x="0" y="0" width="1480" height="55" rx="14" fill="#0d9488" fill-opacity="0.4"/>
    <text x="25" y="38" font-family="Noto Sans Tamil" font-size="24" font-weight="bold" fill="#5eead4">3.8 ஆகம விதிகளும் திருக்கோவிலின் 10 சமுதாயப் பெருமைகளும்</text>

    <!-- Column 1 -->
    <g transform="translate(25, 75)">
      <rect width="695" height="140" rx="8" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">1. நகர நிர்மாணம் (Town Planning):</text>
      <text x="20" y="65" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">ஊரின் மையத்தில் கருவறை அமைத்து, அதைச் சுற்றி சமச்சீரான</text>
      <text x="20" y="90" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">மாட வீதிகளை ஆகம முறைப்படி வடிவமைத்தனர்.</text>
    </g>

    <g transform="translate(755, 75)">
      <rect width="695" height="140" rx="8" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">2. தூய்மையான வீதிகள் &amp; மழைநீர் வடிகால்:</text>
      <text x="20" y="65" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">கோவிலைச் சுற்றியுள்ள தெருக்கள் அகலமாகவும், மழைநீர் தேங்காத</text>
      <text x="20" y="90" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">சிறந்த வடிகால் அமைப்போடும் கட்டப்பட்டன.</text>
    </g>

    <!-- Column 2 -->
    <g transform="translate(25, 230)">
      <rect width="695" height="140" rx="8" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">3. விண்ணுயர்ந்த ராஜகோபுரங்கள்:</text>
      <text x="20" y="65" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">கோபுர கலசங்கள் இடிதாங்கிகளாக (Lightning Arresters) செயல்பட்டன;</text>
      <text x="20" y="90" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">தானியங்களைச் சேமிக்கும் களஞ்சியங்களாகவும் இருந்தன.</text>
    </g>

    <g transform="translate(755, 230)">
      <rect width="695" height="140" rx="8" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">4. திருக்குளங்கள் &amp; நிலத்தடி நீர் மேலாண்மை:</text>
      <text x="20" y="65" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">மழைநீரைச் சேகரித்து நிலத்தடி நீர்மட்டத்தை உயர்த்தும்</text>
      <text x="20" y="90" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">மிகப்பெரிய நீராதாரங்களாகத் திருக்குளங்கள் விளங்கின.</text>
    </g>

    <!-- Column 3 -->
    <g transform="translate(25, 385)">
      <rect width="695" height="140" rx="8" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">5. கல்வெட்டுகள் &amp; வரலாற்று ஆவணங்கள்:</text>
      <text x="20" y="65" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">அரச கட்டளைகள், தானங்கள், வரி விலக்குகள் மற்றும்</text>
      <text x="20" y="90" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">வானியல் குறிப்புகள் கல்வெட்டுகளாகவும் செப்புப் பட்டயங்களாகவும் பதியப்பட்டன.</text>
    </g>

    <g transform="translate(755, 385)">
      <rect width="695" height="140" rx="8" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">6. 64 கலைகளின் பண்பாட்டு அரங்கம்:</text>
      <text x="20" y="65" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">இயல், இசை, நாடகம், சிற்பக்கலை மற்றும் நூல் அரங்கேற்றங்கள்</text>
      <text x="20" y="90" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">(சேக்கிழார் பெரியபுராணம் தில்லையில் அரங்கேற்றம்) கோவிலிலேயே நடந்தன.</text>
    </g>

    <!-- Column 4 -->
    <g transform="translate(25, 540)">
      <rect width="695" height="140" rx="8" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">7. சமூக நல்லிணக்கத் திருவிழாக்கள்:</text>
      <text x="20" y="65" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">அனைத்து சமுதாய மக்களுக்கும் தனித்தனி பொறுப்புகள்</text>
      <text x="20" y="90" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">வழங்கப்பட்டு, ஒற்றுமையுடன் கொண்டாடும் பெருவிழாக்களாக அமைந்தன.</text>
    </g>

    <g transform="translate(755, 540)">
      <rect width="695" height="140" rx="8" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">8. உள்ளூர்ப் பொருளாதாரம் &amp; வணிகம்:</text>
      <text x="20" y="65" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">பூக்கள், பால், பழங்கள், எண்ணெய், கைவினைப் பொருட்கள்</text>
      <text x="20" y="90" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">விற்பனை மூலம் பல்லாயிரக்கணக்கானோருக்கு வாழ்வாதாரம் கிடைத்தது.</text>
    </g>

    <!-- Column 5 -->
    <g transform="translate(25, 695)">
      <rect width="695" height="160" rx="8" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">9. தேர்த்திருவிழா (சமத்துவ வடம்):</text>
      <text x="20" y="65" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">சாதி, மத, ஏழை, பணக்கார பேதமின்றி ஊர் மக்கள் அனைவரும்</text>
      <text x="20" y="90" font-family="Noto Sans Tamil" font-size="15" fill="#cbd5e1">ஒன்றுகூடி வடம்பிடித்துத் தேர் இழுக்கும் மகத்தான சமத்துவ நெறி.</text>
    </g>

    <g transform="translate(755, 695)">
      <rect width="695" height="160" rx="8" fill="#042f2e" stroke="#14b8a6" stroke-width="1"/>
      <text x="20" y="35" font-family="Noto Sans Tamil" font-size="18" fill="#fef08a" font-weight="bold">10. தியாக வரலாறு &amp; 5 நல்வழிப் பண்புகள்:</text>
      <text x="20" y="65" font-family="Noto Sans Tamil" font-size="14" fill="#cbd5e1">அன்னிய படையெடுப்புகளிலிருந்து கோவில்களைக் காக்க தன்னுயிர் ஈந்தனர்.</text>
      <text x="20" y="95" font-family="Noto Sans Tamil" font-size="14" fill="#5eead4" font-weight="bold">கோவில் நம்மை: 1. ஒருங்கிணைக்கிறது 2. நெறிப்படுத்துகிறது</text>
      <text x="20" y="125" font-family="Noto Sans Tamil" font-size="14" fill="#5eead4" font-weight="bold">3. மகிழ்வுறச் செய்கிறது 4. பிறவிப்பயன் தருகிறது 5. நல்வழிப்படுத்துகிறது!</text>
    </g>
  </g>

  <!-- Footer Branding -->
  <text x="800" y="2490" font-family="Noto Sans Tamil" font-size="18" fill="#94a3b8" text-anchor="middle">
    நம்ம சாமி நம்ம கோவில் • தலைப்பு 3: நம்ம கோவில் (முழுமையான ஆவண விளக்கப் படம்)
  </text>
</svg>`;
    renderSvgToPng(svg, path.join(OUTPUT_DIR, '3_நம்ம_கோவில்_Namma_Kovil.png'));
}

console.log('Generating 3 Comprehensive Topic Infographic Images...');
generateImage1();
generateImage2();
generateImage3();
console.log('Successfully generated all 3 images with 100% content!');
