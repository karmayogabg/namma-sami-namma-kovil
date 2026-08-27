const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = __dirname;

const baseCss = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Mukta+Malar:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap');

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        width: 1400px;
        background-color: #0a0e17;
        color: #f8fafc;
        font-family: 'Mukta Malar', 'Noto Sans Tamil', sans-serif;
        padding: 40px;
        line-height: 1.7;
    }

    .poster-container {
        border: 2px solid rgba(245, 158, 11, 0.4);
        border-radius: 24px;
        background: radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 50%, #0a0e17 100%);
        padding: 36px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        position: relative;
    }

    .header-banner {
        border-radius: 16px;
        padding: 24px 30px;
        text-align: center;
        margin-bottom: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .banner-t1 {
        background: linear-gradient(135deg, #78350f, #451a03);
        border: 2px solid #f59e0b;
    }

    .banner-t2 {
        background: linear-gradient(135deg, #881337, #4c0519);
        border: 2px solid #f43f5e;
    }

    .banner-t3 {
        background: linear-gradient(135deg, #134e4a, #042f2e);
        border: 2px solid #14b8a6;
    }

    .header-badge {
        display: inline-block;
        font-size: 0.85rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 4px 16px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
        margin-bottom: 8px;
    }

    .header-title {
        font-size: 2.3rem;
        font-weight: 800;
        color: #ffffff;
        margin-bottom: 6px;
        text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }

    .header-subtitle {
        font-size: 1.15rem;
        color: #fef08a;
        font-weight: 600;
    }

    .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }

    .grid-3 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 18px;
        margin-bottom: 20px;
    }

    .card {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }

    .card.t1 { border-top: 4px solid #f59e0b; }
    .card.t2 { border-top: 4px solid #f43f5e; }
    .card.t3 { border-top: 4px solid #14b8a6; }

    .card-header {
        font-size: 1.25rem;
        font-weight: 800;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .t1 .card-header { color: #fbbf24; }
    .t2 .card-header { color: #fda4af; }
    .t3 .card-header { color: #5eead4; }

    .card-body p {
        font-size: 0.95rem;
        color: #cbd5e1;
        margin-bottom: 8px;
        line-height: 1.65;
    }

    .card-body p:last-child {
        margin-bottom: 0;
    }

    .card-body strong {
        color: #f8fafc;
    }

    .verse-box {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 12px;
        padding: 16px 20px;
        margin: 12px 0;
        text-align: center;
    }

    .verse-text {
        font-size: 1.15rem;
        font-weight: 700;
        color: #fde047;
        line-height: 1.8;
    }

    .verse-author {
        font-size: 0.85rem;
        color: #94a3b8;
        margin-top: 6px;
        font-style: italic;
    }

    .verse-meaning {
        font-size: 0.9rem;
        color: #cbd5e1;
        margin-top: 8px;
        text-align: left;
        line-height: 1.6;
        border-top: 1px solid rgba(255,255,255,0.08);
        padding-top: 8px;
    }

    .features-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    .feature-item {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 12px 14px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }

    .feature-num {
        width: 26px;
        height: 26px;
        border-radius: 6px;
        background: #f59e0b;
        color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.85rem;
        flex-shrink: 0;
    }

    .feature-text h4 {
        font-size: 0.95rem;
        font-weight: 700;
        color: #f8fafc;
        margin-bottom: 2px;
    }

    .feature-text p {
        font-size: 0.85rem;
        color: #94a3b8;
        line-height: 1.5;
    }

    .footer-bar {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 0.9rem;
        color: #64748b;
        margin-top: 10px;
    }
`;

// 1. Poster 1: நம்ம (Namma)
const poster1Html = `<!DOCTYPE html>
<html lang="ta">
<head>
    <meta charset="UTF-8">
    <title>1. நம்ம (Namma) - Master Poster</title>
    <style>${baseCss}</style>
</head>
<body>
    <div class="poster-container">
        <div class="header-banner banner-t1">
            <div class="header-badge">பகுதி 1 • முதன்மைத் தூண் 1</div>
            <h1 class="header-title">தலைப்பு 1: நம்ம (NAMMA)</h1>
            <div class="header-subtitle">நமது சுய அடையாளம் • தாய்மொழி • வேத மரபு • பாரத உடை • குடும்ப அமைப்பு &amp; வானவியல் நாட்காட்டி</div>
        </div>

        <div class="grid-2">
            <!-- 1.1 Language -->
            <div class="card t1">
                <div class="card-header">1.1 நமது மொழி &amp; சிந்தனைப் பகிர்வு</div>
                <div class="card-body">
                    <p><strong>• மொழியின் தோற்றமும் சிந்தனைப் பகிர்வும்:</strong> கூடி வாழும் மக்களிடையே எண்ணங்களையும் கருத்துக்களையும் பரிமாறிக் கொள்ளவே மொழி உருவாகிறது.</p>
                    <p><strong>• தாய்மொழியின் தனித்துவ மகத்துவம்:</strong> மக்களின் உள்ளார்ந்த சிந்தனைகளும், தத்துவங்களும், உணர்வுகளும் தாய்மொழியில் மட்டுமே முழுமையாக வெளிப்பட முடியும்.</p>
                    <p><strong>• சமுதாய வலிமை:</strong> தாய்மொழியைப் பயன்படுத்துவது மொழியைப் பாதுகாப்பதோடு, நமது சிந்தனையைத் தெளிவாக்கி சமுதாயத்தை வலிமைப்படுத்துகிறது.</p>
                </div>
            </div>

            <!-- 1.2 Greeting -->
            <div class="card t1">
                <div class="card-header">1.2 வணக்கம் சொல்லும் வேத மரபு</div>
                <div class="card-body">
                    <p><strong>• கொரோனா கால உலகளாவிய ஏற்பு:</strong> தொற்று பேரிடர் காலத்தில் கைகுலுக்குவதைத் தவிர்த்து, உலக நாடுகள் நமது 'வணக்கம்' முறையை முழுமையாகப் பின்பற்றின.</p>
                    <p><strong>• "இருப்பதெல்லாம் இறைவனே" தத்துவம்:</strong> "ஈசா வாஸ்யம் இதம் சர்வம்" என்னும் வேதக் கருத்தின்படி, எதிரில் உள்ளவரிடம் உறையும் பரம்பொருளைத் தலைவணங்கும் சமத்துவ நெறி.</p>
                    <p><strong>• சமத்துவ ஆன்மீக அறிவியல்:</strong> இரு கரங்களையும் குவித்து மார்பருகே வைப்பது இதயப்பூர்வமான மரியாதையையும் சமத்துவ ஆன்மீக உணர்வையும் ஊட்டுகிறது.</p>
                </div>
            </div>
        </div>

        <div class="grid-2">
            <!-- 1.3 Attire -->
            <div class="card t1">
                <div class="card-header">1.3 பாரதப் பாரம்பரிய உடை (வேட்டி &amp; சேலை)</div>
                <div class="card-body">
                    <p><strong>• உலகின் முதல் ஆடை நாகரிகம்:</strong> உலகில் முதன்முதலில் நூல் நூற்று, நெய்து, ஆடை உடுத்திய பெருமை நமது பாரதப் பண்பாட்டிற்கே உரியது.</p>
                    <p><strong>• கம்பீரமான வேட்டியும் சேலையும்:</strong> பல்லாயிரக்கணக்கான ஆண்டுகளாக நாம் பின்பற்றி வரும் ஆடை. இன்றும் உலகளவில் சேலை மிக கண்ணியமான, விலைமதிப்பற்ற உடையாகப் போற்றப்படுகிறது.</p>
                    <p><strong>• காலச்சூழலும் தட்பவெப்ப நிலையும்:</strong> நமது தட்பவெப்ப நிலைக்கு ஏற்ற வேட்டி உடைக் கலாச்சாரத்தைப் போற்றிப் பேணி பெருமிதத்துடன் உடுத்த வேண்டும்.</p>
                </div>
            </div>

            <!-- 1.4 Astronomy & Calendar -->
            <div class="card t1">
                <div class="card-header">1.4 விழாக்களும் தமிழ் வானவியலும்</div>
                <div class="card-body">
                    <p><strong>• வானியல் &amp; புவியியல் அறிவியல்:</strong> நமது திருவிழாக்களும் கொண்டாட்டங்களும் வானவியலோடும் (Astronomy) புவியியலோடும் (Geography) இணைந்தவை.</p>
                    <p><strong>• பிறந்தநாள் கணக்கீட்டு மரபு:</strong> பூமி சூரியனைச் சுற்றி வரும் பாதையில், நாம் பிறந்த அதே புள்ளியில் மீண்டும் பூமி வரும் நாளைக் கணிப்பதே நமது பிறந்தநாள் மரபு.</p>
                    <p><strong>• சூரியமானம் &amp; சந்திரமானம்:</strong> சூரியன் மற்றும் சந்திரனின் இயக்கங்களை இணைத்து உருவாக்கப்பட்ட தமிழ் நாட்காட்டி உலகிற்கே வழிகாட்டும் அறிவியல் அற்புதம்.</p>
                </div>
            </div>
        </div>

        <div class="grid-2">
            <!-- 1.5 Family & 6 Karmas -->
            <div class="card t1">
                <div class="card-header">1.5 குடும்ப அமைப்பும் 6 தர்ம கர்மங்களும்</div>
                <div class="card-body">
                    <p><strong>• கூட்டுக்குடும்பத்தின் வலிமை:</strong> பாரதக் குடும்ப அமைப்பு என்பது உலகிற்கே வழிகாட்டும் பாதுகாப்புத் தூண்.</p>
                    <p><strong>• 6 நித்திய தர்ம கர்மங்கள்:</strong><br>
                    1. தேவ யக்ஞம் (இறை வழிபாடு &amp; ஆலயப் பணி)<br>
                    2. பித்ரு யக்ஞம் (முன்னோர்கள் வழிபாடு &amp; தர்மம்)<br>
                    3. மனுஷ்ய யக்ஞம் (விருந்தோம்பல் &amp; மனித நேய உதவி)<br>
                    4. பூத யக்ஞம் (விலங்குகள், பறவைகள், தாவரங்களுக்கு உணவளித்தல்)<br>
                    5. பிரம்ம யக்ஞம் (வேத, தமிழ் நூல்கள் கற்றல் &amp; கற்பித்தல்)<br>
                    6. சமுதாய தர்மம் (ஊர் நலம் &amp; தர்ம தொண்டுகள்)</p>
                </div>
            </div>

            <!-- 1.6 Relationships Science -->
            <div class="card t1">
                <div class="card-header">1.6 தமிழர் உறவுமுறைகளின் அறிவியல்</div>
                <div class="card-body">
                    <p><strong>• மரபணுப் பாதுகாப்பு (Genetic Safeguarding):</strong> தாய்மாமன், அத்தை, பெரியப்பா, சித்தப்பா போன்ற உறவுமுறைகள் வெறும் பெயர்கள் அல்ல; அவை மரபணுக் குறைபாடுகளைத் தவிர்க்கும் கட்டமைப்பு.</p>
                    <p><strong>• உளவியல் பாதுகாப்பு &amp; சமநிலை:</strong> குழந்தைகள் வளர்ப்பில் தாய்மாமனின் பாசமும் வழிகாட்டலும் குடும்பத்திற்கு மாபெரும் உளவியல் அரணாகத் திகழ்கிறது.</p>
                    <p><strong>• சமூகப் பிணைப்பும் ஆதரவும்:</strong> துன்பக் காலங்களில் கை கொடுக்கும் குடும்பப் பிணைப்பு தனிமனித மன அழுத்தத்தைத் தடுத்து சமூக ஒற்றுமையை நிலைநிறுத்துகிறது.</p>
                </div>
            </div>
        </div>

        <div class="grid-2">
            <!-- 1.7 Panchangam -->
            <div class="card t1">
                <div class="card-header">1.7 பாரம்பரிய பஞ்சாங்கம் &amp; காலக்கணக்கீடு</div>
                <div class="card-body">
                    <p><strong>• பஞ்சாங்கம் (5 அங்கங்கள்):</strong><br>
                    1. திதி (சந்திரனின் கோண நிலை) • 2. வாரம் (7 கிழமைகள்)<br>
                    3. நட்சத்திரம் (27 விண்மீன் மண்டலங்கள்) • 4. யோகம் (கூட்டு இயக்கம்)<br>
                    5. கரணம் (திதியின் அரைப் பங்கு)</p>
                    <p><strong>• அதிநவீன காலக்கணக்கீடு:</strong> விவசாயம், பண்டிகைகள், மங்கள நிகழ்வுகளை இயற்கை மாற்றங்களோடு இணைத்துச் செயல்படுத்தும் ஒப்பற்ற அறிவியல் சாதனம்.</p>
                </div>
            </div>

            <!-- 1.8 Hospitality -->
            <div class="card t1">
                <div class="card-header">1.8 உபசார மொழியின் உன்னதம் &amp; தியாகம்</div>
                <div class="card-body">
                    <p><strong>• இன்சொல் வரவேற்பு ("வாங்க", "வணக்கம்"):</strong> இல்லத்திற்கு வருபவர்களை இன்முகத்தோடு "வாங்க" என அழைத்து, நீர் வழங்கி உபசரிப்பது தமிழரின் தலையாய பண்பாடு.</p>
                    <p><strong>• சுயநலமற்ற தியாக உணர்வு:</strong> தன்னலம் கருதாமல் பிறருக்கு உதவும் தியாக மனப்பான்மையே ஒரு சமுதாயத்தை ஆன்மீக உன்னத நிலைக்கு உயர்த்துகிறது.</p>
                    <p><strong>• தலைமுறை வழிகாட்டல்:</strong> பெரியோர்களை மதித்தல், நற்பண்புகள் மற்றும் அறநெறிகளை அடுத்த தலைமுறைக்குக் கடத்துவதே நமது பண்பாட்டுப் பெருமை.</p>
                </div>
            </div>
        </div>

        <div class="footer-bar">
            நம்ம சாமி நம்ம கோவில் • தலைப்பு 1: நம்ம (Official Program Briefing Infographic)
        </div>
    </div>
</body>
</html>`;

// 2. Poster 2: நம்ம சாமி (Namma Sami)
const poster2Html = `<!DOCTYPE html>
<html lang="ta">
<head>
    <meta charset="UTF-8">
    <title>2. நம்ம சாமி (Namma Sami) - Master Poster</title>
    <style>${baseCss}</style>
</head>
<body>
    <div class="poster-container">
        <div class="header-banner banner-t2">
            <div class="header-badge">பகுதி 2 • முதன்மைத் தூண் 2</div>
            <h1 class="header-title">தலைப்பு 2: நம்ம சாமி (NAMMA SAMI)</h1>
            <div class="header-subtitle">மெய்ஞ்ஞான இறைத் தத்துவம் • எங்கும் நிறைந்த பரம்பொருள் • 3 வழிபாட்டு நிலைகள் &amp; கம்பராமாயணம்</div>
        </div>

        <!-- 2.1 What is Sami -->
        <div class="card t2" style="margin-bottom: 20px;">
            <div class="card-header">2.1 சாமி என்றால் என்ன? எங்கே இருக்கிறார்?</div>
            <div class="card-body" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                <p><strong>• சாமி என்றால் என்ன?:</strong><br><span style="color:#fda4af; font-size:1.05rem; font-weight:700;">"உடையவர்"</span><br>(அனைத்து பிரபஞ்சத்தையும் உயிர்களையும் தனக்கு உடைமையாகக் கொண்டு காப்பவர், தலைவன்).</p>
                <p><strong>• சாமி மொத்தம் எத்தனை?:</strong><br><span style="color:#fde047; font-size:1.05rem; font-weight:700;">ஒன்றே பல திருநாமங்கள்</span><br>ஒரே பரம்பொருள் பல வடிவங்களாகவும், அவதாரங்களாகவும் போற்றப்படுகிறார்.</p>
                <p><strong>• சாமி எங்கே இருக்கிறார்?:</strong><br><span style="color:#5eead4; font-size:1.05rem; font-weight:700;">"ஈசா வாஸ்யம் இதம் சர்வம்"</span><br>அங்கிங்கெனாதபடி எங்கும் பிரகாசமாய் ஆனந்த பூர்த்தியாகி விளங்கும் பரம்பொருள்.</p>
            </div>
        </div>

        <!-- 2.2 Karadharshanam Shloka -->
        <div class="card t2" style="margin-bottom: 20px; border-top-color: #fbbf24;">
            <div class="card-header" style="color: #fef08a;">2.2 கரதர்சனம் ஸ்லோகம் — தெய்வீகம் நம்மிலும் உள்ளது!</div>
            <div class="verse-box">
                <div class="verse-text">"கராக்ரே வசதே லக்ஷ்மீ: கரமத்யே ஸரஸ்வதீ | கரமூலே ஸ்திதே கௌரீ ப்ரபாதே கரதர்சனம் ||"</div>
                <div class="verse-author">— பாரதப் பாரம்பரிய பிரபாத ஸ்லோகம்</div>
                <div class="verse-meaning">
                    <strong>பொருள் விளக்கம்:</strong> விரல் நுனியில் லட்சுமி (செல்வம்/தொழில் வெற்றி) • உள்ளங்கையின் நடுவில் சரஸ்வதி (கல்வி/ஞானம்) • மணிக்கட்டுப் பகுதியில் கௌரி (ஆற்றல்/சக்தி). காலையில் கண் விழித்தவுடன் நமது உள்ளங்கையைப் பார்ப்பதன் மூலம், அனைத்து தெய்வீக ஆற்றல்களும் நமது சுய உழைப்பிலும் கரங்களிலும் குடி கொண்டுள்ளன என்பதை உணர்ந்து தன்னம்பிக்கையுடன் செயல்பட வேண்டும்.
                </div>
            </div>
        </div>

        <!-- 2.3 Stories -->
        <div class="grid-2">
            <div class="card t2">
                <div class="card-header">ஸ்ரீ ராமகிருஷ்ணர் அருளிய உவமை</div>
                <div class="card-body">
                    <p><strong>• உருவமும் அருவமும்:</strong> இறைவன் அனைத்திலும் நீக்கமற உறைகிறார் என்பதை ஸ்ரீ ராமகிருஷ்ண பரமஹம்சர் எளிய உவமையால் விளக்கினார்.</p>
                    <p><strong>• நீர் மற்றும் பனிக்கட்டி தத்துவம்:</strong> நீர் எப்படி திரவமாகவும், உறைந்த பனிக்கட்டியாகவும் உள்ளதோ, அதுபோல இறைவன் அருவமாகவும் உருவமாகவும் விளங்குகிறார்.</p>
                    <p><strong>• மெய்யான பக்தி:</strong> உலக உயிர்கள் அனைத்திலும் அந்த பரம்பொருளின் இருப்பைக் காண்பதே மெய்யான பக்தி நெறியாகும்.</p>
                </div>
            </div>

            <div class="card t2">
                <div class="card-header">குரு - சிஷ்யர் &amp; யானை கதை (பக்தியுடன் விவேகம்)</div>
                <div class="card-body">
                    <p><strong>• மதம் பிடித்த யானை நிகழ்வு:</strong> "எல்லாம் நாராயணன்" என்ற உபதேசத்தைக் கேட்டு, ஓடிவந்த யானையைக் கண்டு விலகாத சிஷ்யனை யானை தூக்கி வீசியது.</p>
                    <p><strong>• குருவின் விளக்கம்:</strong> "யானையில் நாராயணன் இருப்பது உண்மையே; ஆனால் யானை மேல் அமர்ந்து 'விலகிப் போ!' என்று எச்சரித்த பாகனிலும் நாராயணனே பேசினான்!"</p>
                    <p><strong>• வாழ்க்கைப் பாடம்:</strong> பக்தி என்பது மூடநம்பிக்கை அல்ல; விவேகத்துடனும் பகுத்தறிவுடனும் செயல்படுவதே மெய்ஞ்ஞானம் ஆகும்.</p>
                </div>
            </div>
        </div>

        <!-- 2.4 Three Tiers -->
        <div class="grid-3">
            <div class="card t2" style="border-top: 4px solid #f59e0b;">
                <div class="card-header" style="color: #fbbf24;">நிலை 1: குலசாமி (குலதெய்வம்)</div>
                <div class="card-body">
                    <p><strong>• குலம் என்றால் என்ன?:</strong> ஒரே முன்னோர்களின் இரத்த உறவு மற்றும் வம்சாவழி பாரம்பரியத்தால் இணைக்கப்பட்ட பெருங்குடும்பம்.</p>
                    <p><strong>• குலத்தைக் காப்பவர்:</strong> இந்த குலத்தைக் காப்பவரே குலசாமி.</p>
                    <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; margin:8px 0; text-align:center; font-size:0.88rem; color:#fef08a;">
                        "குலம் தரும் செல்வம் தந்திடும் அடியார் படுதுயர் ஆயின எல்லாம் நிலந்தரம் செய்யும்..."<br><span style="color:#94a3b8; font-size:0.78rem;">— திருமங்கையாழ்வார்</span>
                    </div>
                    <p>ஆண்டுக்கொரு முறையாவது குடும்பத்துடன் சென்று வணங்குவது வம்சவிருத்தியை அளிக்கும்.</p>
                </div>
            </div>

            <div class="card t2" style="border-top: 4px solid #3b82f6;">
                <div class="card-header" style="color: #60a5fa;">நிலை 2: கிராம சாமி (ஊர் கோவில்)</div>
                <div class="card-body">
                    <p><strong>• சமுதாய ஒருமைப்பாடு:</strong> ஊர் மக்கள் அனைவரையும், அனைத்து சமுதாய மக்களையும் பேதமின்றி ஒன்றிணைக்கும் பெருஞ்சக்தியாக கிராமக் கோவில் விளங்குகிறது.</p>
                    <p><strong>• எல்லை காவல் தெய்வங்கள்:</strong> அய்யனார், மாரியம்மன், காளியம்மன், முனீஸ்வரர் போன்ற தெய்வங்கள் ஊரின் காவல் அரண்.</p>
                    <p><strong>• ஊர் வளம்:</strong> மழை வளம், விவசாய முன்னேற்றம், நோய் நொடிகள் நீங்குதல் மற்றும் சமூக நல்லிணக்கத்திற்கு ஊர் திருவிழாக்களே மையம்.</p>
                </div>
            </div>

            <div class="card t2" style="border-top: 4px solid #ec4899;">
                <div class="card-header" style="color: #f472b6;">நிலை 3: இஷ்டதெய்வம் (விருப்ப தெய்வம்)</div>
                <div class="card-body">
                    <p><strong>• தனிமனித மேம்பாடு:</strong> தனிமனித மன அமைதியையும், ஆன்மீக மேம்பாட்டையும் உறுதி செய்வது இஷ்டதெய்வம்.</p>
                    <p><strong>• பூரண சுதந்திரம்:</strong> தனக்குப் பிடித்த இறைவனைத் தேர்ந்தெடுத்து வழிபடும் பூரண உரிமை இந்து தர்மத்தின் உன்னத சிறப்பு.</p>
                    <p><strong>• நண்பனைப் போன்ற பக்தி:</strong> சிவன், முருகன், பெருமாள், விநாயகர் என உள்ளம் உருகி நினைக்கும் தெய்வம் உற்ற நண்பனைப் போல மன அழுத்தத்தைப் போக்குகிறது.</p>
                </div>
            </div>
        </div>

        <!-- 2.5 Kamban Verse -->
        <div class="card t2">
            <div class="card-header">2.5 கம்பராமாயணம் — இரணியன் வதைப்படலம் (எங்கும் நிறைந்த பரம்பொருள்)</div>
            <div class="verse-box" style="margin-bottom:0;">
                <div class="verse-text">
                    "சாணினும் உளன்; ஓர் தன்மை அணுவினைச் சத கூறிட்ட<br>
                    கோணினும் உளன்; மா மேருக் குன்றினும் உளன்; இந் நின்ற<br>
                    தூணினும் உளன்; நீ சொன்ன சொல்லினும் உளன்; இப் போது<br>
                    காணுதி விரைவின்” என்றான்;
                </div>
                <div class="verse-author">— கவிச்சக்கரவர்த்தி கம்பர் (கம்பராமாயணம், இரணியன் வதைப்படலம்)</div>
                <div class="verse-meaning">
                    <strong>பொருள் விளக்கம்:</strong> பிரஹலாதன் தந்தை இரணியனிடம் முழங்குகிறான்: இறைவன் ஒரு சாண் அளவிலும் இருப்பான்; ஒரு அணுவை நூறு கூறுகளாகப் பிளந்த அதன் சிறிய கோணத்திலும் இருப்பான்; மாபெரும் மேரு மலையிலும் இருப்பான்; எதிரில் நிற்கும் இந்தத் தூணிலும் இருப்பான்; நீ பேசிய சொல்லிலும் இருப்பான்! என இறைவனின் எங்கும் நிறைந்த சர்வ வியாபகத் தன்மையை பறைசாற்றுகிறான்.
                </div>
            </div>
        </div>

        <div class="footer-bar">
            நம்ம சாமி நம்ம கோவில் • தலைப்பு 2: நம்ம சாமி (Official Program Briefing Infographic)
        </div>
    </div>
</body>
</html>`;

// 3. Poster 3: நம்ம கோவில் (Namma Kovil)
const poster3Html = `<!DOCTYPE html>
<html lang="ta">
<head>
    <meta charset="UTF-8">
    <title>3. நம்ம கோவில் (Namma Kovil) - Master Poster</title>
    <style>${baseCss}</style>
</head>
<body>
    <div class="poster-container">
        <div class="header-banner banner-t3">
            <div class="header-badge">பகுதி 3 • முதன்மைத் தூண் 3</div>
            <h1 class="header-title">தலைப்பு 3: நம்ம கோவில் (NAMMA KOVIL)</h1>
            <div class="header-subtitle">ஆலய அறிவியல் • 4 யுகங்கள் • ஆகம நிர்மாணம் • மூர்த்தி-தலம்-தீர்த்தம் &amp; 10 சமுதாயப் பெருமைகள்</div>
        </div>

        <div class="grid-2">
            <!-- 3.1 Etymology -->
            <div class="card t3">
                <div class="card-header">3.1 கோவில் &amp; ஆலயம் சொல்லிலக்கணம்</div>
                <div class="card-body">
                    <p><strong>• கோவில் (கோ + இல்):</strong> கோ = தலைவன் (இறைவன்) | இல் = இல்லம் / வீடு (வசிப்பிடம்).<br><span style="color:#5eead4; font-weight:700;">கோவில் = "இறைவனின் வசிப்பிடம் / அரண்மனை"</span></p>
                    <p><strong>• ஆலயம் (ஆ + லயம்):</strong> ஆ = ஆன்மா / ஜீவாத்மா (உயிர்) | லயம் = ஒடுங்குதல் (கரைதல்).<br><span style="color:#5eead4; font-weight:700;">ஆலயம் = "ஜீவாத்மா இறைவனிடம் லயித்து அமைதி பெறும் இடம்"</span></p>
                    <p><strong>• முன்னோர் பொன்மொழிகள்:</strong> "கோவிலில்லா ஊரில் குடியிருக்க வேண்டாம்" • "ஆலயம் தொழுவது சாலவும் நன்று" • "கோபுர தரிசனம் கோடி புண்ணியம்"</p>
                </div>
            </div>

            <!-- 3.2 Four Yugas & 3.3 Five Forms -->
            <div class="card t3">
                <div class="card-header">3.2 நான்கு யுகங்களும் &amp; 3.3 ஐந்து வகை வழிபாட்டு வடிவங்கள்</div>
                <div class="card-body">
                    <p><strong>• 4 யுகங்கள் &amp; கலியுக விக்ரக ஆராதனை:</strong> முதல் மூன்று யுகங்களில் (கிருத, திரேதா, துவாபர) யாகங்கள்/தவம்; கலியுகத்தில் <strong>"மூர்த்தி வழிபாடு"</strong> மனித மனதை ஒருமுகப்படுத்தி பக்குவப்படுத்துகிறது.</p>
                    <p><strong>• 5 வகை வழிபாட்டு வடிவங்கள்:</strong><br>
                    1. பட வழிபாடு (இல்லங்களில் திருவுருவப் படங்கள்)<br>
                    2. கல் &amp; பளிங்குச் சிலைகள் (ஆகம முறை பிரதிஷ்டை)<br>
                    3. யந்திர வழிபாடு (ஸ்ரீசக்ரம் போன்ற பிரபஞ்ச வடிவியல்)<br>
                    4. விளக்கு &amp; அக்கினி (ஜோதி &amp; ஹோம குண்ட யாகங்கள்)<br>
                    5. மண் &amp; பஞ்சலோக மூர்த்திகள் (உற்சவ திருமேனிகள்)</p>
                </div>
            </div>
        </div>

        <!-- 3.4 Thirumoolar Verses -->
        <div class="card t3" style="margin-bottom:20px;">
            <div class="card-header">3.4 திருமூலர் அருளிய திருமந்திரப் பாடல்கள்</div>
            <div class="grid-2" style="margin-bottom:0;">
                <div class="verse-box" style="margin:0;">
                    <div class="verse-text" style="font-size:1rem;">
                        "படமாடக் கோயில் பகவற்கு ஒன்று ஈயில்<br>
                        நடமாடக் கோயில் நம்பர்க்கு அங்கு ஆகா<br>
                        நடமாடக் கோயில் நம்பர்க்கு ஒன்று ஈயில்<br>
                        படமாடக் கோயில் பகவற்கு அது ஆமே"
                    </div>
                    <div class="verse-author">— திருமூலர் (நடமாடும் கோவில் - மக்கள் தொண்டே மகேசன் தொண்டு)</div>
                </div>

                <div class="verse-box" style="margin:0;">
                    <div class="verse-text" style="font-size:1rem;">
                        "உள்ளம் பெருங்கோயில் ஊனுடம்பு ஆலயம்<br>
                        வள்ளற் பிரானார்க்கு வாய் கோபுர வாசல்<br>
                        தெள்ளத் தெளிந்தார்க்குச் சீவன் சிவலிங்கம்<br>
                        கள்ளப் புலனைந்தும் காளா மணிவிளக்கே"
                    </div>
                    <div class="verse-author">— திருமூலர் (உடம்பே ஆலயம் - சரீரமே திருக்கோவில்)</div>
                </div>
            </div>
        </div>

        <!-- 3.5 Kings & Saints + 3.6 Murthi Thalam Theertham -->
        <div class="grid-3" style="margin-bottom:20px;">
            <div class="card t3">
                <div class="card-header">மன்னர்கள் &amp; பக்தர்களின் தியாகம்</div>
                <div class="card-body">
                    <p>• சேரன் கண்ணகி கோவில் இமயக்கல்லெடுப்பு</p>
                    <p>• குங்கிலியக்கலய நாயனாரின் கயிறு பக்தி</p>
                    <p>• பூசலார் நாயனாரின் மனக்கோவில் அற்புதம்</p>
                    <p>• பெரியாழ்வாரின் திருப்பல்லாண்டு</p>
                    <p>• தஞ்சைப் பெரிய கோவில் விமான உச்சிக்கு ஒற்றைக் கருங்கல்லை வழங்கிய அழகி பாட்டியின் தூய பக்தி</p>
                </div>
            </div>

            <div class="card t3">
                <div class="card-header">புனிதத் தலங்களின் வகைகள்</div>
                <div class="card-body">
                    <p>• 52 சக்தி பீடங்கள், 12 ஜோதிர்லிங்கங்கள், 108 திவ்ய தேசங்கள், பாடல் பெற்ற சிவத்தலங்கள்</p>
                    <p><strong>• பஞ்சபூதத் தலங்கள்:</strong> நிலம் (காஞ்சி), நீர் (திருவானைக்காவல்), நெருப்பு (திருவண்ணாமலை), காற்று (காளஹஸ்தி), ஆகாயம் (சிதம்பரம்)</p>
                    <p><strong>• புண்ணிய நதிகள்:</strong> தாமிரபரணி, வைகை, காவிரி, தென்பெண்ணை, பாலாறு</p>
                </div>
            </div>

            <div class="card t3">
                <div class="card-header">அவதரித்த மகான்கள் &amp; ஆகமம்</div>
                <div class="card-body">
                    <p>• ஆதிசங்கரர் (காலடி) • ராமானுஜர் (ஸ்ரீபெரும்புதூர்) • வள்ளலார் (வடலூர்) • தாயுமானவர் (திருச்சி) • பட்டினத்தார் (திருவொற்றியூர்) • வாரியார் • பாம்பன் சுவாமிகள்</p>
                    <p><strong>• ஆகம வழிபாட்டுச் சுதந்திரம்:</strong> எந்த நிர்ப்பந்தமும் இன்றி விரும்பிய வடிவில் வழிபடும் தனித்துவ சுதந்திரம் (மந்திரம் - யந்திரம் - தந்திரம்).</p>
                </div>
            </div>
        </div>

        <!-- 3.8 Ten Societal Benefits -->
        <div class="card t3">
            <div class="card-header">3.8 ஆகம விதிகளும் திருக்கோவிலின் 10 சமுதாயப் பெருமைகளும்</div>
            <div class="features-list">
                <div class="feature-item">
                    <div class="feature-num">1</div>
                    <div class="feature-text">
                        <h4>நகர நிர்மாணம்</h4>
                        <p>ஊரின் மையத்தில் கருவறை அமைத்து, அதைச் சுற்றி சமச்சீரான மாட வீதிகளை வடிவமைத்தனர்.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-num">2</div>
                    <div class="feature-text">
                        <h4>தூய்மையான வீதிகள் &amp; வடிகால்</h4>
                        <p>கோவிலைச் சுற்றியுள்ள தெருக்கள் அகலமாகவும், மழைநீர் தேங்காத சிறந்த வடிகால் அமைப்போடும் கட்டப்பட்டன.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-num">3</div>
                    <div class="feature-text">
                        <h4>விண்ணுயர்ந்த ராஜகோபுரங்கள்</h4>
                        <p>கோபுர கலசங்கள் இடிதாங்கிகளாக (Lightning Arresters) செயல்பட்டன; தானியக் களஞ்சியங்களாகவும் இருந்தன.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-num">4</div>
                    <div class="feature-text">
                        <h4>திருக்குளங்கள் &amp; நிலத்தடி நீர்</h4>
                        <p>மழைநீரைச் சேகரித்து நிலத்தடி நீர்மட்டத்தை உயர்த்தும் மிகப்பெரிய நீராதாரங்களாகத் திருக்குளங்கள் விளங்கின.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-num">5</div>
                    <div class="feature-text">
                        <h4>கல்வெட்டுகள் &amp; செப்புப் பட்டயங்கள்</h4>
                        <p>அரச கட்டளைகள், தானங்கள், வரி விலக்குகள் மற்றும் வானியல் குறிப்புகள் வரலாற்று ஆவணங்களாகப் பதியப்பட்டன.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-num">6</div>
                    <div class="feature-text">
                        <h4>64 கலைகளின் பண்பாட்டு அரங்கம்</h4>
                        <p>இயல், இசை, நாடகம், சிற்பக்கலை மற்றும் நூல் அரங்கேற்றங்கள் (சேக்கிழார் பெரியபுராணம் அரங்கேற்றம்) நடந்தன.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-num">7</div>
                    <div class="feature-text">
                        <h4>சமூக நல்லிணக்கத் திருவிழாக்கள்</h4>
                        <p>அனைத்து சமுதாய மக்களுக்கும் தனித்தனி பொறுப்புகள் வழங்கப்பட்டு, ஒற்றுமையுடன் கொண்டாடும் பெருவிழாக்கள்.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-num">8</div>
                    <div class="feature-text">
                        <h4>உள்ளூர்ப் பொருளாதாரம் &amp; வணிகம்</h4>
                        <p>பூக்கள், பால், பழங்கள், எண்ணெய், கைவினைப் பொருட்கள் விற்பனை மூலம் பல்லாயிரக்கணக்கானோருக்கு வாழ்வாதாரம்.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-num">9</div>
                    <div class="feature-text">
                        <h4>தேர்த்திருவிழா (சமத்துவ வடம்)</h4>
                        <p>சாதி, மத, ஏழை, பணக்கார பேதமின்றி ஊர் மக்கள் அனைவரும் ஒன்றுகூடி வடம்பிடித்துத் தேர் இழுக்கும் மகத்தான சமத்துவ நெறி.</p>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-num">10</div>
                    <div class="feature-text">
                        <h4>தியாக வரலாறு &amp; 5 நல்வழிப் பண்புகள்</h4>
                        <p>அன்னிய படையெடுப்பிலிருந்து காக்க தன்னுயிர் ஈந்தனர். கோவில் நம்மை: ஒருங்கிணைக்கிறது, நெறிப்படுத்துகிறது, மகிழ்வுறச் செய்கிறது, பிறவிப்பயன் தருகிறது, நல்வழிப்படுத்துகிறது!</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer-bar">
            நம்ம சாமி நம்ம கோவில் • தலைப்பு 3: நம்ம கோவில் (Official Program Briefing Infographic)
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'poster_1_namma.html'), poster1Html, 'utf8');
fs.writeFileSync(path.join(OUTPUT_DIR, 'poster_2_namma_sami.html'), poster2Html, 'utf8');
fs.writeFileSync(path.join(OUTPUT_DIR, 'poster_3_namma_kovil.html'), poster3Html, 'utf8');

console.log('Successfully generated HTML poster templates for all 3 topics!');
