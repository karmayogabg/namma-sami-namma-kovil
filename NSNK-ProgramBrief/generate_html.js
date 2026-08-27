const fs = require('fs');
const path = require('path');

const AUDIO_DIR = __dirname;
const CACHE_PATH = path.join(AUDIO_DIR, 'audio_transcripts.json');
const HTML_OUTPUT = path.join(AUDIO_DIR, 'NSNK-ProgramBriefing.html');

console.log('Reading transcripts cache from:', CACHE_PATH);
const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
const audioFiles = Object.keys(cache).sort((a, b) => parseInt(a.split('.')[0]) - parseInt(b.split('.')[0]));

function renderTrack(f, item) {
    const num = item.index || parseInt(f.split('.')[0]);
    const sizeMb = item.size_bytes ? (item.size_bytes / (1024 * 1024)).toFixed(1) + ' MB' : 'Audio';
    const title = item.title_tamil || f;
    const cat = item.topic_classification || 'நம்ம சாமி நம்ம கோவில்';

    let filterBadge = 'பகுதி 1: நம்ம';
    let badgeStyle = 'background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);';
    if (cat.includes('நம்ம கோவில்')) {
        filterBadge = 'பகுதி 3: நம்ம கோவில்';
        badgeStyle = 'background: rgba(13, 148, 136, 0.15); color: #14b8a6; border: 1px solid rgba(13, 148, 136, 0.3);';
    } else if (cat.includes('நம்ம சாமி')) {
        filterBadge = 'பகுதி 2: நம்ம சாமி';
        badgeStyle = 'background: rgba(225, 29, 72, 0.15); color: #fb7185; border: 1px solid rgba(225, 29, 72, 0.3);';
    }

    let takeawaysHtml = '';
    if (item.key_takeaways_tamil && item.key_takeaways_tamil.length > 0) {
        const pts = item.key_takeaways_tamil.map(p => `<li style="margin-bottom:6px;">${p}</li>`).join('');
        takeawaysHtml = `
            <div class="audio-takeaways-box" style="margin-top:12px; background:rgba(0,0,0,0.22); padding:12px 16px; border-radius:8px; font-size:0.9rem; border:1px solid rgba(255,255,255,0.07);">
                <div style="font-weight:700; color:var(--saffron-primary); margin-bottom:8px; display:flex; align-items:center; gap:8px;">
                    <i data-lucide="check-circle-2" style="width:16px; height:16px;"></i> முக்கியக் கருத்துக்கள் (Key Takeaways):
                </div>
                <ul style="margin:0; padding-left:20px; line-height:1.65; color:var(--text-muted);">
                    ${pts}
                </ul>
            </div>`;
    }

    let storiesHtml = '';
    if (item.spiritual_stories_and_references && item.spiritual_stories_and_references.length > 0) {
        const stText = item.spiritual_stories_and_references.join(' • ');
        storiesHtml = `
            <div class="audio-stories-box" style="margin-top:10px; font-size:0.86rem; color:#93c5fd; background:rgba(59,130,246,0.08); padding:8px 14px; border-radius:6px; border-left:3px solid #3b82f6; line-height:1.6;">
                <strong><i data-lucide="book-open" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-right:4px;"></i>ஆன்மீகக் குறிப்பு / வரலாற்றுத் தலம்:</strong> ${stText}
            </div>`;
    }

    let transcriptHtml = '';
    if (item.verbatim_transcript_tamil) {
        transcriptHtml = `
            <details class="audio-transcript-details" style="margin-top:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:10px 14px; font-size:0.88rem;">
                <summary style="cursor:pointer; color:var(--saffron-primary); font-weight:700; outline:none; display:flex; align-items:center; justify-content:space-between; user-select:none;">
                    <span style="display:flex; align-items:center; gap:8px;">
                        <i data-lucide="file-text" style="width:16px; height:16px;"></i> முழுமையான தமிழ் உரை வடிவம் (Verbatim Tamil Transcript)
                    </span>
                    <span style="font-size:0.75rem; color:var(--text-dim); background:rgba(255,255,255,0.08); padding:2px 8px; border-radius:4px;">அச்சுப் பிரதி</span>
                </summary>
                <div class="transcript-content-text" style="margin-top:10px; max-height:280px; overflow-y:auto; line-height:1.75; color:var(--text-muted); white-space:pre-wrap; padding:14px; background:rgba(0,0,0,0.3); border-radius:6px; font-family:var(--font-tamil); border:1px solid rgba(255,255,255,0.05); font-size:0.9rem;">
${item.verbatim_transcript_tamil}
                </div>
            </details>`;
    }

    const encodedFile = encodeURIComponent(f);
    return `
        <!-- Track ${num} -->
        <div class="audio-track-card" id="audio-track-${num}" style="display:flex; flex-direction:column; gap:10px; padding:18px; margin-bottom:16px;">
            <div class="audio-track-top" style="display:flex; justify-content:space-between; align-items:flex-start; gap:14px;">
                <div class="audio-track-name" style="flex:1; display:flex; align-items:flex-start; gap:12px;">
                    <div style="width:36px; height:36px; border-radius:8px; background:rgba(245,158,11,0.15); color:var(--saffron-primary); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:800; font-size:1rem;">
                        ${num}
                    </div>
                    <div>
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
                            <span style="font-size:0.75rem; font-weight:700; padding:3px 9px; border-radius:4px; ${badgeStyle}">${filterBadge}</span>
                            <span style="font-size:0.75rem; color:var(--text-dim); font-family:monospace; background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:4px;">${f}</span>
                        </div>
                        <h4 style="font-weight:800; font-size:1.05rem; color:var(--text-main); line-height:1.45; margin:0;">${title}</h4>
                    </div>
                </div>
                <span class="audio-track-size" style="font-size:0.8rem; font-weight:700; color:var(--text-dim); background:rgba(255,255,255,0.06); padding:4px 10px; border-radius:6px; flex-shrink:0;">${sizeMb}</span>
            </div>
            <audio class="audio-player-elem" controls preload="none" style="width:100%; height:40px; margin-top:8px; border-radius:8px;">
                <source src="${encodedFile}" type="audio/mpeg">
                Your browser does not support audio playback.
            </audio>
            ${takeawaysHtml}
            ${storiesHtml}
            ${transcriptHtml}
        </div>`;
}

const allTracksHtml = audioFiles.map(f => renderTrack(f, cache[f])).join('\n');

