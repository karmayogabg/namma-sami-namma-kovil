import json
import os
import urllib.parse

AUDIO_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_PATH = os.path.join(AUDIO_DIR, 'audio_transcripts.json')
HTML_OUTPUT = os.path.join(AUDIO_DIR, 'NSNK-ProgramBriefing.html')

print("Starting to build comprehensive master NSNK-ProgramBriefing.html...")

with open(CACHE_PATH, 'r', encoding='utf-8') as f:
    cache = json.load(f)

# Sort audio files by index
audio_files = sorted(cache.keys(), key=lambda x: int(x.split('.')[0]))

def render_audio_track_card(file_name, item):
    num = item.get('index', int(file_name.split('.')[0]))
    size_mb = f"{item.get('size_bytes', 0) / (1024*1024):.1f} MB" if item.get('size_bytes') else 'Audio'
    title = item.get('title_tamil', file_name)
    cat = item.get('topic_classification', 'நம்ம சாமி நம்ம கோவில்')
    
    # Filter class
    if 'நம்ம கோவில்' in cat:
        filter_badge = 'பகுதி 3: நம்ம கோவில்'
        badge_style = 'background: rgba(13, 148, 136, 0.15); color: #14b8a6; border: 1px solid rgba(13, 148, 136, 0.3);'
    elif 'நம்ம சாமி' in cat:
        filter_badge = 'பகுதி 2: நம்ம சாமி'
        badge_style = 'background: rgba(225, 29, 72, 0.15); color: #fb7185; border: 1px solid rgba(225, 29, 72, 0.3);'
    else:
        filter_badge = 'பகுதி 1: நம்ம'
        badge_style = 'background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);'

    takeaways_html = ''
    if item.get('key_takeaways_tamil'):
        pts = ''.join([f'<li style="margin-bottom:6px;">{p}</li>' for p in item['key_takeaways_tamil']])
        takeaways_html = f'''
            <div class="audio-takeaways-box" style="margin-top:12px; background:rgba(0,0,0,0.22); padding:12px 16px; border-radius:8px; font-size:0.9rem; border:1px solid rgba(255,255,255,0.07);">
                <div style="font-weight:700; color:var(--saffron-primary); margin-bottom:8px; display:flex; align-items:center; gap:8px;">
                    <i data-lucide="check-circle-2" style="width:16px; height:16px;"></i> முக்கியக் கருத்துக்கள் (Key Takeaways):
                </div>
                <ul style="margin:0; padding-left:20px; line-height:1.65; color:var(--text-muted);">
                    {pts}
                </ul>
            </div>'''
            
    stories_html = ''
    if item.get('spiritual_stories_and_references'):
        st_text = ' • '.join(item['spiritual_stories_and_references'])
        stories_html = f'''
            <div class="audio-stories-box" style="margin-top:10px; font-size:0.86rem; color:#93c5fd; background:rgba(59,130,246,0.08); padding:8px 14px; border-radius:6px; border-left:3px solid #3b82f6; line-height:1.6;">
                <strong><i data-lucide="book-open" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-right:4px;"></i>ஆன்மீகக் குறிப்பு / வரலாற்றுத் தலம்:</strong> {st_text}
            </div>'''
            
    transcript_html = ''
    if item.get('verbatim_transcript_tamil'):
        t_text = item['verbatim_transcript_tamil']
        transcript_html = f'''
            <details class="audio-transcript-details" style="margin-top:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:10px 14px; font-size:0.88rem;">
                <summary style="cursor:pointer; color:var(--saffron-primary); font-weight:700; outline:none; display:flex; align-items:center; justify-content:space-between; user-select:none;">
                    <span style="display:flex; align-items:center; gap:8px;">
                        <i data-lucide="file-text" style="width:16px; height:16px;"></i> முழுமையான தமிழ் உரை வடிவம் (Verbatim Tamil Transcript)
                    </span>
                    <span style="font-size:0.75rem; color:var(--text-dim); background:rgba(255,255,255,0.08); padding:2px 8px; border-radius:4px;">அச்சுப் பிரதி</span>
                </summary>
                <div class="transcript-content-text" style="margin-top:10px; max-height:280px; overflow-y:auto; line-height:1.75; color:var(--text-muted); white-space:pre-wrap; padding:14px; background:rgba(0,0,0,0.3); border-radius:6px; font-family:var(--font-tamil); border:1px solid rgba(255,255,255,0.05); font-size:0.9rem;">
{t_text}
                </div>
            </details>'''
            
    encoded_file = urllib.parse.quote(file_name)
    return f'''
        <!-- Track {num} -->
        <div class="audio-track-card" id="audio-track-{num}" style="display:flex; flex-direction:column; gap:10px; padding:18px; margin-bottom:16px;">
            <div class="audio-track-top" style="display:flex; justify-content:space-between; align-items:flex-start; gap:14px;">
                <div class="audio-track-name" style="flex:1; display:flex; align-items:flex-start; gap:12px;">
                    <div style="width:36px; height:36px; border-radius:8px; background:rgba(245,158,11,0.15); color:var(--saffron-primary); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:800; font-size:1rem;">
                        {num}
                    </div>
                    <div>
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
                            <span style="font-size:0.75rem; font-weight:700; padding:3px 9px; border-radius:4px; {badge_style}">{filter_badge}</span>
                            <span style="font-size:0.75rem; color:var(--text-dim); font-family:monospace; background:rgba(255,255,255,0.05); padding:2px 8px; border-radius:4px;">{file_name}</span>
                        </div>
                        <h4 style="font-weight:800; font-size:1.05rem; color:var(--text-main); line-height:1.45; margin:0;">{title}</h4>
                    </div>
                </div>
                <span class="audio-track-size" style="font-size:0.8rem; font-weight:700; color:var(--text-dim); background:rgba(255,255,255,0.06); padding:4px 10px; border-radius:6px; flex-shrink:0;">{size_mb}</span>
            </div>
            <audio class="audio-player-elem" controls preload="none" style="width:100%; height:40px; margin-top:8px; border-radius:8px;">
                <source src="{encoded_file}" type="audio/mpeg">
                Your browser does not support audio playback.
            </audio>
            {takeaways_html}
            {stories_html}
            {transcript_html}
        </div>'''

all_tracks_html = '\n'.join([render_audio_track_card(f, cache[f]) for f in audio_files])

print(f"Generated markup for all {len(audio_files)} audio tracks.")