const htmlContent = `<!DOCTYPE html>
<html lang="ta">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>நம்ம சாமி நம்ம கோவில் - அதிகாரப்பூர்வ திட்ட கையேடு & முழு ஆவணப் பெட்டகம்</title>
    <meta name="description" content="நம்ம சாமி நம்ம கோவில் விரிவான திட்ட வழிகாட்டி: தலைப்பு 1 - நம்ம, தலைப்பு 2 - நம்ம சாமி, தலைப்பு 3 - நம்ம கோவில், கள ஆய்வு நெறிமுறைகள் மற்றும் 19 ஆடியோ விரிவுரைகளின் முழு உரைத் தொகுப்பு.">
    
    <!-- Google Fonts for Tamil and English Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Mukta+Malar:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <style>
        :root {
            --bg-base: #0a0e17;
            --bg-surface: #111827;
            --bg-card: #182234;
            --bg-card-hover: #1f2d45;
            --border-color: rgba(255, 255, 255, 0.09);
            --border-focus: rgba(245, 158, 11, 0.6);
            
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --text-dim: #64748b;
            
            /* Cultural Theme Palette */
            --saffron-primary: #f59e0b;
            --saffron-dark: #d97706;
            --saffron-glow: rgba(245, 158, 11, 0.25);
            --maroon-accent: #e11d48;
            --gold-accent: #fbbf24;
            --teal-accent: #0d9488;
            --indigo-accent: #6366f1;
            
            --font-tamil: 'Mukta Malar', 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-heading: 'Cinzel', 'Mukta Malar', serif;
            --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            
            --radius-sm: 8px;
            --radius-md: 14px;
            --radius-lg: 20px;
            --radius-xl: 28px;
            --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.3);
            --shadow-md: 0 10px 30px -8px rgba(0, 0, 0, 0.5);
            --shadow-lg: 0 20px 45px -10px rgba(0, 0, 0, 0.7);
            --shadow-saffron: 0 8px 30px rgba(245, 158, 11, 0.15);
        }

        [data-theme="temple"] {
            --bg-base: #130a04;
            --bg-surface: #201207;
            --bg-card: #2d1a0b;
            --bg-card-hover: #3d230e;
            --border-color: rgba(251, 191, 36, 0.15);
            --text-main: #fffbeb;
            --text-muted: #d6bb9e;
            --text-dim: #9a7d61;
            --saffron-primary: #f59e0b;
            --saffron-dark: #b45309;
            --saffron-glow: rgba(245, 158, 11, 0.35);
        }

        [data-theme="light"] {
            --bg-base: #f8fafc;
            --bg-surface: #ffffff;
            --bg-card: #f1f5f9;
            --bg-card-hover: #e2e8f0;
            --border-color: #cbd5e1;
            --border-focus: #f59e0b;
            --text-main: #0f172a;
            --text-muted: #334155;
            --text-dim: #64748b;
            --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
            --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.08);
            --shadow-lg: 0 16px 36px rgba(0, 0, 0, 0.12);
            --shadow-saffron: 0 8px 24px rgba(245, 158, 11, 0.12);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            scroll-behavior: smooth;
            font-size: 16px;
        }

        body {
            font-family: var(--font-tamil);
            background-color: var(--bg-base);
            color: var(--text-main);
            line-height: 1.8;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Reading Progress Bar */
        #read-progress {
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            width: 0%;
            background: linear-gradient(90deg, #f59e0b, #ef4444, #fbbf24);
            z-index: 10000;
            transition: width 0.1s linear;
        }

        /* Header Navbar */
        .header-nav {
            position: sticky;
            top: 0;
            z-index: 999;
            background: rgba(17, 24, 39, 0.95);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border-color);
            transition: all 0.3s ease;
        }

        [data-theme="temple"] .header-nav {
            background: rgba(32, 18, 7, 0.95);
        }

        [data-theme="light"] .header-nav {
            background: rgba(255, 255, 255, 0.95);
        }

        .nav-container {
            max-width: 1440px;
            margin: 0 auto;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .brand-box {
            display: flex;
            align-items: center;
            gap: 14px;
            text-decoration: none;
            color: var(--text-main);
        }

        .brand-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--saffron-primary), var(--maroon-accent));
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            box-shadow: 0 4px 16px var(--saffron-glow);
        }

        .brand-titles h1 {
            font-size: 1.25rem;
            font-weight: 800;
            line-height: 1.2;
            color: var(--text-main);
        }

        .brand-titles span {
            font-size: 0.76rem;
            font-family: var(--font-sans);
            color: var(--saffron-primary);
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 6px;
            list-style: none;
        }

        .nav-link {
            padding: 8px 14px;
            border-radius: var(--radius-sm);
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.88rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }

        .nav-link:hover, .nav-link.active {
            color: var(--saffron-primary);
            background: rgba(245, 158, 11, 0.12);
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .btn-icon {
            width: 38px;
            height: 38px;
            border-radius: var(--radius-sm);
            border: 1px solid var(--border-color);
            background: var(--bg-surface);
            color: var(--text-main);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-icon:hover {
            border-color: var(--saffron-primary);
            color: var(--saffron-primary);
            transform: translateY(-2px);
        }

        .btn-print-master {
            padding: 8px 18px;
            font-size: 0.88rem;
            font-weight: 800;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: #000;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            border: none;
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
            transition: all 0.2s ease;
        }

        .btn-print-master:hover {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
        }

        /* Hero Banner */
        .hero-section {
            background: linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, transparent 100%);
            border-bottom: 1px solid var(--border-color);
            padding: 48px 24px 36px;
            text-align: center;
            position: relative;
        }

        .hero-content {
            max-width: 1100px;
            margin: 0 auto;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 18px;
            background: rgba(245, 158, 11, 0.12);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 999px;
            color: var(--saffron-primary);
            font-size: 0.88rem;
            font-weight: 700;
            margin-bottom: 18px;
        }

        .hero-title {
            font-size: 2.8rem;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 14px;
            line-height: 1.25;
            color: var(--text-main);
        }

        .hero-subtitle {
            font-size: 1.15rem;
            color: var(--text-muted);
            max-width: 900px;
            margin: 0 auto 28px;
            line-height: 1.75;
        }

        /* Topic Quick Jump Pills */
        .topic-pill-group {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 24px;
        }

        .topic-pill {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 10px 20px;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 999px;
            text-decoration: none;
            color: var(--text-main);
            font-size: 0.95rem;
            font-weight: 700;
            transition: all 0.2s ease;
        }

        .topic-pill:hover {
            border-color: var(--saffron-primary);
            background: rgba(245, 158, 11, 0.1);
            color: var(--saffron-primary);
            transform: translateY(-2px);
        }

        .topic-pill .pill-num {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--saffron-primary);
            color: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 800;
        }

        /* Search Bar */
        .search-bar-wrap {
            max-width: 720px;
            margin: 0 auto;
            position: relative;
        }

        .search-input-field {
            width: 100%;
            padding: 14px 20px 14px 50px;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            color: var(--text-main);
            font-size: 0.98rem;
            font-family: var(--font-tamil);
            outline: none;
            transition: all 0.2s ease;
        }

        .search-input-field:focus {
            border-color: var(--saffron-primary);
            box-shadow: 0 0 0 3px var(--saffron-glow);
        }

        .search-icon-pos {
            position: absolute;
            left: 18px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-dim);
        }

        /* Main Layout */
        .main-wrapper {
            max-width: 1440px;
            margin: 0 auto;
            padding: 40px 24px;
            display: grid;
            grid-template-columns: 290px 1fr;
            gap: 36px;
            flex: 1;
        }

        /* Sidebar Navigation */
        .sidebar {
            position: sticky;
            top: 80px;
            height: calc(100vh - 100px);
            overflow-y: auto;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 22px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .sidebar-title {
            font-size: 1.05rem;
            font-weight: 800;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 12px;
        }

        .toc-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .toc-list a {
            display: block;
            padding: 7px 12px;
            border-radius: var(--radius-sm);
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.86rem;
            font-weight: 600;
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
            line-height: 1.4;
        }

        .toc-list a:hover, .toc-list a.active {
            color: var(--saffron-primary);
            background: rgba(245, 158, 11, 0.1);
            border-left-color: var(--saffron-primary);
        }

        /* Major Section Grand Headers */
        .major-section-banner {
            border-radius: var(--radius-lg);
            padding: 26px 30px;
            margin-bottom: 28px;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            box-shadow: var(--shadow-md);
        }

        .banner-topic1 {
            background: linear-gradient(135deg, #78350f, #451a03);
            border: 2px solid #f59e0b;
        }

        .banner-topic2 {
            background: linear-gradient(135deg, #881337, #4c0519);
            border: 2px solid #f43f5e;
        }

        .banner-topic3 {
            background: linear-gradient(135deg, #134e4a, #042f2e);
            border: 2px solid #14b8a6;
        }

        .banner-survey {
            background: linear-gradient(135deg, #312e81, #1e1b4b);
            border: 2px solid #6366f1;
        }

        .banner-audio {
            background: linear-gradient(135deg, #064e3b, #022c22);
            border: 2px solid #10b981;
        }

        .major-banner-info {
            flex: 1;
        }

        .major-banner-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.8rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 4px 12px;
            border-radius: 999px;
            margin-bottom: 8px;
            background: rgba(255, 255, 255, 0.18);
            color: #fff;
        }

        .major-banner-title {
            font-size: 1.85rem;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.25;
            margin-bottom: 6px;
        }

        .major-banner-desc {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.5;
        }

        .major-banner-icon-bg {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            flex-shrink: 0;
        }

        /* Briefing Sections */
        .brief-section {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-xl);
            padding: 38px 34px;
            margin-bottom: 44px;
            box-shadow: var(--shadow-sm);
        }

        .section-subheading {
            font-size: 1.35rem;
            font-weight: 800;
            color: var(--text-main);
            margin: 28px 0 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 8px;
        }

        /* Grid Layouts */
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .concept-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: all 0.25s ease;
        }

        .concept-card:hover {
            border-color: var(--border-focus);
            background: var(--bg-card-hover);
            transform: translateY(-3px);
            box-shadow: var(--shadow-md);
        }

        .card-icon-header {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: var(--radius-sm);
            background: rgba(245, 158, 11, 0.12);
            color: var(--saffron-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .concept-card h3, .concept-card h4 {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--text-main);
        }

        .concept-card p {
            font-size: 0.95rem;
            color: var(--text-muted);
            line-height: 1.75;
        }

        /* Callout Box */
        .callout-box {
            background: rgba(245, 158, 11, 0.06);
            border-left: 4px solid var(--saffron-primary);
            border-radius: 0 var(--radius-md) var(--radius-md) 0;
            padding: 22px 26px;
            margin: 24px 0;
        }

        .callout-title {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--saffron-primary);
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Verses Box */
        .verse-box {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 24px;
            margin: 24px 0;
            position: relative;
        }

        .verse-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }

        .verse-tag {
            font-size: 0.88rem;
            font-weight: 700;
            color: var(--saffron-primary);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .btn-copy-verse {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-dim);
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.78rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }

        .btn-copy-verse:hover {
            color: var(--text-main);
            border-color: var(--text-muted);
        }

        .verse-text {
            font-size: 1.15rem;
            font-weight: 600;
            color: #fef08a;
            line-height: 1.85;
            white-space: pre-line;
            margin-bottom: 12px;
            font-family: var(--font-tamil);
        }

        .verse-author {
            font-size: 0.88rem;
            color: var(--text-dim);
            text-align: right;
            font-style: italic;
        }

        .verse-explanation {
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px solid var(--border-color);
            font-size: 0.94rem;
            color: var(--text-muted);
            line-height: 1.7;
        }

        /* Features List */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
            gap: 16px;
        }

        .feature-item {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 18px 20px;
            display: flex;
            align-items: flex-start;
            gap: 14px;
        }

        .feature-num {
            width: 34px;
            height: 34px;
            border-radius: 8px;
            background: var(--saffron-primary);
            color: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 0.95rem;
            flex-shrink: 0;
        }

        .feature-body h4 {
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 4px;
        }

        .feature-body p {
            font-size: 0.9rem;
            color: var(--text-muted);
            line-height: 1.6;
        }

        /* Resources Cards */
        .resource-card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 16px;
            margin: 20px 0 32px;
        }

        .resource-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .resource-info {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .resource-icon-badge {
            width: 48px;
            height: 48px;
            border-radius: var(--radius-sm);
            background: linear-gradient(135deg, #ef4444, #b91c1c);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            font-weight: 800;
            flex-shrink: 0;
        }

        .resource-icon-badge.docx {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .resource-text h4 {
            font-size: 1rem;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 2px;
        }

        .resource-text span {
            font-size: 0.8rem;
            color: var(--text-dim);
        }

        .btn-view-doc {
            padding: 8px 16px;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            color: var(--text-main);
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
            white-space: nowrap;
        }

        .btn-view-doc:hover {
            border-color: var(--saffron-primary);
            color: var(--saffron-primary);
            background: rgba(245, 158, 11, 0.1);
        }

        /* Audio Suite */
        .audio-suite {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            padding: 24px;
            margin-top: 24px;
        }

        .audio-suite-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 14px;
            border-bottom: 1px solid var(--border-color);
            flex-wrap: wrap;
            gap: 12px;
        }

        .audio-track-list {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
        }

        .audio-track-card {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            transition: all 0.2s ease;
        }

        .audio-track-card:hover {
            border-color: rgba(245, 158, 11, 0.4);
        }

        .audio-player-elem {
            height: 38px;
            border-radius: 8px;
            outline: none;
        }

        /* Footer */
        .footer {
            background: var(--bg-surface);
            border-top: 1px solid var(--border-color);
            padding: 40px 24px;
            text-align: center;
            margin-top: auto;
        }

        .footer-content {
            max-width: 800px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .footer-logo {
            font-size: 1.15rem;
            font-weight: 800;
            color: var(--text-main);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .footer p {
            font-size: 0.92rem;
            color: var(--text-muted);
            line-height: 1.6;
        }

        /* ========================================================= */
        /* PRINT-TO-PDF PROFESSIONAL STYLESHEET (ZERO MISSING CONTENT) */
        /* ========================================================= */
        @page {
            size: A4 portrait;
            margin: 12mm 14mm 14mm 14mm;
        }

        @media print {
            html, body {
                background: #ffffff !important;
                color: #0f172a !important;
                font-size: 10pt !important;
                line-height: 1.55 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .header-nav, .sidebar, .topic-pill-group, .search-bar-wrap, .btn-icon, .btn-print-master, .btn-copy-verse, #read-progress, .audio-player-elem {
                display: none !important;
            }

            .main-wrapper {
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
            }

            .hero-section {
                padding: 16px 0 !important;
                border-bottom: 2px solid #d97706 !important;
                page-break-before: auto !important;
                page-break-after: avoid !important;
            }

            .hero-title {
                font-size: 22pt !important;
                color: #78350f !important;
            }

            .brief-section {
                border: none !important;
                box-shadow: none !important;
                padding: 20px 0 10px !important;
                page-break-before: always !important;
                break-before: page !important;
            }

            .major-section-banner {
                padding: 16px 20px !important;
                margin-bottom: 16px !important;
                border-radius: 8px !important;
                page-break-after: avoid !important;
                break-after: avoid !important;
            }

            .major-banner-title {
                font-size: 15pt !important;
                color: #ffffff !important;
            }

            .concept-card, .verse-box, .callout-box, .resource-card, .audio-track-card, .feature-item {
                border: 1px solid #cbd5e1 !important;
                background: #f8fafc !important;
                color: #1e293b !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                box-shadow: none !important;
                margin-bottom: 12px !important;
            }

            .verse-box {
                background: #fffbeb !important;
                border: 1.5px solid #fde68a !important;
            }

            .verse-text {
                color: #991b1b !important;
                font-weight: 700 !important;
                font-size: 11pt !important;
            }

            .cards-grid, .resource-card-grid, .features-grid {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 12px !important;
            }

            .audio-suite {
                display: block !important;
                background: transparent !important;
                border: none !important;
                padding: 0 !important;
            }

            .audio-track-list {
                display: grid !important;
                grid-template-columns: 1fr !important;
                gap: 12px !important;
            }

            .audio-track-card {
                padding: 12px 14px !important;
            }

            /* Ensure all transcripts and details are 100% visible in print */
            details {
                display: block !important;
            }

            details[open] summary ~ *, details summary ~ * {
                display: block !important;
            }

            .transcript-content-text {
                max-height: none !important;
                overflow: visible !important;
                background: #f1f5f9 !important;
                color: #0f172a !important;
                border: 1px solid #cbd5e1 !important;
                font-size: 9.5pt !important;
            }

            a {
                text-decoration: none !important;
                color: inherit !important;
            }
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
            .main-wrapper {
                grid-template-columns: 1fr;
            }
            .sidebar {
                display: none;
            }
        }

        @media (max-width: 768px) {
            .hero-title {
                font-size: 2.1rem;
            }
            .brief-section {
                padding: 24px 20px;
            }
            .cards-grid, .features-grid {
                grid-template-columns: 1fr;
            }
            .nav-links {
                display: none;
            }
        }
    </style>
</head>
<body>

    <!-- Reading Progress Bar -->
    <div id="read-progress"></div>

    <!-- Header Navbar -->
    <header class="header-nav">
        <div class="nav-container">
            <a href="#hero" class="brand-box">
                <div class="brand-icon">
                    <i data-lucide="flame" style="width:24px; height:24px;"></i>
                </div>
                <div class="brand-titles">
                    <h1>நம்ம சாமி நம்ம கோவில்</h1>
                    <span>Official Program Briefing & Resource Portal</span>
                </div>
            </a>

            <!-- Navigation Links -->
            <ul class="nav-links">
                <li><a href="#topic1" class="nav-link"><i data-lucide="users" style="width:16px;"></i> பகுதி 1: நம்ம</a></li>
                <li><a href="#topic2" class="nav-link"><i data-lucide="sparkles" style="width:16px;"></i> பகுதி 2: நம்ம சாமி</a></li>
                <li><a href="#topic3" class="nav-link"><i data-lucide="landmark" style="width:16px;"></i> பகுதி 3: நம்ம கோவில்</a></li>
                <li><a href="#survey" class="nav-link"><i data-lucide="clipboard-check" style="width:16px;"></i> பகுதி 4: கள ஆய்வு</a></li>
                <li><a href="#audio-repository" class="nav-link"><i data-lucide="headphones" style="width:16px;"></i> பகுதி 5: 19 ஆடியோக்கள்</a></li>
                <li><a href="#documents" class="nav-link"><i data-lucide="folder-archive" style="width:16px;"></i> ஆவணங்கள்</a></li>
            </ul>

            <!-- Controls -->
            <div class="nav-actions">
                <button class="btn-icon" id="font-dec-btn" title="எழுத்துருவைக் குறைக்கவும் (Decrease Font)" onclick="changeFontSize(-1)">
                    <span style="font-weight:700; font-size:0.85rem;">A-</span>
                </button>
                <button class="btn-icon" id="font-inc-btn" title="எழுத்துருவை அதிகரிக்கவும் (Increase Font)" onclick="changeFontSize(1)">
                    <span style="font-weight:700; font-size:0.95rem;">A+</span>
                </button>
                <button class="btn-icon" id="theme-btn" title="வண்ண அமைப்பு (Change Theme)" onclick="cycleTheme()">
                    <i data-lucide="palette" id="theme-icon" style="width:18px; height:18px;"></i>
                </button>
                <a href="NSNK-WorkshopActivities.html" class="btn-print-master" style="text-decoration:none; background:rgba(99, 102, 241, 0.18); border-color:#6366f1; color:#a5b4fc;" title="பயிற்சிப் பட்டறை ஊடாடும் குழுச் செயல்பாடுகள் கையேடு">
                    <i data-lucide="sparkles" style="width:16px; height:16px;"></i>
                    <span>🤹 குழுச் செயல்பாடுகள்</span>
                </a>
                <a href="NSNK-FullTranscript.pdf" target="_blank" class="btn-print-master" style="text-decoration:none;" title="முழு உரை விளக்கக் கையேடு PDF (NSNK-FullTranscript.pdf)">
                    <i data-lucide="file-text" style="width:18px; height:18px;"></i>
                    <span>📄 முழு PDF கையேடு</span>
                </a>
                <button class="btn-print-master" style="background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.2); color:var(--text-main);" title="இப்பக்கத்தை அச்சிடு (Browser Print)" onclick="printDocument()">
                    <i data-lucide="printer" style="width:18px; height:18px;"></i>
                    <span>🖨️ அச்சிடு</span>
                </button>
            </div>
        </div>
    </header>

    <!-- Hero Banner -->
    <section class="hero-section" id="hero">
        <div class="hero-content">
            <div class="hero-badge">
                <i data-lucide="book-open-check" style="width:16px; height:16px;"></i>
                அதிகாரப்பூர்வ விரிவான திட்ட விளக்கக் கையேடு (Official Program Briefing Handbook)
            </div>
            <h1 class="hero-title">
                <span>நம்ம சாமி நம்ம கோவில்</span>
            </h1>
            <p class="hero-subtitle">
                பாரம்பரியம், மொழி, பண்பாடு, மெய்ஞ்ஞான இறைத் தத்துவம், ஆகம ஆலய அறிவியல் மற்றும் சமுதாய ஒருமைப்பாட்டின் அடித்தளமாகத் திகழும் திருக்கோவில்களின் முழுமையான வழிகாட்டி மற்றும் 19 ஆடியோ விரிவுரைகளின் களஞ்சியம்.
            </p>

            <!-- Topic Navigation Pills -->
            <div class="topic-pill-group">
                <a href="#topic1" class="topic-pill">
                    <span class="pill-num">1</span>
                    <span>பகுதி 1: நம்ம (சுய அடையாளம் & பண்பாடு)</span>
                </a>
                <a href="#topic2" class="topic-pill">
                    <span class="pill-num">2</span>
                    <span>பகுதி 2: நம்ம சாமி (மெய்ஞ்ஞான இறைத் தத்துவம்)</span>
                </a>
                <a href="#topic3" class="topic-pill">
                    <span class="pill-num">3</span>
                    <span>பகுதி 3: நம்ம கோவில் (ஆலய அறிவியல் & சமூக மையம்)</span>
                </a>
                <a href="#survey" class="topic-pill">
                    <span class="pill-num">4</span>
                    <span>பகுதி 4: கள ஆய்வு & அழைப்பாளர் நெறிமுறைகள்</span>
                </a>
                <a href="#audio-repository" class="topic-pill">
                    <span class="pill-num">5</span>
                    <span>பகுதி 5: 19 ஆடியோ விரிவுரைகள் களஞ்சியம்</span>
                </a>
            </div>

            <!-- Instant Search Bar -->
            <div class="search-bar-wrap">
                <i data-lucide="search" class="search-icon-pos" style="width:20px; height:20px;"></i>
                <input type="text" id="live-search" class="search-input-field" placeholder="தேட வேண்டிய வார்த்தையை உள்ளிடவும் (எ.கா: தாய்மொழி, குலசாமி, பூசலார், ஆகமம், பஞ்சபூதம், திருமூலர், திருவிழா...)" onkeyup="filterContent()">
            </div>
        </div>
    </section>

    <!-- Main Layout -->
    <main class="main-wrapper">

        <!-- Sidebar / Table of Contents -->
        <aside class="sidebar">
            <div class="sidebar-title">
                <i data-lucide="list-tree" style="color:var(--saffron-primary);"></i>
                <span>பொருளடக்கம் (Index)</span>
            </div>
            <ul class="toc-list">
                <li><a href="#topic1" style="font-weight:700; color:var(--saffron-primary);">பகுதி 1: தலைப்பு 1 — நம்ம</a></li>
                <li><a href="#topic1-lang" style="padding-left:20px;">• 1.1 நமது மொழி & சிந்தனை</a></li>
                <li><a href="#topic1-greeting" style="padding-left:20px;">• 1.2 வணக்கம் சொல்லும் மரபு</a></li>
                <li><a href="#topic1-attire" style="padding-left:20px;">• 1.3 பாரம்பரிய உடை (வேட்டி & சேலை)</a></li>
                <li><a href="#topic1-festivals" style="padding-left:20px;">• 1.4 விழாக்களும் தமிழ் வானவியலும்</a></li>
                <li><a href="#topic1-family" style="padding-left:20px;">• 1.5 குடும்பமும் 6 கர்மங்களும்</a></li>
                <li><a href="#topic1-relations" style="padding-left:20px;">• 1.6 உறவுமுறைகளின் அறிவியல்</a></li>
                <li><a href="#topic1-panchangam" style="padding-left:20px;">• 1.7 பாரம்பரிய பஞ்சாங்கம்</a></li>
                <li><a href="#topic1-hospitality" style="padding-left:20px;">• 1.8 உபசார மொழியின் உன்னதம்</a></li>

                <li style="margin-top:10px;"><a href="#topic2" style="font-weight:700; color:#fb7185;">பகுதி 2: தலைப்பு 2 — நம்ம சாமி</a></li>
                <li><a href="#topic2-whatis" style="padding-left:20px;">• 2.1 சாமி என்றால் யார்? எங்குள்ளார்?</a></li>
                <li><a href="#topic2-stories" style="padding-left:20px;">• 2.2 ராமகிருஷ்ணர் & யானை கதைகள்</a></li>
                <li><a href="#topic2-karadharshanam" style="padding-left:20px;">• 2.3 கரதர்சனம் ஸ்லோகம்</a></li>
                <li><a href="#topic2-three-tiers" style="padding-left:20px;">• 2.4 சாமியின் 3 நிலைகள்</a></li>
                <li><a href="#topic2-kula" style="padding-left:32px;">— நிலை 1: குலசாமி (குலதெய்வம்)</a></li>
                <li><a href="#topic2-grama" style="padding-left:32px;">— நிலை 2: கிராம சாமி (ஊர் கோவில்)</a></li>
                <li><a href="#topic2-ishta" style="padding-left:32px;">— நிலை 3: இஷ்டதெய்வம்</a></li>
                <li><a href="#topic2-kamban" style="padding-left:20px;">• 2.5 கம்பராமாயணப் பாடல்</a></li>

                <li style="margin-top:10px;"><a href="#topic3" style="font-weight:700; color:#14b8a6;">பகுதி 3: தலைப்பு 3 — நம்ம கோவில்</a></li>
                <li><a href="#topic3-etymology" style="padding-left:20px;">• 3.1 கோவில் & ஆலயம் சொல்லிலக்கணம்</a></li>
                <li><a href="#topic3-yugas" style="padding-left:20px;">• 3.2 நான்கு யுகங்களும் கலியுக வழிபாடும்</a></li>
                <li><a href="#topic3-forms" style="padding-left:20px;">• 3.3 ஐந்து வகை வழிபாட்டு வடிவங்கள்</a></li>
                <li><a href="#topic3-thirumoolar" style="padding-left:20px;">• 3.4 திருமூலர் திருமந்திரப் பாடல்கள்</a></li>
                <li><a href="#topic3-kings-saints" style="padding-left:20px;">• 3.5 மன்னர்கள் & நாயன்மார்கள் பக்தி</a></li>
                <li><a href="#topic3-pillars" style="padding-left:20px;">• 3.6 மூர்த்தி, தலம், தீர்த்தம்</a></li>
                <li><a href="#topic3-agamas" style="padding-left:20px;">• 3.7 ஆகமங்களும் வழிபாட்டுச் சுதந்திரமும்</a></li>
                <li><a href="#topic3-benefits" style="padding-left:20px;">• 3.8 கோவிலின் 10 சமுதாயப் பெருமைகள்</a></li>

                <li style="margin-top:10px;"><a href="#survey" style="font-weight:700; color:#818cf8;">பகுதி 4: கள ஆய்வு & நெறிமுறைகள்</a></li>
                <li><a href="#audio-repository" style="font-weight:700; color:#34d399;">பகுதி 5: 19 ஆடியோ விரிவுரைகள்</a></li>
                <li><a href="#documents" style="font-weight:700; color:#60a5fa;">பகுதி 6: பதிவிறக்க ஆவணங்கள்</a></li>
            </ul>

            <div style="display:flex; flex-direction:column; gap:8px; margin-top:auto;">
                <a href="NSNK-FullTranscript.pdf" target="_blank" class="btn-print-master" style="width:100%; justify-content:center; text-decoration:none;" title="முழு உரை விளக்கக் கையேடு PDF">
                    <i data-lucide="file-text" style="width:16px; height:16px;"></i>
                    <span>📄 முழு PDF கையேடு</span>
                </a>
                <button class="btn-print-master" style="width:100%; justify-content:center; background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.2); color:var(--text-main);" onclick="printDocument()">
                    <i data-lucide="printer" style="width:16px; height:16px;"></i>
                    <span>🖨️ உலாவி அச்சிடு</span>
                </button>
            </div>
        </aside>

        <!-- Content Area -->
        <div class="content-area">

            <!-- ========================================================= -->
            <!-- SECTION 1: தலைப்பு 1 — நம்ம (NAMMA) -->
            <!-- ========================================================= -->
            <section class="brief-section" id="topic1">
                
                <!-- Grand Banner for Topic 1 -->
                <div class="major-section-banner banner-topic1">
                    <div class="major-banner-info">
                        <div class="major-banner-badge">பகுதி 1 • முதன்மைத் தூண் 1</div>
                        <h2 class="major-banner-title">தலைப்பு 1: நம்ம (நமது சுய அடையாளம், மொழி & பண்பாடு)</h2>
                        <p class="major-banner-desc">தாய்மொழி சிந்தனை, வணக்கம் சொல்லும் வேத மரபு, பாரத பாரம்பரிய உடை, குடும்ப அமைப்பு & தமிழ் வானவியல் நாட்காட்டி.</p>
                    </div>
                    <div class="major-banner-icon-bg">
                        <i data-lucide="users" style="width:36px; height:36px;"></i>
                    </div>
                </div>

                <p style="font-size:1.05rem; color:var(--text-muted); margin-bottom:24px; line-height:1.8;">
                    <strong>'நம்ம'</strong> என்ற உணர்வே மனித சமுதாயத்தை ஒன்றிணைக்கும் மூலவிசை. நமது தொன்மையான பாரதப் பண்பாட்டில் நமது தாய்மொழி, வணக்கம் சொல்லும் முறை, உடை, வாழ்வியல் முறைகள் மற்றும் கொண்டாட்டங்கள் ஒவ்வொன்றிலும் ஆழமான அறிவியலும் ஆன்மீகமும் இழையோடியுள்ளன.
                </p>

                <!-- Cards Grid for Topic 1 -->
                <div class="cards-grid">
                    
                    <!-- Language Card -->
                    <div class="concept-card" id="topic1-lang">
                        <div class="card-icon-header">
                            <div class="card-icon"><i data-lucide="languages"></i></div>
                            <h3>1.1 நமது மொழி & சிந்தனைப் பகிர்வு</h3>
                        </div>
                        <p>
                            கூடி வாழும் மக்களிடையே கருத்துக்கள் பரிமாறிக் கொள்ளவே மொழி உருவாகிறது. மொழியின் சொந்தக்காரர்களான மக்களின் எண்ணங்களும், சிந்தனைகளும், தத்துவங்களும் தாய்மொழியில் மட்டுமே முழுமையாகப் பிரதிபலிக்க முடியும்.
                        </p>
                        <p>
                            அந்த மக்கள் அவர்களது தாய்மொழியைப் பயன்படுத்துவதன் மூலமே அவர்களது சிந்தனைகளும் உணர்வுகளும் முழுமையாகவும் சரியாகவும் வெளிப்படுத்தப்படும். ஆகவே தாய்மொழியைப் பயன்படுத்துவது மொழியைப் பாதுகாப்பதோடு மட்டுமின்றி, நமது ஆழமான சிந்தனைகளைத் தெளிவாக்கி சமுதாயத்தை வலிமைப்படுத்துகிறது.
                        </p>
                    </div>

                    <!-- Greeting Card -->
                    <div class="concept-card" id="topic1-greeting">
                        <div class="card-icon-header">
                            <div class="card-icon"><i data-lucide="hand-heart"></i></div>
                            <h3>1.2 வணக்கம் சொல்லும் வேத மரபு</h3>
                        </div>
                        <p>
                            கொரோனா தொற்று பேரிடர் காலத்தில் நோய் தொற்றைத் தவிர்க்க உலக நாடுகள் அனைத்தும் கைகுலுக்குவதைத் தவிர்த்து, நமது பாரம்பரிய <strong>'வணக்கம்'</strong> முறையைப் பின்பற்றின.
                        </p>
                        <p>
                            இரு கைகளையும் கூப்பி வணங்குவது <strong>"இருப்பதெல்லாம் இறைவனே"</strong>, <strong>"ஈசா வாஸ்யம் இதம் சர்வம்"</strong> என்னும் வேதக் கருத்தை ஏற்று, எதிரில் உள்ள சக மனிதரிடம் உறையும் பரம்பொருளைத் தலைவணங்கி ஏற்கும் உயர்ந்த சமத்துவ நெறியாகும்.
                        </p>
                    </div>

                    <!-- Traditional Attire Card -->
                    <div class="concept-card" id="topic1-attire">
                        <div class="card-icon-header">
                            <div class="card-icon"><i data-lucide="shirt"></i></div>
                            <h3>1.3 பாரம்பரிய உடை (வேட்டி & சேலை)</h3>
                        </div>
                        <p>
                            உலகில் முதன்முதலில் நூல் நூற்று, நெய்து, ஆடை உடுத்திய பெருமை நமது பாரத நாகரிகத்திற்கே உரியது. பல்லாயிரக்கணக்கான ஆண்டுகளாக நமது பண்பாடு பின்பற்றி வரும் கம்பீரமான உடை நமது வேட்டியும் சேலையும் ஆகும்.
                        </p>
                        <p>
                            இன்றும் உலகளவில் சேலை மிக அழகிய, கண்ணியமான, விலைமதிப்பற்ற உடையாகப் போற்றப்படுகிறது. நமது தட்பவெப்ப நிலைக்கும் காலசூழ்நிலைக்கும் மிகவும் பொருத்தமான வேட்டி கலாச்சாரத்தை நாம் கைவிடாமல், வாய்ப்புள்ள போதெல்லாம் பாரம்பரிய உடைகளை அணிந்து பெருமிதத்துடன் வாழ்வோம்.
                        </p>
                    </div>

                    <!-- Festivals Card -->
                    <div class="concept-card" id="topic1-festivals">
                        <div class="card-icon-header">
                            <div class="card-icon"><i data-lucide="sun-moon"></i></div>
                            <h3>1.4 விழாக்களும் தமிழ் வானவியலும்</h3>
                        </div>
                        <p>
                            நமது திருவிழாக்களும் பிறந்தநாள் கொண்டாட்டங்களும் வானவியலோடும் (Astronomy) புவியியலோடும் (Geography) இணைந்து அறிவியல் பூர்வமாகக் கணிக்கப்பட்டவை.
                        </p>
                        <p>
                            பூமி சூரியனைச் சுற்றி வரும் பாதையில் நாம் பிறந்த அதே புள்ளியில் மீண்டும் பூமி வரும் நாளைக் கணிப்பதே நமது பிறந்தநாள் மரபு. சூரியனின் சுழற்சியை அடிப்படையாகக் கொண்ட 'சூரியமானம்' மற்றும் சந்திரனின் இயக்கத்தை அடிப்படையாகக் கொண்ட 'சந்திரமானம்' இணைந்ததே தமிழ் நாட்காட்டியாகும்.
                        </p>
                    </div>

                    <!-- Family and Karmas -->
                    <div class="concept-card" id="topic1-family">
                        <div class="card-icon-header">
                            <div class="card-icon"><i data-lucide="home"></i></div>
                            <h3>1.5 குடும்ப அமைப்பும் 6 தர்ம கர்மங்களும்</h3>
                        </div>
                        <p>
                            பாரதக் குடும்ப அமைப்பு என்பது உலகிற்கே வழிகாட்டும் தூண். குடும்பத்தில் அமைதியும் நல்லிணக்கமும் நிலவ முன்னோர்கள் ஆறு வகை நித்திய தர்ம கர்மங்களை வகுத்துள்ளனர்.
                        </p>
                        <p>
                            பெரியோர்களை மதித்தல், விருந்தோம்பல், உறவு முறைகளைப் பேணுதல் மற்றும் தான தர்மங்கள் வழியே குடும்பப் பிணைப்பும் சமுதாய ஒழுக்கமும் தழைத்தோங்குகிறது.
                        </p>
                    </div>

                    <!-- Relationships Science -->
                    <div class="concept-card" id="topic1-relations">
                        <div class="card-icon-header">
                            <div class="card-icon"><i data-lucide="dna"></i></div>
                            <h3>1.6 தமிழர் உறவுமுறைகளின் அறிவியல்</h3>
                        </div>
                        <p>
                            தாய்மாமன், அத்தை, பெரியப்பா, சித்தப்பா போன்ற தமிழர் உறவுமுறைகள் வெறும் பெயர்கள் அல்ல; அவை மரபணுப் பாதுகாப்பு (Genetic Safeguarding), குடும்பப் பாதுகாப்பு மற்றும் உளவியல் சமநிலையைக் காக்கும் உன்னத கட்டமைப்பாகும்.
                        </p>
                    </div>

                    <!-- Panchangam Card -->
                    <div class="concept-card" id="topic1-panchangam">
                        <div class="card-icon-header">
                            <div class="card-icon"><i data-lucide="calendar"></i></div>
                            <h3>1.7 பாரம்பரிய பஞ்சாங்கமும் காலக்கணக்கீடும்</h3>
                        </div>
                        <p>
                            திதி, வாரம், நட்சத்திரம், யோகம், கரணம் என்னும் ஐந்து அங்கங்களைக் கொண்ட பஞ்சாங்கம், காலத்தை துல்லியமாகக் கணிக்கும் அதிநவீன பாரத வானியல் அறிவியலின் சான்றாகும்.
                        </p>
                    </div>

                    <!-- Hospitality Card -->
                    <div class="concept-card" id="topic1-hospitality">
                        <div class="card-icon-header">
                            <div class="card-icon"><i data-lucide="heart-handshake"></i></div>
                            <h3>1.8 உபசார மொழியின் உன்னதம் & தியாகம்</h3>
                        </div>
                        <p>
                            வீட்டிற்கு வருபவர்களை "வாங்க" என்று முகமலர்ச்சியோடு வரவேற்பதும், இன்சொல் கூறி உபசரிப்பதும் தமிழரின் தலையாய பண்பாடு. சுயநலமற்ற தியாக உணர்வும், பிறருக்கு உதவும் பரந்த மனப்பான்மையுமே ஒரு சமூகத்தை உன்னத நிலைக்கு உயர்த்தும்.
                        </p>
                    </div>

                </div>
            </section>


            <!-- ========================================================= -->
            <!-- SECTION 2: தலைப்பு 2 — நம்ம சாமி (NAMMA SAMI) -->
            <!-- ========================================================= -->
            <section class="brief-section" id="topic2">
                
                <!-- Grand Banner for Topic 2 -->
                <div class="major-section-banner banner-topic2">
                    <div class="major-banner-info">
                        <div class="major-banner-badge">பகுதி 2 • முதன்மைத் தூண் 2</div>
                        <h2 class="major-banner-title">தலைப்பு 2: நம்ம சாமி (மெய்ஞ்ஞான இறைத் தத்துவம்)</h2>
                        <p class="major-banner-desc">சாமி என்றால் உடையவர் • எங்கும் நிறைந்த பரம்பொருள் • கரதர்சனம் • குலதெய்வம், கிராம சாமி மற்றும் இஷ்டதெய்வம்.</p>
                    </div>
                    <div class="major-banner-icon-bg">
                        <i data-lucide="sparkles" style="width:36px; height:36px;"></i>
                    </div>
                </div>

                <!-- Core Philosophical Questions -->
                <div class="callout-box" id="topic2-whatis">
                    <div class="callout-title">
                        <i data-lucide="help-circle"></i> 2.1 சாமி என்றால் என்ன? எங்கே இருக்கிறார்?
                    </div>
                    <p style="font-size:1.05rem; margin-bottom:8px;">
                        <strong>சாமி என்றால் என்ன?</strong> – <em>"உடையவர்"</em> (அனைத்து பிரபஞ்சத்தையும் உயிர்களையும் தனக்கு உடைமையாகக் கொண்டு காப்பவர், தலைவன்).
                    </p>
                    <p style="font-size:1.05rem; margin-bottom:8px;">
                        <strong>சாமி மொத்தம் எத்தனை?</strong> – சாமி ஒன்றே பல திருநாமங்களாகவும் திருவுருவங்களாகவும் திகழ்கிறார்.
                    </p>
                    <p style="font-size:1.05rem;">
                        <strong>சாமி எங்கே இருக்கிறார்?</strong> – <em>"ஈசா வாஸ்யம் இதம் ஸர்வம்"</em> (அனைத்திலும் இறைவன் நீக்கமற நிறைந்திருக்கிறார்), <em>"அங்கிங்கெனாதபடி எங்கும் பிரகாசமாய் ஆனந்த பூர்த்தியாகி விளங்கும் பரம்பொருள்"</em>.
                    </p>
                </div>

                <!-- Hand Shloka Banner -->
                <div class="verse-box" id="topic2-karadharshanam">
                    <div class="verse-header">
                        <div class="verse-tag">
                            <i data-lucide="sparkle"></i> 2.2 கரதர்சனம் ஸ்லோகம் — தெய்வீகம் நம்மிலும் உள்ளது!
                        </div>
                        <button class="btn-copy-verse" onclick="copyVerse('karadharshanam-text')">
                            <i data-lucide="copy" style="width:13px; height:13px;"></i> நகலெடு
                        </button>
                    </div>
                    <div class="verse-text" id="karadharshanam-text">
"கராக்ரே வசதே லக்ஷ்மீ: கரமத்யே ஸரஸ்வதீ |
கரமூலே ஸ்திதே கௌரீ ப்ரபாதே கரதர்சனம் ||"
                    </div>
                    <div class="verse-author">— பாரதப் பாரம்பரிய பிரபாத ஸ்லோகம்</div>
                    <div class="verse-explanation">
                        <strong>பொருள் விளக்கம்:</strong> விரல் நுனியில் லட்சுமியும் (செல்வம்/தொழில் வெற்றி), உள்ளங்கையின் நடுவில் சரஸ்வதியும் (கல்வி/ஞானம்), மணிக்கட்டுப் பகுதியில் கௌரியும் (ஆற்றல்/சக்தி) உறைகின்றனர். காலையில் கண் விழித்தவுடன் நமது உள்ளங்கையைப் பார்ப்பதன் மூலம், அனைத்து தெய்வீக ஆற்றல்களும் நமது சுய உழைப்பிலும் கரங்களிலும் குடி கொண்டுள்ளன என்பதை உணர்ந்து தன்னம்பிக்கையுடன் செயல்பட வேண்டும்.
                    </div>
                </div>

                <!-- Stories Section -->
                <div style="margin:28px 0;" id="topic2-stories">
                    <h3 class="section-subheading">
                        <i data-lucide="book-marked" style="color:var(--saffron-primary);"></i> 2.3 சிந்தனைக்குரிய ஆன்மீகக் கதைகள்
                    </h3>

                    <div class="cards-grid">
                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="heart-handshake"></i></div>
                                <h3>ஸ்ரீ ராமகிருஷ்ணர் அருளிய உண்மை</h3>
                            </div>
                            <p>
                                இறைவன் அனைத்திலும் உறைகிறார் என்பதை ஸ்ரீ ராமகிருஷ்ண பரமஹம்சர் மிக எளிய உவமைகளின் மூலம் விளக்கினார். நீர் எப்படி திரவமாகவும் உறைந்த பனிக்கட்டியாகவும் உள்ளதோ, அதுபோல இறைவன் அருவமாகவும் உருவமாகவும் விளங்குகிறார். உலக உயிர்கள் அனைத்திலும் அந்த பரம்பொருளின் இருப்பைக் காண்பதே மெய்யான பக்தி.
                            </p>
                        </div>

                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="shield-alert"></i></div>
                                <h3>குரு - சிஷ்யர் & யானை கதை (பக்தியுடன் விவேகம்)</h3>
                            </div>
                            <p>
                                <em>"எல்லாம் நாராயணன்"</em> என குரு உபதேசித்தபின், வீதியில் மதம் பிடித்து ஓடிவந்த யானையைக் கண்டு விலகாமல் நின்ற சிஷ்யனை யானை தூக்கி வீசியது.
                            </p>
                            <p>
                                காயம்பட்ட சிஷ்யனிடம் குரு கூறினார்: "யானையில் நாராயணன் இருப்பது உண்மையே; ஆனால் யானையின் மேல் அமர்ந்து <strong>'விலகிப் போ!'</strong> என்று எச்சரித்த பாகனிலும் நாராயணனே பேசினான். அவனது பேச்சை நீ ஏன் கேட்கவில்லை?" — பக்தி என்பது விவேகத்துடனும் பகுத்தறிவுடனும் செயல்படுவதே மெய்ஞ்ஞானம்.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Three Tiers of Sami -->
                <div style="margin-top:36px;" id="topic2-three-tiers">
                    <h3 class="section-subheading">
                        <i data-lucide="layers" style="color:var(--saffron-primary);"></i> 2.4 சாமியின் மூன்று நிலைகள் (Three Tiers of Deities)
                    </h3>

                    <div class="cards-grid">
                        
                        <!-- Tier 1: Kulasami -->
                        <div class="concept-card" id="topic2-kula" style="border-top:4px solid #f59e0b;">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="shield"></i></div>
                                <div>
                                    <span style="font-size:0.78rem; font-weight:700; color:#f59e0b; text-transform:uppercase;">நிலை 1</span>
                                    <h3>குலசாமி (குலதெய்வம்)</h3>
                                </div>
                            </div>
                            <p>
                                <strong>குலம் என்றால் என்ன?</strong> ஒரே முன்னோர்களை அடிப்படையாகக் கொண்டு, இரத்த உறவு மற்றும் வம்சாவழி பாரம்பரியத்தால் இணைக்கப்பட்டுள்ள மனிதர்களின் ஒரு பெரிய குடும்பக் குழுவைக் குறிக்கும்.
                            </p>
                            <p>
                                இந்த குலத்தைக் காக்கும் தெய்வமே குலசாமி. <em>"குலம் தரும் செல்வம் தந்திடும் அடியார் படுதுயர் ஆயின எல்லாம் நிலந்தரம் செய்யும்..."</em> — திருமங்கையாழ்வார். குலதெய்வ வழிபாடு விடுபடக் கூடாது; ஆண்டுக்கொரு முறையாவது குடும்பத்துடன் சென்று வணங்குவது வம்சவிருத்தியை அளிக்கும்.
                            </p>
                        </div>

                        <!-- Tier 2: Gramasami -->
                        <div class="concept-card" id="topic2-grama" style="border-top:4px solid #1d4ed8;">
                            <div class="card-icon-header">
                                <div class="card-icon" style="background:rgba(29, 78, 216, 0.15); color:#3b82f6;"><i data-lucide="map-pin"></i></div>
                                <div>
                                    <span style="font-size:0.78rem; font-weight:700; color:#3b82f6; text-transform:uppercase;">நிலை 2</span>
                                    <h3>கிராம சாமி (ஊர் கோவில்)</h3>
                                </div>
                            </div>
                            <p>
                                ஊர் மக்களை, அனைத்து சமுதாய மக்களையும் பேதமின்றி ஒன்றிணைக்கும் பெருஞ்சக்தியாக கிராமக் கோவில் விளங்குகிறது.
                            </p>
                            <p>
                                ஊர் எல்லை காக்கும் அய்யனார், மாரியம்மன், காளியம்மன் போன்ற தெய்வங்கள் ஊர் செழிப்பு, மழை வளம், விவசாய முன்னேற்றம் மற்றும் சமுதாய நல்லிணக்கத்தைக் காக்கின்றன.
                            </p>
                        </div>

                        <!-- Tier 3: Ishtatheivam -->
                        <div class="concept-card" id="topic2-ishta" style="border-top:4px solid #ec4899;">
                            <div class="card-icon-header">
                                <div class="card-icon" style="background:rgba(236, 72, 153, 0.15); color:#ec4899;"><i data-lucide="heart"></i></div>
                                <div>
                                    <span style="font-size:0.78rem; font-weight:700; color:#ec4899; text-transform:uppercase;">நிலை 3</span>
                                    <h3>இஷ்டதெய்வம் (விருப்ப தெய்வம்)</h3>
                                </div>
                            </div>
                            <p>
                                தனிமனித அமைதியை உறுதி செய்வது இஷ்டதெய்வம். இந்து தர்மத்தின் உன்னத சிறப்பே, ஒவ்வொரு மனிதனுக்கும் அவனுக்குப் பிடித்த தெய்வத்தை விரும்பித் தேர்ந்தெடுத்து வழிபடும் பூரண ஆன்மீகச் சுதந்திரம் உண்டு.
                            </p>
                            <p>
                                சிவன், முருகன், பெருமாள், விநாயகர் என உள்ளம் உருகி நினைக்கும் இஷ்டதெய்வம் உற்ற நண்பனைப் போல தனிமனித மன அழுத்தத்தைப் போக்கி நல்வாழ்வு அளிக்கிறது.
                            </p>
                        </div>

                    </div>
                </div>

                <!-- Kamban Verse -->
                <div class="verse-box" id="topic2-kamban" style="margin-top:30px;">
                    <div class="verse-header">
                        <div class="verse-tag">
                            <i data-lucide="book-open"></i> 2.5 கம்பராமாயணம் — இரணியன் வதைப்படலம் (எங்கும் நிறைந்த இறைவன்)
                        </div>
                        <button class="btn-copy-verse" onclick="copyVerse('kamban-verse')">
                            <i data-lucide="copy" style="width:13px; height:13px;"></i> நகலெடு
                        </button>
                    </div>
                    <div class="verse-text" id="kamban-verse">
"சாணினும் உளன்; ஓர் தன்மை அணுவினைச் சத கூறிட்ட
கோணினும் உளன்; மா மேருக் குன்றினும் உளன்; இந் நின்ற
தூணினும் உளன்; நீ சொன்ன சொல்லினும் உளன்; இப் போது
காணுதி விரைவின்” என்றான்;
                    </div>
                    <div class="verse-author">— கவிச்சக்கரவர்த்தி கம்பர் (கம்பராமாயணம், இரணியன் வதைப்படலம்)</div>
                    <div class="verse-explanation">
                        <strong>பொருள் விளக்கம்:</strong> தந்தை இரணியனின் கேள்விக்கு பாலன் பிரஹலாதன் பதிலளிக்கிறான்: "இறைவன் ஒரு சாண் அளவிலும் இருப்பான்; ஒரு அணுவை நூறு கூறுகளாகப் பிளந்த அதன் சிறிய கோணத்திலும் இருப்பான்; மாபெரும் மேரு மலையிலும் இருப்பான்; எதிரில் நிற்கும் இந்தத் தூணிலும் இருப்பான்; நீ பேசிய சொல்லிலும் இருப்பான்! இதனை நீ உடனே காண்பாய்!" என இறைவனின் எங்கும் நிறைந்த சர்வ வியாபகத் தன்மையை பறைசாற்றுகிறான்.
                    </div>
                </div>

            </section>


            <!-- ========================================================= -->
            <!-- SECTION 3: தலைப்பு 3 — நம்ம கோவில் (NAMMA KOVIL) -->
            <!-- ========================================================= -->
            <section class="brief-section" id="topic3">
                
                <!-- Grand Banner for Topic 3 -->
                <div class="major-section-banner banner-topic3">
                    <div class="major-banner-info">
                        <div class="major-banner-badge">பகுதி 3 • முதன்மைத் தூண் 3</div>
                        <h2 class="major-banner-title">தலைப்பு 3: நம்ம கோவில் (ஆலய அறிவியல், ஆகம நிர்மாணம் & 10 சமுதாயப் பெருமைகள்)</h2>
                        <p class="major-banner-desc">கோவில்/ஆலயம் தத்துவம் • 4 யுகங்கள் • 5 வழிபாட்டு வடிவங்கள் • மூர்த்தி-தலம்-தீர்த்தம் • ஆகம நகர நிர்மாணம் & 10 சமுதாயப் பெருமைகள்.</p>
                    </div>
                    <div class="major-banner-icon-bg">
                        <i data-lucide="landmark" style="width:36px; height:36px;"></i>
                    </div>
                </div>

                <p style="font-size:1.05rem; color:var(--text-muted); margin-bottom:24px; line-height:1.8;">
                    நம்ம சாமியை அமர்த்தும் இடமே <strong>கோவில்</strong>. ஆயிரம் ஆண்டுகளாக பாரத தேசம் முழுவதும் கடைப்பிடிக்கப்பட்டு வரும் உன்னத தத்துவமே கோவில் வழிபாடு. கோவில்கள் என்பவை வெறும் வழிபாட்டுத் தலங்கள் மட்டுமல்ல; அவை அறிவியல், வானவியல், சமூக நலம், நீர் மேலாண்மை, கட்டிடக்கலை மற்றும் வாழ்வியல் நெறிகளை ஒன்றிணைக்கும் பண்பாட்டு மையங்களாகும்.
                </p>

                <!-- 3.1 Etymology of Kovil and Aalayam -->
                <div style="margin:24px 0;" id="topic3-etymology">
                    <h3 class="section-subheading">
                        <i data-lucide="book-open" style="color:var(--saffron-primary);"></i> 3.1 கோவில் & ஆலயம் சொல்லிலக்கணம்
                    </h3>
                    <div class="features-grid">
                        <div class="feature-item">
                            <div class="feature-num" style="background:var(--saffron-primary); color:#000;">கோ</div>
                            <div class="feature-body">
                                <h4>கோவில் (கோ + இல்)</h4>
                                <p><strong>கோ</strong> = தலைவன் (இறைவன்) | <strong>இல்</strong> = இல்லம் / வீடு (வசிப்பிடம்).<br>கோவில் என்றால் <strong>"இறைவனின் வசிப்பிடம் / அரண்மனை"</strong> என்று பொருள்.</p>
                            </div>
                        </div>

                        <div class="feature-item">
                            <div class="feature-num" style="background:#0d9488; color:#fff;">ஆ</div>
                            <div class="feature-body">
                                <h4>ஆலயம் (ஆ + லயம்)</h4>
                                <p><strong>ஆ</strong> = ஆன்மா / ஜீவாத்மா (உயிர்) | <strong>லயம்</strong> = ஒடுங்குதல் (கரைதல்).<br>ஆலயம் என்றால் <strong>"மனித ஆன்மா இறைவனிடம் லயித்து அமைதி பெறும் இடம்"</strong> என்று பொருள்.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3.2 Four Yugas & Kali Yuga Worship -->
                <div class="callout-box" id="topic3-yugas" style="border-left-color:#f59e0b; background:rgba(245, 158, 11, 0.08);">
                    <div class="callout-title">
                        <i data-lucide="clock"></i> 3.2 நான்கு யுகங்களும் கலியுக விக்ரக ஆராதனையும்
                    </div>
                    <p style="font-size:0.96rem; margin-bottom:8px; line-height:1.7;">
                        காலத்தை முன்னோர்கள் 4 யுகங்களாகப் பிரித்துள்ளனர்: <strong>கிருத யுகம், திரேதா யுகம், துவாபர யுகம் மற்றும் கலியுகம்</strong>.
                    </p>
                    <p style="font-size:0.96rem; line-height:1.7;">
                        முதல் மூன்று யுகங்களிலும் இறை வழிபாடு யாகங்கள், தவம், யோகாப்பியாசம் மூலமாகவும், இறைவனுடன் நேரில் வாழ்ந்தும் கடைப்பிடிக்கப்பட்டது. ஆனால் <strong>"விக்ரக ஆராதனை" (மூர்த்தி வழிபாடு)</strong> என்பது கலியுகத்திற்கே உரிய தனித்துவமான வரம் ஆகும். உருவ வழிபாடு மனித மனதை ஒருமுகப்படுத்தி பக்குவப்படுத்துகிறது.
                    </p>
                </div>

                <!-- 3.3 Five Forms of Worship -->
                <div style="margin:28px 0;" id="topic3-forms">
                    <h3 class="section-subheading">
                        <i data-lucide="shapes" style="color:var(--saffron-primary);"></i> 3.3 ஐந்து வகை வழிபாட்டு வடிவங்கள் (5 Forms of Worship)
                    </h3>
                    <div class="cards-grid">
                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="image"></i></div>
                                <h3>1. பட வழிபாடு</h3>
                            </div>
                            <p>இல்லங்களில் இறைவனின் திருவுருவப் படங்களை வைத்து நெய் தீபமிட்டு வழிபடுவது.</p>
                        </div>

                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="mountain"></i></div>
                                <h3>2. கல் & பளிங்குச் சிலைகள்</h3>
                            </div>
                            <p>ஆகம முறைப்படி வடிக்கப்பட்டு பிரதிஷ்டை செய்யப்பட்ட கருங்கல் மற்றும் பளிங்குத் திருமேனிகள்.</p>
                        </div>

                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="disc"></i></div>
                                <h3>3. யந்திர வழிபாடு</h3>
                            </div>
                            <p>பிரபஞ்ச ஆற்றலை ஈர்க்கும் வடிவியல் தகடுகள் (ஸ்ரீசக்ரம் போன்ற யந்திர வடிவில் மந்திரங்களை வடித்து வழிபடுதல்).</p>
                        </div>

                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="flame"></i></div>
                                <h3>4. விளக்கு & அக்கினி (யாகம்)</h3>
                            </div>
                            <p>தீபத்தை ஜோதி வடிவாகப் பாவித்தும், ஹோம குண்டத்தில் அக்னி மூலமாகவும் இறைவனை ஆராதித்தல்.</p>
                        </div>

                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="sparkles"></i></div>
                                <h3>5. மண் & பஞ்சலோக மூர்த்திகள்</h3>
                            </div>
                            <p>பஞ்சபூத தத்துவத்தைக் குறிக்கும் மண் பொம்மைகள் மற்றும் திருவிழா வீதியுலா உற்சவ பஞ்சலோக மூர்த்திகள்.</p>
                        </div>

                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="quote"></i></div>
                                <h3>முன்னோர் பொன்மொழிகள்</h3>
                            </div>
                            <p>
                                ஔவையார்: <em>"கோவிலில்லா ஊரில் குடியிருக்க வேண்டாம்"</em><br>
                                <em>"ஆலயம் தொழுவது சாலவும் நன்று"</em><br>
                                <em>"கோபுர தரிசனம் கோடி புண்ணியம்"</em>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 3.4 Thirumoolar Verses -->
                <div id="topic3-thirumoolar">
                    <h3 class="section-subheading">
                        <i data-lucide="book-marked" style="color:var(--saffron-primary);"></i> 3.4 திருமூலர் அருளிய திருமந்திரப் பாடல்கள்
                    </h3>

                    <!-- Song 1 -->
                    <div class="verse-box">
                        <div class="verse-header">
                            <div class="verse-tag">
                                <i data-lucide="book-open"></i> பாடல் 1: நடமாடும் கோவில் நம்பர் (மக்கள் தொண்டே மகேசன் தொண்டு)
                            </div>
                            <button class="btn-copy-verse" onclick="copyVerse('thirumoolar-1')">
                                <i data-lucide="copy" style="width:13px; height:13px;"></i> நகலெடு
                            </button>
                        </div>
                        <div class="verse-text" id="thirumoolar-1">
"படமாடக் கோயில் பகவற்கு ஒன்று ஈயில்
நடமாடக் கோயில் நம்பர்க்கு அங்கு ஆகா
நடமாடக் கோயில் நம்பர்க்கு ஒன்று ஈயில்
படமாடக் கோயில் பகவற்கு அது ஆமே"
                        </div>
                        <div class="verse-author">— திருமூலர் (திருமந்திரம்)</div>
                        <div class="verse-explanation">
                            <strong>பொருள் விளக்கம்:</strong> இறைவனை 'படமாடக் கோயில் பகவன்' என்றும், சக மனிதனை 'நடமாடும் கோயில் நம்பர்' என்றும் குறிப்பிடுகிறார் திருமூலர். மனித நேயத்துடன் சக மக்களுக்குச் செய்யும் தொண்டே இறைவனுக்குச் சென்றடையும் உயர்ந்த வழிபாடாகும் என்பதை இதன் மூலம் வலியுறுத்துகிறார்.
                        </div>
                    </div>

                    <!-- Song 2 -->
                    <div class="verse-box">
                        <div class="verse-header">
                            <div class="verse-tag">
                                <i data-lucide="book-open"></i> பாடல் 2: உடம்பே ஆலயம் (சரீரமே திருக்கோவில்)
                            </div>
                            <button class="btn-copy-verse" onclick="copyVerse('thirumoolar-2')">
                                <i data-lucide="copy" style="width:13px; height:13px;"></i> நகலெடு
                            </button>
                        </div>
                        <div class="verse-text" id="thirumoolar-2">
"உள்ளம் பெருங்கோயில் ஊனுடம்பு ஆலயம்
வள்ளற் பிரானார்க்கு வாய் கோபுர வாசல்
தெள்ளத் தெளிந்தார்க்குச் சீவன் சிவலிங்கம்
கள்ளப் புலனைந்தும் காளா மணிவிளக்கே"
                        </div>
                        <div class="verse-author">— திருமூலர் (திருமந்திரம்)</div>
                        <div class="verse-explanation">
                            <strong>பொருள் விளக்கம்:</strong> நமது உள்ளமே பெருங்கோவில்; இந்த உடம்பே ஆலயம்; வாய் கோபுர வாசல்; ஜீவனே சிவலிங்கம்; ஐம்புலன்களே சுடர்விட்டு எரியும் மணிவிளக்குகள் என மனித உடலையே கோவிலாக உருவகித்து தூய்மையைப் போற்றுகிறார் திருமூலர்.
                        </div>
                    </div>
                </div>

                <!-- 3.5 Kings and Saints -->
                <div style="margin:28px 0;" id="topic3-kings-saints">
                    <h3 class="section-subheading">
                        <i data-lucide="crown" style="color:var(--saffron-primary);"></i> 3.5 மன்னர்களின் திருப்பணிகளும் நாயன்மார்களின் தவமும்
                    </h3>
                    
                    <div class="cards-grid">
                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="shield"></i></div>
                                <h3>மன்னர்களின் திருப்பணிகள்</h3>
                            </div>
                            <p>
                                சேரன் நெடுஞ்சேரலாதன் / செங்குட்டுவன் கண்ணகிக்குக் கோவில் அமைக்க இமயத்திலிருந்து கல் கொண்டு வந்த வரலாறு நம் பெருமையை விளக்குகிறது. மன்னர்கள் நிலங்கள், நகைகள், ஆபரணங்கள், வாகனங்கள் மற்றும் தேர்களை அமைத்து திருக்கோவில்களைப் பொக்கிஷங்களாகப் பாதுகாத்தனர்.
                            </p>
                        </div>

                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="flame"></i></div>
                                <h3>நாயன்மார்கள் & ஆழ்வார்களின் பக்தி</h3>
                            </div>
                            <p>
                                • <strong>குங்கிலியக்கலய நாயனார்:</strong> கழுத்தில் கயிறு கட்டி சிவலிங்கத்தை நிமிர்த்திய பக்தி.<br>
                                • <strong>பூசலார் நாயனார்:</strong> மனதிற்குள்ளேயே கோவில் கட்டி இறைவனை எழுந்தருளச் செய்த மகிமை.<br>
                                • <strong>தஞ்சைப் பெரிய கோவில் மூதாட்டி:</strong> கோபுர உச்சிக்கு ஒற்றைக் கருங்கல்லை வழங்கிய அழகி பாட்டியின் தூய பக்தி.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 3.6 Three Pillars: Murthi, Thalam, Theertham -->
                <div class="callout-box" id="topic3-pillars" style="border-left-color:#0d9488; background:rgba(13, 148, 136, 0.08);">
                    <div class="callout-title" style="color:#0d9488;">
                        <i data-lucide="columns"></i> 3.6 மூர்த்தி, தலம், தீர்த்தம் (கருடபுராண முக்கூட்டுக் கோட்பாடு)
                    </div>
                    <p style="font-size:0.96rem; margin-bottom:8px;">
                        • <strong>மூர்த்தி:</strong> ஆகம முறைப்படி சக்தி ஊட்டப்பட்டு அருள் பாலிக்கும் தெய்வீகத் திருமேனி (சுயம்புவாகத் தோன்றுவதும் உண்டு).
                    </p>
                    <p style="font-size:0.96rem; margin-bottom:8px;">
                        • <strong>தலம்:</strong> மகான்களும் சித்தர்களும் தவமியற்றி புனிதம் சேர்த்த புண்ணிய பூமி (52 சக்தி பீடங்கள், 12 ஜோதிர்லிங்கங்கள், 108 திவ்ய தேசங்கள், பாடல் பெற்ற தலங்கள்).
                    </p>
                    <p style="font-size:0.96rem; margin-bottom:8px;">
                        • <strong>பஞ்சபூதத் தலங்கள்:</strong> நிலம் (காஞ்சிபுரம்), நீர் (திருவானைக்காவல்), நெருப்பு (திருவண்ணாமலை), காற்று (காளஹஸ்தி), ஆகாயம் (சிதம்பரம்).
                    </p>
                    <p style="font-size:0.96rem; margin-bottom:8px;">
                        • <strong>தீர்த்தம்:</strong> தாமிரபரணி, வைகை, காவிரி, தென்பெண்ணை, பாலாறு போன்ற புண்ணிய நதிகள் மற்றும் கோவில் திருக்குளங்கள்.
                    </p>
                    <p style="font-size:0.96rem;">
                        • <strong>மகான்கள் அவதரித்த தலங்கள்:</strong> ஆதிசங்கரர் (காலடி), ராமானுஜர் (ஸ்ரீபெரும்புதூர்), வள்ளலார் (வடலூர்), தாயுமானவர் (திருச்சி), பட்டினத்தார் (சென்னைபட்டணம்/திருவொற்றியூர்), கிருபானந்த வாரியார், ரமணர், பாம்பன் சுவாமிகள்.
                    </p>
                </div>

                <!-- 3.7 Agamas and Religious Freedom -->
                <div style="margin:28px 0;" id="topic3-agamas">
                    <h3 class="section-subheading">
                        <i data-lucide="book" style="color:var(--saffron-primary);"></i> 3.7 ஆகம விதிகளும் வழிபாட்டுச் சுதந்திரமும் (Code Book of Temples)
                    </h3>
                    
                    <div class="cards-grid">
                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="unlock"></i></div>
                                <h3>வழிபாட்டுச் சுதந்திரம்</h3>
                            </div>
                            <p>
                                நமது சநாதன தர்மம் வழங்கிய பெருங்கொடை வழிபாட்டுச் சுதந்திரம். விரும்பிய வடிவில், விரும்பிய முறையில் நிர்ப்பந்தங்கள் இல்லாமல் வழிபடும் இந்த சுதந்திரமே நமது தர்மத்தை சிரஞ்சீவியாக வாழ வைக்கிறது.
                            </p>
                        </div>

                        <div class="concept-card">
                            <div class="card-icon-header">
                                <div class="card-icon"><i data-lucide="cpu"></i></div>
                                <h3>மந்திரம் - யந்திரம் - தந்திரம்</h3>
                            </div>
                            <p>
                                கோவில் நிர்மாணத்தில் கருவறை (Garbhagriha), அர்த்த மண்டபம், வசந்த மண்டபம், ராஜகோபுரம், கொடிமரம் (Dhwajasthambam), பலிபீடம் ஆகியவை ஆகம முறைப்படி அமைக்கப்பட்டு, வேத மந்திரங்கள் மூலம் சிலைகளுக்கு ஆற்றல் ஊட்டப்படுகிறது.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 3.8 Ten Societal Benefits of Kovil -->
                <div style="margin-top:36px;" id="topic3-benefits">
                    <h3 class="section-subheading">
                        <i data-lucide="check-check" style="color:var(--saffron-primary);"></i> 3.8 ஆகம விதிகளும் கோவிலின் 10 சமுதாயப் பெருமைகளும்
                    </h3>
                    
                    <div class="features-grid">
                        <div class="feature-item">
                            <div class="feature-num">1</div>
                            <div class="feature-body">
                                <h4>நகர நிர்மாணம்</h4>
                                <p>ஊரின் மையத்தில் கருவறை அமைத்து, அதைச் சுற்றி சமச்சீரான மாட வீதிகளை வடிவமைத்தனர்.</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-num">2</div>
                            <div class="feature-body">
                                <h4>தூய்மையான வீதிகள் & வடிகால்</h4>
                                <p>கோவிலைச் சுற்றியுள்ள தெருக்கள் அகலமாகவும், மழைநீர் தேங்காத சிறந்த வடிகால் அமைப்போடும் கட்டப்பட்டன.</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-num">3</div>
                            <div class="feature-body">
                                <h4>விண்ணுயர்ந்த கோபுரங்கள்</h4>
                                <p>கோபுர கலசங்கள் இடிதாங்கிகளாக (Lightning Arresters) செயல்பட்டன; தானியங்களைச் சேமிக்கும் களஞ்சியங்களாகவும் இருந்தன.</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-num">4</div>
                            <div class="feature-body">
                                <h4>திருக்குளங்கள் & நீர் மேலாண்மை</h4>
                                <p>மழைநீரைச் சேகரித்து நிலத்தடி நீர்மட்டத்தை உயர்த்தும் மிகப்பெரிய நீராதாரங்களாகத் திருக்குளங்கள் விளங்கின.</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-num">5</div>
                            <div class="feature-body">
                                <h4>கல்வெட்டுகள் & வரலாற்று ஆவணங்கள்</h4>
                                <p>அரச கட்டளைகள், தானங்கள், வரி விலக்குகள் மற்றும் வானியல் குறிப்புகள் கல்வெட்டுகளாகப் பதியப்பட்டன.</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-num">6</div>
                            <div class="feature-body">
                                <h4>64 கலைகளின் அரங்கம்</h4>
                                <p>இயல், இசை, நாடகம், சிற்பக்கலை மற்றும் நூல் அரங்கேற்றங்கள் (சேக்கிழார் பெரியபுராணம் தில்லையில் அரங்கேற்றம்) கோவிலிலேயே நடைபெற்றன.</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-num">7</div>
                            <div class="feature-body">
                                <h4>சமூக நல்லிணக்கத் திருவிழாக்கள்</h4>
                                <p>அனைத்து சமுதாய மக்களுக்கும் தனித்தனி பொறுப்புகள் வழங்கப்பட்டு, ஒற்றுமையுடன் கொண்டாடும் பெருவிழாக்களாக அமைந்தன.</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-num">8</div>
                            <div class="feature-body">
                                <h4>உள்ளூர்ப் பொருளாதாரம்</h4>
                                <p>பூக்கள், பால், பழங்கள், எண்ணெய், கைவினைப் பொருட்கள் விற்பனை மூலம் பல்லாயிரக்கணக்கானோருக்கு வாழ்வாதாரம் கிடைத்தது.</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-num">9</div>
                            <div class="feature-body">
                                <h4>தேர்த்திருவிழா (சமத்துவ வடம்)</h4>
                                <p>சாதி, மத, ஏழை, பணக்கார பேதமின்றி ஊர் மக்கள் அனைவரும் ஒன்றுகூடி வடம்பிடித்துத் தேர் இழுக்கும் மகத்தான சமத்துவ நெறி.</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-num">10</div>
                            <div class="feature-body">
                                <h4>தியாக வரலாறு & 5 நல்வழிப் பண்புகள்</h4>
                                <p>அன்னிய படையெடுப்புகளிலிருந்து கோவில்களைக் காக்க முன்னோர்கள் தன்னுயிரை ஈந்தனர். கோவில் நம்மை ஒருங்கிணைக்கிறது, நெறிப்படுத்துகிறது, மகிழ்வுறச் செய்கிறது, பிறவிப்பயன் பெறச் செய்கிறது, வரும் தலைமுறையை நல்வழிப்படுத்துகிறது!</p>
                            </div>
                        </div>
                    </div>
                </div>

            </section>


            <!-- ========================================================= -->
            <!-- SECTION 4: கள ஆய்வு & வழிகாட்டி நெறிமுறைகள் -->
            <!-- ========================================================= -->
            <section class="brief-section" id="survey">
                
                <!-- Grand Banner for Survey -->
                <div class="major-section-banner banner-survey">
                    <div class="major-banner-info">
                        <div class="major-banner-badge">பகுதி 4 • கள ஆய்வு & மதிப்பீடு</div>
                        <h2 class="major-banner-title">பகுதி 4: கள ஆய்வு & அழைப்பாளர் வழிகாட்டி நெறிமுறைகள்</h2>
                        <p class="major-banner-desc">3 முதன்மைக் கேள்விகள் • தர மதிப்பீட்டு முறை (Grade A, B, C) • அழைப்பாளர்களுக்கான 5 நல்வழிமுறைகள்.</p>
                    </div>
                    <div class="major-banner-icon-bg">
                        <i data-lucide="clipboard-check" style="width:36px; height:36px;"></i>
                    </div>
                </div>

                <p style="font-size:1.05rem; color:var(--text-muted); margin-bottom:20px; line-height:1.8;">
                    களப்பணியாளர்கள் மற்றும் தொலைபேசி அழைப்பாளர்கள் பொதுமக்களுடன் உரையாடும் போது, அவர்களின் பாரம்பரிய அறிவை அளவிடவும் வழிகாட்டவும் 3 முதன்மைக் கேள்விகள் முன்வைக்கப்படுகின்றன:
                </p>

                <div class="cards-grid">
                    <div class="concept-card" style="border-top:4px solid #f59e0b;">
                        <div class="card-icon-header">
                            <div class="card-icon"><i data-lucide="user-check"></i></div>
                            <h3>கேள்வி 1: உங்கள் பெயரின் பொருள் தெரியுமா?</h3>
                        </div>
                        <p>
                            நமது பெயர் நமது முதல் அடையாளம். முன்னோர்கள் இறைவனின் திருநாமங்களையும், பெருமைமிகு தமிழ்ச் சொற்களையும் குழந்தைகளுக்குச் சூட்டினர். பெயரின் பொருளை அறிவது சுயமரியாதையையும் ஆன்மீக உணர்வையும் ஊட்டுகிறது.
                        </p>
                    </div>

                    <div class="concept-card" style="border-top:4px solid #3b82f6;">
                        <div class="card-icon-header">
                            <div class="card-icon" style="background:rgba(59,130,246,0.15); color:#3b82f6;"><i data-lucide="users"></i></div>
                            <h3>கேள்வி 2: உங்கள் பரம்பரை / பாரம்பரியம் தெரியுமா?</h3>
                        </div>
                        <p>
                            நமது வம்சாவழி, பூர்வீகம் மற்றும் முன்னோர்களின் நற்பண்புகளை அறிந்து அடுத்த தலைமுறைக்குக் கடத்துவது குடும்பப் பிணைப்பையும் நெறிமுறைகளையும் உறுதி செய்கிறது.
                        </p>
                    </div>

                    <div class="concept-card" style="border-top:4px solid #10b981;">
                        <div class="card-icon-header">
                            <div class="card-icon" style="background:rgba(16,185,129,0.15); color:#10b981;"><i data-lucide="dna"></i></div>
                            <h3>கேள்வி 3: உங்கள் கோத்திரம் தெரியுமா?</h3>
                        </div>
                        <p>
                            கோத்திரம் என்பது நாம் எந்த ரிஷியின் வழியில் உதித்தோம் என்பதை விளக்கும் மரபுசார் மரபணு அடையாளம் ஆகும். இது ஒரே குடும்ப வழித்தோன்றல்களின் புனிதத் தொடர்பை உணர்த்துகிறது.
                        </p>
                    </div>
                </div>

                <!-- Workshop Training Program Agenda (3 Hours / 180 Mins) -->
                <div class="concept-card" style="margin-top:28px; border:2px solid var(--saffron-primary); background:rgba(245,158,11,0.04);">
                    <div class="card-icon-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div class="card-icon" style="background:rgba(245,158,11,0.15); color:var(--saffron-primary);"><i data-lucide="calendar-clock"></i></div>
                            <div>
                                <h3 style="margin:0; font-size:1.2rem; color:var(--text-main);">பயிற்சிப் பட்டறை கால அட்டவணை (Workshop & Training Agenda - 3 Hours)</h3>
                                <span style="font-size:0.85rem; color:var(--text-muted);">அனைத்து 14 கட்டங்களின் முழுமையான நேரப் பகிர்வு • மொத்தம் 180 நிமிடங்கள்</span>
                            </div>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <a href="NSNK-WorkshopActivities.html" target="_blank" class="btn-view-doc" style="background:#6366f1; color:#fff; font-weight:700; font-size:0.85rem; padding:8px 14px;">
                                <i data-lucide="sparkles" style="width:15px; height:15px;"></i> 🤹 ஊடாடும் குழுச் செயல்பாடுகள் கையேடு
                            </a>
                            <a href="Training-Program-Agenda.jpeg" target="_blank" class="btn-view-doc" style="border-color:var(--saffron-primary); color:var(--saffron-primary); font-size:0.85rem; padding:8px 14px;">
                                <i data-lucide="image" style="width:15px; height:15px;"></i> மூல அட்டவணைப் படம்
                            </a>
                        </div>
                    </div>
                    
                    <div style="overflow-x:auto; margin-top:16px;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.92rem; text-align:left;">
                            <thead>
                                <tr style="background:rgba(255,255,255,0.06); color:var(--saffron-primary); border-bottom:2px solid rgba(245,158,11,0.3);">
                                    <th style="padding:10px 14px;">வரிசை</th>
                                    <th style="padding:10px 14px;">நிகழ்ச்சி / செயல்பாடு (Activity)</th>
                                    <th style="padding:10px 14px;">நேர அளவு (Duration)</th>
                                    <th style="padding:10px 14px;">விளக்கம் (Purpose & Key Focus)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-muted);">1</td>
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-main);">பிரார்த்தனை (Prarthana)</td>
                                    <td style="padding:10px 14px; color:#fbbf24; font-weight:700;">5 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">இறை வணக்கம் மற்றும் அமைதிப் பிரார்த்தனை</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-muted);">2</td>
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-main);">சுய அறிமுகம் (Self Intro)</td>
                                    <td style="padding:10px 14px; color:#fbbf24; font-weight:700;">15 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">பங்கேற்பாளர்கள் மற்றும் ஒருங்கிணைப்பாளர்கள் பரஸ்பர அறிமுகம்</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-muted);">3</td>
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-main);">திட்டத்தின் நோக்கம் (Motto of Program)</td>
                                    <td style="padding:10px 14px; color:#fbbf24; font-weight:700;">15 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">நம்ம சாமி நம்ம கோவில் இயக்கத்தின் அடிப்படை இலக்கு & பார்வை</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(245,158,11,0.04);">
                                    <td style="padding:10px 14px; font-weight:700; color:#fbbf24;">4</td>
                                    <td style="padding:10px 14px; font-weight:700; color:#fbbf24;">தலைப்பு 1: நம்ம — விளக்கம் (Namma Exp)</td>
                                    <td style="padding:10px 14px; color:#fbbf24; font-weight:700;">20 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">தாய்மொழி, வணக்கம், உடை, வானியல், குடும்பம், உறவுகள், பஞ்சாங்கம்</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-muted);">5</td>
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-main);">தலைப்பு 1: செயல்பாடுகள் (Namma Activity)</td>
                                    <td style="padding:10px 14px; color:#fbbf24; font-weight:700;">10 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">சுய அடையாளம் & பாரம்பரியம் குறித்த குழு விவாதம்</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.03);">
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-muted);">6</td>
                                    <td style="padding:10px 14px; font-weight:700; color:#38bdf8;">☕ தேநீர் இடைவேளை (Tea Break)</td>
                                    <td style="padding:10px 14px; color:#38bdf8; font-weight:700;">15 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">நட்புறவுப் பகிர்வு & புத்துணர்ச்சி</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(244,63,94,0.04);">
                                    <td style="padding:10px 14px; font-weight:700; color:#fda4af;">7</td>
                                    <td style="padding:10px 14px; font-weight:700; color:#fda4af;">தலைப்பு 2: நம்ம சாமி — விளக்கம் (Namma Saami Exp)</td>
                                    <td style="padding:10px 14px; color:#fda4af; font-weight:700;">20 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">சாமி தத்துவம், கரதர்சனம், ராமகிருஷ்ணர் உவமை, 3 நிலைகள், கம்பன் பாடல்</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-muted);">8</td>
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-main);">தலைப்பு 2: செயல்பாடுகள் (Namma Saami Act)</td>
                                    <td style="padding:10px 14px; color:#fda4af; font-weight:700;">10 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">குலதெய்வம் & இஷ்டதெய்வம் வழிபாட்டு அனுபவப் பகிர்வு</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.02);">
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-muted);">9</td>
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-main);">சிறிய இடைவேளை (Short Break)</td>
                                    <td style="padding:10px 14px; color:#fbbf24; font-weight:700;">5 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">இடைவேளை</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(20,184,166,0.04);">
                                    <td style="padding:10px 14px; font-weight:700; color:#5eead4;">10</td>
                                    <td style="padding:10px 14px; font-weight:700; color:#5eead4;">தலைப்பு 3: நம்ம கோவில் — விளக்கம் (Namma Kovil Exp)</td>
                                    <td style="padding:10px 14px; color:#5eead4; font-weight:700;">20 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">சொல்லிலக்கணம், 5 வடிவங்கள், திருமூலர் பாடல்கள், தலங்கள், 10 பெருமைகள்</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-muted);">11</td>
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-main);">தலைப்பு 3: செயல்பாடுகள் (Namma Kovil Act)</td>
                                    <td style="padding:10px 14px; color:#5eead4; font-weight:700;">10 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">கோவில் பராமரிப்பு & ஆலயத் திருத்தொண்டு குறித்த திட்டமிடல்</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.02);">
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-muted);">12</td>
                                    <td style="padding:10px 14px; font-weight:700; color:var(--text-main);">சிறிய இடைவேளை (Short Break)</td>
                                    <td style="padding:10px 14px; color:#fbbf24; font-weight:700;">5 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">இடைவேளை</td>
                                </tr>
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(99,102,241,0.04);">
                                    <td style="padding:10px 14px; font-weight:700; color:#a5b4fc;">13</td>
                                    <td style="padding:10px 14px; font-weight:700; color:#a5b4fc;">கள மாதிரிப் பயிற்சி (Trial Calling & Survey Mock)</td>
                                    <td style="padding:10px 14px; color:#a5b4fc; font-weight:700;">20 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">3 முதன்மைக் கேள்விகளைக் கொண்டு தொலைபேசி அழைப்பு மாதிரிப் பயிற்சி</td>
                                </tr>
                                <tr style="background:rgba(16,185,129,0.04);">
                                    <td style="padding:10px 14px; font-weight:700; color:#6ee7b7;">14</td>
                                    <td style="padding:10px 14px; font-weight:700; color:#6ee7b7;">சங்கல்பம் & சமர்ப்பணம் (Sankalp & Samarpanam)</td>
                                    <td style="padding:10px 14px; color:#6ee7b7; font-weight:700;">10 நிமிடம்</td>
                                    <td style="padding:10px 14px; color:var(--text-muted);">தர்மப் பணிக்கான உளமார்ந்த உறுதிமொழி மற்றும் நிறைவு சமர்ப்பணம்</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr style="background:rgba(245,158,11,0.1); font-weight:800; border-top:2px solid var(--saffron-primary);">
                                    <td colspan="2" style="padding:12px 14px; color:var(--saffron-primary);">மொத்தப் பயிற்சி நேரம் (Total Workshop Duration)</td>
                                    <td style="padding:12px 14px; color:var(--saffron-primary); font-size:1.05rem;">180 நிமிடம்</td>
                                    <td style="padding:12px 14px; color:var(--saffron-primary);">3 மணி நேர முழுமையான பயிற்சித் திட்டம்</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <!-- Embedded Agenda Poster Image Viewer -->
                    <div style="margin-top: 24px; text-align: center; background: rgba(0,0,0,0.2); padding: 18px; border-radius: 12px; border: 1px solid rgba(245,158,11,0.25);">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; text-align:left;">
                            <div>
                                <h4 style="color:var(--saffron-primary); margin:0; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
                                    <i data-lucide="image" style="width:18px; height:18px;"></i>
                                    பயிற்சிப் பட்டறை விளக்கப் படம் (Agenda Poster Preview)
                                </h4>
                                <span style="font-size:0.82rem; color:var(--text-muted);">உயர் தெளிவு அச்சுப் படம் (A4/A3 Print Ready HD PNG)</span>
                            </div>
                            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                <a href="Training_Program_Agenda_Posters.png" target="_blank" class="btn-view-doc" style="background:var(--saffron-primary); color:#000; font-weight:700; font-size:0.85rem; padding:8px 16px;">
                                    <i data-lucide="maximize-2" style="width:15px; height:15px;"></i> முழு அளவில் காண்க (Full HD)
                                </a>
                                <a href="Training_Program_Agenda_Posters.png" download="NSNK_Training_Program_Agenda_Poster.png" class="btn-view-doc" style="border-color:var(--saffron-primary); color:var(--saffron-primary); font-size:0.85rem; padding:8px 14px;">
                                    <i data-lucide="download" style="width:15px; height:15px;"></i> பதிவிறக்கு
                                </a>
                            </div>
                        </div>
                        <a href="Training_Program_Agenda_Posters.png" target="_blank" title="கிளிக் செய்து முழு அளவில் பார்க்கவும்">
                            <img src="Training_Program_Agenda_Posters.png" alt="நம்ம சாமி நம்ம கோவில் - பயிற்சிப் பட்டறை கால அட்டவணை" style="max-width: 100%; height: auto; max-height: 850px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); border: 2px solid rgba(245,158,11,0.3); transition: transform 0.25s ease;" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='scale(1)'">
                        </a>
                    </div>
                </div>

            </section>


            <!-- ========================================================= -->
            <!-- SECTION 5: 19 ஆடியோ விரிவுரைகள் முழுமையான களஞ்சியம் -->
            <!-- ========================================================= -->
            <section class="brief-section" id="audio-repository">
                
                <!-- Grand Banner for Audio Knowledge Base -->
                <div class="major-section-banner banner-audio">
                    <div class="major-banner-info">
                        <div class="major-banner-badge">பகுதி 5 • 19 ஆடியோ விரிவுரைகள் களஞ்சியம்</div>
                        <h2 class="major-banner-title">பகுதி 5: 19 ஆடியோ விரிவுரைகளின் முழுமையான களஞ்சியம்</h2>
                        <p class="major-banner-desc">அனைத்து 19 விரிவுரைகளுக்கான பிளேயர் • முக்கியக் குறிப்புகள் • ஆன்மீகக் கதைகள் • முழு உரை வடிவம் (Verbatim Transcripts).</p>
                    </div>
                    <div class="major-banner-icon-bg">
                        <i data-lucide="headphones" style="width:36px; height:36px;"></i>
                    </div>
                </div>

                <!-- Integrated Audio Suite -->
                <div class="audio-suite">
                    <div class="audio-suite-header">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <i data-lucide="disc-3" style="color:var(--saffron-primary); width:28px; height:28px;"></i>
                            <div>
                                <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-main);">அனைத்து 19 ஆடியோ விரிவுரைகள்</h3>
                                <span style="font-size:0.85rem; color:var(--text-muted);">முழுமையான படியெடுக்கப்பட்ட தமிழ் உரை வடிவங்களுடன்</span>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button class="btn-view-doc" style="background:var(--saffron-primary); color:#000; font-weight:700; border:none; cursor:pointer;" onclick="toggleAllTranscripts()">
                                <i data-lucide="unfold-vertical" style="width:15px; height:15px;"></i>
                                <span id="toggle-transcripts-label">அனைத்து உரைகளையும் விரிவாக்கு</span>
                            </button>
                        </div>
                    </div>

                    <div class="audio-track-list">
${allTracksHtml}
                    </div>
                </div>

            </section>


            <!-- ========================================================= -->
            <!-- SECTION 6: பதிவிறக்க ஆவணங்கள் -->
            <!-- ========================================================= -->
            <section class="brief-section" id="documents">
                
                <div class="major-section-banner" style="background: linear-gradient(135deg, #1e3a8a, #0f172a); border: 2px solid #3b82f6;">
                    <div class="major-banner-info">
                        <div class="major-banner-badge">பகுதி 6 • அதிகாரப்பூர்வ மூல ஆவணங்கள்</div>
                        <h2 class="major-banner-title">பகுதி 6: பதிவிறக்கக் கூடிய ஆவணங்கள் (Official Resources)</h2>
                        <p class="major-banner-desc">திட்ட விளக்கக் கையேடு PDF, முழு உரை Markdown மற்றும் மூலக் கோப்புகள்</p>
                    </div>
                    <div class="major-banner-icon-bg">
                        <i data-lucide="folder-archive" style="width:36px; height:36px;"></i>
                    </div>
                </div>

                <div class="resource-card-grid">
                    
                    <!-- Master Program Guide PDF (Featured) -->
                    <!-- MASTER OFFICIAL TRANSCRIPT & PROGRAM BRIEFING PDF -->
                    <div class="resource-card" style="border: 2px solid #8b5cf6; background: rgba(139, 92, 246, 0.12); grid-column: 1 / -1;">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; font-weight: 800; padding: 0 16px;">முழு உரை PDF</div>
                            <div class="resource-text">
                                <h4 style="color: #c4b5fd; font-size: 1.25rem;">நம்ம சாமி நம்ம கோவில் — அதிகாரப்பூர்வ விரிவான திட்ட விளக்கக் கையேடு & முழு உரை PDF</h4>
                                <span>19 ஆடியோக்களின் முழுமையான தமிழ் உரை, தத்துவங்கள், பாடல்கள், கதைகள் & விளக்கங்கள் • 3.41 MB</span>
                            </div>
                        </div>
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <a href="NSNK-FullTranscript.pdf" target="_blank" class="btn-view-doc" style="background: #8b5cf6; color: #fff; font-weight: 800; font-size: 1rem; padding: 12px 22px;">
                                <i data-lucide="file-text" style="width:20px; height:20px;"></i> கையேடு PDF பார்வையிடு / பதிவிறக்கு (3.4 MB)
                            </a>
                            <a href="NSNK-FullTranscript.docx" download class="btn-view-doc" style="border-color: #8b5cf6; color: #c4b5fd; font-weight: 700; padding: 12px 18px;">
                                <i data-lucide="download" style="width:18px; height:18px;"></i> Word (.docx - 5.1 MB)
                            </a>
                        </div>
                    </div>

                    <!-- MASTER 12 POSTER PDF -->
                    <div class="resource-card" style="border: 2px solid var(--saffron-primary); background: rgba(245, 158, 11, 0.12); grid-column: 1 / -1;">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: linear-gradient(135deg, #d97706, #b45309); color: #fff; font-weight: 800; padding: 0 16px;">12 POSTERS MASTER PDF</div>
                            <div class="resource-text">
                                <h4 style="color: var(--saffron-primary); font-size: 1.25rem;">நம்ம சாமி நம்ம கோவில் — அனைத்து 12 விளக்கப் படங்கள் Master PDF</h4>
                                <span>3 தலைப்புகள் • 12 பக்கங்கள் • பெரிய எழுத்து பிரகாசமான அச்சுப் பிரதி (A4/A3 Print Ready High-Res PDF) • 5.64 MB</span>
                            </div>
                        </div>
                        <a href="நம்ம_சாமி_நம்ம_கோவில்_அனைத்து_12_விளக்கப்_படங்கள்_Master.pdf" target="_blank" class="btn-view-doc" style="background: var(--saffron-primary); color: #000; font-weight: 800; font-size: 1rem; padding: 12px 24px;">
                            <i data-lucide="file-down" style="width:20px; height:20px;"></i> 12 படங்களின் Master PDF பதிவிறக்கு (5.6 MB)
                        </a>
                    </div>

                    <!-- TOPIC-WISE 4-PAGE POSTER PDFS -->
                    <div class="resource-card" style="border: 1px solid #f59e0b; background: rgba(245, 158, 11, 0.06);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #d97706; color: #fff;">TOPIC 1</div>
                            <div class="resource-text">
                                <h4 style="color: #fbbf24;">1. நம்ம (NAMMA) - 4 படங்கள் PDF</h4>
                                <span>1A, 1B, 1C, 1D தாள்கள் • 4 பக்கங்கள் • 1.82 MB</span>
                            </div>
                        </div>
                        <a href="1_நம்ம_NAMMA_முழு_விளக்கக்_கையேடு.pdf" target="_blank" class="btn-view-doc" style="border-color: #f59e0b; color: #fbbf24;">
                            <i data-lucide="download" style="width:16px; height:16px;"></i> PDF பதிவிறக்கு
                        </a>
                    </div>

                    <div class="resource-card" style="border: 1px solid #f43f5e; background: rgba(244, 63, 94, 0.06);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #be123c; color: #fff;">TOPIC 2</div>
                            <div class="resource-text">
                                <h4 style="color: #fda4af;">2. நம்ம சாமி (NAMMA SAMI) - 4 படங்கள் PDF</h4>
                                <span>2A, 2B, 2C, 2D தாள்கள் • 4 பக்கங்கள் • 1.94 MB</span>
                            </div>
                        </div>
                        <a href="2_நம்ம_சாமி_NAMMA_SAMI_முழு_விளக்கக்_கையேடு.pdf" target="_blank" class="btn-view-doc" style="border-color: #f43f5e; color: #fda4af;">
                            <i data-lucide="download" style="width:16px; height:16px;"></i> PDF பதிவிறக்கு
                        </a>
                    </div>

                    <div class="resource-card" style="border: 1px solid #14b8a6; background: rgba(20, 184, 166, 0.06);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #0f766e; color: #fff;">TOPIC 3</div>
                            <div class="resource-text">
                                <h4 style="color: #5eead4;">3. நம்ம கோவில் (NAMMA KOVIL) - 4 படங்கள் PDF</h4>
                                <span>3A, 3B, 3C, 3D தாள்கள் • 4 பக்கங்கள் • 1.87 MB</span>
                            </div>
                        </div>
                        <a href="3_நம்ம_கோவில்_NAMMA_KOVIL_முழு_விளக்கக்_கையேடு.pdf" target="_blank" class="btn-view-doc" style="border-color: #14b8a6; color: #5eead4;">
                            <i data-lucide="download" style="width:16px; height:16px;"></i> PDF பதிவிறக்கு
                        </a>
                    </div>

                    <!-- WORKSHOP INTERACTIVE ACTIVITIES GUIDE HTML -->
                    <div class="resource-card" style="border: 2px solid #8b5cf6; background: rgba(139, 92, 246, 0.1); grid-column: 1 / -1;">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; font-weight: 800; padding: 0 16px;">ACTIVITIES GUIDE</div>
                            <div class="resource-text">
                                <h4 style="color: #c4b5fd; font-size: 1.25rem;">பயிற்சிப் பட்டறை ஊடாடும் குழுச் செயல்பாடுகள் கையேடு (Interactive Activities Guide)</h4>
                                <span>பலூன், நூல், நாணயம், காகிதம் கொண்டு 3 தலைப்புகளின் 10 நிமிடச் செய்முறைப் பயிற்சிகள் • நேரடி டைமர்கள் & வழிகாட்டல்</span>
                            </div>
                        </div>
                        <a href="NSNK-WorkshopActivities.html" target="_blank" class="btn-view-doc" style="background: #8b5cf6; color: #fff; font-weight: 800; font-size: 0.95rem; padding: 10px 20px;">
                            <i data-lucide="sparkles" style="width:18px; height:18px;"></i> செயல்பாடுகள் கையேட்டைத் திற (Interactive Guide)
                        </a>
                    </div>

                    <!-- TRAINING PROGRAM AGENDA POSTER -->
                    <div class="resource-card" style="border: 2px solid #6366f1; background: rgba(99, 102, 241, 0.08); grid-column: 1 / -1;">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: linear-gradient(135deg, #4f46e5, #4338ca); color: #fff; font-weight: 800; padding: 0 16px;">AGENDA POSTER</div>
                            <div class="resource-text">
                                <h4 style="color: #a5b4fc; font-size: 1.25rem;">பயிற்சிப் பட்டறை கால அட்டவணை — உயர் தெளிவு விளக்கப் படம் (Training Program Agenda Poster)</h4>
                                <span>3 மணி நேர முழுப் பயிற்சித் திட்டம் • 14 கட்டங்கள் • A4/A3 Print Ready High-Res PNG • 1.2 MB</span>
                            </div>
                        </div>
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <a href="Training_Program_Agenda_Posters.png" target="_blank" class="btn-view-doc" style="background: #6366f1; color: #fff; font-weight: 800; font-size: 0.95rem; padding: 10px 20px;">
                                <i data-lucide="image" style="width:18px; height:18px;"></i> அட்டவணைப் படத்தைப் பார் (HD PNG)
                            </a>
                            <a href="Training-Program-Agenda.jpeg" target="_blank" class="btn-view-doc" style="border-color: #6366f1; color: #c7d2fe; font-size: 0.95rem; padding: 10px 16px;">
                                <i data-lucide="file-image" style="width:16px; height:16px;"></i> மூல கையெழுத்துப் பிரதி
                            </a>
                        </div>
                    </div>

                    <!-- 12 Giant Printable Infographic Poster Sheets (A4/A3 Ready) -->
                    <div style="grid-column: 1 / -1; margin-top: 10px; margin-bottom: 6px;">
                        <h3 style="color: var(--saffron-primary); font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="printer" style="width:20px; height:20px;"></i>
                            3 தலைப்புகளின் 12 தனித்தனி விளக்கப் படங்கள் (12 Individual Giant Printable Posters - High-Res PNG)
                        </h3>
                    </div>

                    <!-- Topic 1 Posters (1A to 1D) -->
                    <div class="resource-card" style="border: 1px solid rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #d97706; color: #fff;">1A</div>
                            <div class="resource-text">
                                <h4 style="color: #fbbf24;">1A_நம்ம_மொழி_வணக்கம்.png</h4>
                                <span>தலைப்பு 1: தாய்மொழி சிந்தனை & வணக்கம் வேத மரபு (Giant Font)</span>
                            </div>
                        </div>
                        <a href="1A_நம்ம_மொழி_வணக்கம்.png" target="_blank" class="btn-view-doc" style="border-color: #f59e0b; color: #fbbf24;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <div class="resource-card" style="border: 1px solid rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #d97706; color: #fff;">1B</div>
                            <div class="resource-text">
                                <h4 style="color: #fbbf24;">1B_நம்ம_பாரத_உடை_வானவியல்.png</h4>
                                <span>தலைப்பு 1: வேட்டி, சேலை & தமிழ் வானவியல் அறிவியல் (Giant Font)</span>
                            </div>
                        </div>
                        <a href="1B_நம்ம_பாரத_உடை_வானவியல்.png" target="_blank" class="btn-view-doc" style="border-color: #f59e0b; color: #fbbf24;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <div class="resource-card" style="border: 1px solid rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #d97706; color: #fff;">1C</div>
                            <div class="resource-text">
                                <h4 style="color: #fbbf24;">1C_நம்ம_குடும்பம்_உறவுகள்_அறிவியல்.png</h4>
                                <span>தலைப்பு 1: கூட்டுக்குடும்பம், 6 தர்மங்கள் & மரபணு அறிவியல் (Giant Font)</span>
                            </div>
                        </div>
                        <a href="1C_நம்ம_குடும்பம்_உறவுகள்_அறிவியல்.png" target="_blank" class="btn-view-doc" style="border-color: #f59e0b; color: #fbbf24;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <div class="resource-card" style="border: 1px solid rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #d97706; color: #fff;">1D</div>
                            <div class="resource-text">
                                <h4 style="color: #fbbf24;">1D_நம்ம_பஞ்சாங்கம்_தியாகம்.png</h4>
                                <span>தலைப்பு 1: பஞ்சாங்கம் (5 அங்கங்கள்), உபசாரம் & தியாகம் (Giant Font)</span>
                            </div>
                        </div>
                        <a href="1D_நம்ம_பஞ்சாங்கம்_தியாகம்.png" target="_blank" class="btn-view-doc" style="border-color: #f59e0b; color: #fbbf24;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <!-- Topic 2 Posters (2A to 2D) -->
                    <div class="resource-card" style="border: 1px solid rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #be123c; color: #fff;">2A</div>
                            <div class="resource-text">
                                <h4 style="color: #fda4af;">2A_நம்ம_சாமி_தத்துவம்_கரதர்சனம்.png</h4>
                                <span>தலைப்பு 2: சாமி யார்? & கரதர்சனம் ஸ்லோகம் (Giant Font)</span>
                            </div>
                        </div>
                        <a href="2A_நம்ம_சாமி_தத்துவம்_கரதர்சனம்.png" target="_blank" class="btn-view-doc" style="border-color: #f43f5e; color: #fda4af;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <div class="resource-card" style="border: 1px solid rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #be123c; color: #fff;">2B</div>
                            <div class="resource-text">
                                <h4 style="color: #fda4af;">2B_நம்ம_சாமி_ஆன்மீகக்_கதைகள்.png</h4>
                                <span>தலைப்பு 2: ராமகிருஷ்ணர் உவமை & யானை கதை - விவேகம் (Giant Font)</span>
                            </div>
                        </div>
                        <a href="2B_நம்ம_சாமி_ஆன்மீகக்_கதைகள்.png" target="_blank" class="btn-view-doc" style="border-color: #f43f5e; color: #fda4af;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <div class="resource-card" style="border: 1px solid rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #be123c; color: #fff;">2C</div>
                            <div class="resource-text">
                                <h4 style="color: #fda4af;">2C_நம்ம_சாமி_3_வழிபாட்டு_நிலைகள்.png</h4>
                                <span>தலைப்பு 2: குலதெய்வம் (பாசுரம்), கிராம சாமி, இஷ்டதெய்வம் (Giant Font)</span>
                            </div>
                        </div>
                        <a href="2C_நம்ம_சாமி_3_வழிபாட்டு_நிலைகள்.png" target="_blank" class="btn-view-doc" style="border-color: #f43f5e; color: #fda4af;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <div class="resource-card" style="border: 1px solid rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #be123c; color: #fff;">2D</div>
                            <div class="resource-text">
                                <h4 style="color: #fda4af;">2D_நம்ம_சாமி_கம்பராமாயணம்_கருணைக்கதைகள்.png</h4>
                                <span>தலைப்பு 2: கம்பராமாயணம் பாடல் & எளியோர்க்கு எளிய திருவிளையாடல்கள் (Giant Font)</span>
                            </div>
                        </div>
                        <a href="2D_நம்ம_சாமி_கம்பராமாயணம்_கருணைக்கதைகள்.png" target="_blank" class="btn-view-doc" style="border-color: #f43f5e; color: #fda4af;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <!-- Topic 3 Posters (3A to 3D) -->
                    <div class="resource-card" style="border: 1px solid rgba(20, 184, 166, 0.4); background: rgba(20, 184, 166, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #0f766e; color: #fff;">3A</div>
                            <div class="resource-text">
                                <h4 style="color: #5eead4;">3A_நம்ம_கோவில்_சொல்லிலக்கணம்_வழிபாட்டு_வடிவங்கள்.png</h4>
                                <span>தலைப்பு 3: கோவில்/ஆலயம் சொல்லிலக்கணம், 4 யுகங்கள் & 5 வடிவங்கள் (Giant Font)</span>
                            </div>
                        </div>
                        <a href="3A_நம்ம_கோவில்_சொல்லிலக்கணம்_வழிபாட்டு_வடிவங்கள்.png" target="_blank" class="btn-view-doc" style="border-color: #14b8a6; color: #5eead4;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <div class="resource-card" style="border: 1px solid rgba(20, 184, 166, 0.4); background: rgba(20, 184, 166, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #0f766e; color: #fff;">3B</div>
                            <div class="resource-text">
                                <h4 style="color: #5eead4;">3B_நம்ம_கோவில்_திருமூலர்_பாடல்கள்_தியாகங்கள்.png</h4>
                                <span>தலைப்பு 3: திருமூலர் பாடல்கள் (நடமாடும் கோவில்/உடம்பே ஆலயம்) & தியாகங்கள் (Giant Font)</span>
                            </div>
                        </div>
                        <a href="3B_நம்ம_கோவில்_திருமூலர்_பாடல்கள்_தியாகங்கள்.png" target="_blank" class="btn-view-doc" style="border-color: #14b8a6; color: #5eead4;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <div class="resource-card" style="border: 1px solid rgba(20, 184, 166, 0.4); background: rgba(20, 184, 166, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #0f766e; color: #fff;">3C</div>
                            <div class="resource-text">
                                <h4 style="color: #5eead4;">3C_நம்ம_கோவில்_மூர்த்தி_தலம்_தீர்த்தம்_மகான்கள்.png</h4>
                                <span>தலைப்பு 3: மூர்த்தி-தலம்-தீர்த்தம், பஞ்சபூதத் தலங்கள் & மகான்கள் (Giant Font)</span>
                            </div>
                        </div>
                        <a href="3C_நம்ம_கோவில்_மூர்த்தி_தலம்_தீர்த்தம்_மகான்கள்.png" target="_blank" class="btn-view-doc" style="border-color: #14b8a6; color: #5eead4;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <div class="resource-card" style="border: 1px solid rgba(20, 184, 166, 0.4); background: rgba(20, 184, 166, 0.04);">
                        <div class="resource-info">
                            <div class="resource-icon-badge" style="background: #0f766e; color: #fff;">3D</div>
                            <div class="resource-text">
                                <h4 style="color: #5eead4;">3D_நம்ம_கோவில்_10_சமுதாயப்_பெருமைகள்.png</h4>
                                <span>தலைப்பு 3: ஆகம விதிகளும் திருக்கோவிலின் 10 சமுதாயப் பெருமைகளும் (Giant Font)</span>
                            </div>
                        </div>
                        <a href="3D_நம்ம_கோவில்_10_சமுதாயப்_பெருமைகள்.png" target="_blank" class="btn-view-doc" style="border-color: #14b8a6; color: #5eead4;">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> படத்தைப் பார்
                        </a>
                    </div>

                    <!-- Docx Card -->
                    <div class="resource-card">
                        <div class="resource-info">
                            <div class="resource-icon-badge docx">DOCX</div>
                            <div class="resource-text">
                                <h4>நம்ம.docx</h4>
                                <span>தலைப்பு 1 கையேடு • 14 KB</span>
                            </div>
                        </div>
                        <a href="நம்ம.docx" class="btn-view-doc" download>
                            <i data-lucide="download" style="width:15px; height:15px;"></i> பதிவிறக்கு
                        </a>
                    </div>

                    <!-- PDF 1 Card -->
                    <div class="resource-card">
                        <div class="resource-info">
                            <div class="resource-icon-badge">PDF</div>
                            <div class="resource-text">
                                <h4>நம்ம சாமி.pdf</h4>
                                <span>தலைப்பு 2 கையேடு • 2 பக்கங்கள் • 185 KB</span>
                            </div>
                        </div>
                        <a href="நம்ம சாமி.pdf" target="_blank" class="btn-view-doc">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> பார்வையிடு
                        </a>
                    </div>

                    <!-- PDF 2 Card -->
                    <div class="resource-card">
                        <div class="resource-info">
                            <div class="resource-icon-badge">PDF</div>
                            <div class="resource-text">
                                <h4>நம்ம கோவில்.pdf</h4>
                                <span>தலைப்பு 3 கையேடு • 6 பக்கங்கள் • 246 KB</span>
                            </div>
                        </div>
                        <a href="நம்ம கோவில்.pdf" target="_blank" class="btn-view-doc">
                            <i data-lucide="external-link" style="width:15px; height:15px;"></i> பார்வையிடு
                        </a>
                    </div>

                </div>
            </section>

        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-logo">
                <i data-lucide="sparkles" style="color:var(--saffron-primary);"></i>
                <span>நம்ம சாமி நம்ம கோவில் • Program Briefing Portal</span>
            </div>
            <p>
                நமது முன்னோர்களின் அரிய சிந்தனைகளையும், கோவில் அமைப்பின் மகத்துவங்களையும் பேணிப் பாதுகாத்து, வருங்காலத் தலைமுறையினரை நல்வழிப்படுத்துவோம்.
            </p>
            <div style="font-size:0.78rem; color:var(--text-dim);">
                NSNK Program Briefing Portal • Created for Namma Sami Namma Kovil • Release v2.0
            </div>
        </div>
    </footer>

    <!-- Toast Notification for Copy -->
    <div id="toast" style="position:fixed; bottom:24px; right:24px; background:#10b981; color:#fff; padding:10px 18px; border-radius:var(--radius-sm); font-size:0.9rem; font-weight:600; display:none; z-index:9999; box-shadow:var(--shadow-md);">
        பாடல் வரிகள் நகலெடுக்கப்பட்டன! (Copied to Clipboard)
    </div>

    <!-- Interactive Scripts -->
    <script>
        // Initialize Lucide Icons
        lucide.createIcons();

        // Reading Progress Indicator
        window.addEventListener('scroll', () => {
            const docElem = document.documentElement;
            const scrollTop = docElem.scrollTop || document.body.scrollTop;
            const scrollHeight = docElem.scrollHeight - docElem.clientHeight;
            const scrollPercent = (scrollTop / scrollHeight) * 100;
            document.getElementById('read-progress').style.width = scrollPercent + '%';

            // Update TOC active state
            updateActiveToc();
        });

        // Theme Switcher
        const themes = ['dark', 'temple', 'light'];
        let currentThemeIndex = 0;

        function cycleTheme() {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            const newTheme = themes[currentThemeIndex];
            if (newTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', newTheme);
            }
        }

        // Font Size Adjuster
        let baseFontSize = 16;
        function changeFontSize(delta) {
            baseFontSize = Math.min(Math.max(baseFontSize + delta, 13), 22);
            document.documentElement.style.fontSize = baseFontSize + 'px';
        }

        // Toggle All Transcripts Expand/Collapse
        let allExpanded = false;
        function toggleAllTranscripts() {
            allExpanded = !allExpanded;
            const allDetails = document.querySelectorAll('.audio-transcript-details');
            allDetails.forEach(d => {
                d.open = allExpanded;
            });
            const lbl = document.getElementById('toggle-transcripts-label');
            if (lbl) lbl.innerText = allExpanded ? 'அனைத்து உரைகளையும் சுருக்கு' : 'அனைத்து உரைகளையும் விரிவாக்கு';
        }

        // Dedicated Print-to-PDF Function (Ensures ZERO content missed)
        function printDocument() {
            // 1. Expand all details elements so transcripts are 100% visible
            const allDetails = document.querySelectorAll('details');
            allDetails.forEach(d => {
                d.setAttribute('open', 'true');
                d.open = true;
            });

            // 2. Clear any search filter
            const searchField = document.getElementById('live-search');
            if (searchField && searchField.value) {
                searchField.value = '';
                filterContent();
            }

            // 3. Trigger print
            setTimeout(() => {
                window.print();
            }, 250);
        }

        // Ensure all details expand before browser print event
        window.addEventListener('beforeprint', () => {
            document.querySelectorAll('details').forEach(d => {
                d.setAttribute('open', 'true');
                d.open = true;
            });
        });

        // Copy Tamil Verse to Clipboard
        function copyVerse(elemId) {
            const elem = document.getElementById(elemId);
            if (!elem) return;
            const text = elem.innerText || elem.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const toast = document.getElementById('toast');
                toast.style.display = 'block';
                setTimeout(() => {
                    toast.style.display = 'none';
                }, 2500);
            });
        }

        // Real-time Search Filter
        function filterContent() {
            const query = document.getElementById('live-search').value.toLowerCase().trim();
            const cards = document.querySelectorAll('.concept-card, .verse-box, .feature-item, .callout-box, .audio-track-card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (!query || text.includes(query)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Highlight Active Table of Contents Link
        function updateActiveToc() {
            const sections = document.querySelectorAll('.brief-section, .concept-card[id], .callout-box[id], .verse-box[id]');
            const tocLinks = document.querySelectorAll('.toc-list a');
            let currentActiveId = '';

            const scrollPos = window.scrollY + 140;

            sections.forEach(sec => {
                if (sec.offsetTop <= scrollPos) {
                    currentActiveId = sec.getAttribute('id');
                }
            });

            if (currentActiveId) {
                tocLinks.forEach(link => {
                    if (link.getAttribute('href') === '#' + currentActiveId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        }
    </script>
</body>
</html>`;

fs.writeFileSync(HTML_OUTPUT, htmlContent, 'utf8');
console.log('Successfully generated NSNK-ProgramBriefing.html! File size:', (fs.statSync(HTML_OUTPUT).size / 1024).toFixed(2), 'KB');
