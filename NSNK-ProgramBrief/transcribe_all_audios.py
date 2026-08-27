import os
import glob
import time
import json
import subprocess
from concurrent.futures import ProcessPoolExecutor

AUDIO_DIR = "/home/sabrisatharamanathan/my-project/Aram-NSNK/NSNK-ProgramBrief"
WAV_DIR = os.path.join(AUDIO_DIR, "wav_chunks")
TRANSCRIPTS_DIR = os.path.join(AUDIO_DIR, "transcripts")

FFMPEG_BIN = "/home/sabrisatharamanathan/my-project/KarmaYoga/tools/ffmpeg-7.0.2-amd64-static/ffmpeg"
WHISPER_CLI = "/home/sabrisatharamanathan/my-project/KarmaYoga/tools/whisper.cpp/build/bin/whisper-cli"
MODEL_PATH = "/home/sabrisatharamanathan/my-project/KarmaYoga/tools/whisper.cpp/models/ggml-large-v3-turbo.bin"
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "/home/sabrisatharamanathan/my-project/KarmaYoga/tools/whisper.cpp/models/ggml-medium.bin"

os.makedirs(WAV_DIR, exist_ok=True)
os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)

PROMPT_TEXT = "நம்ம சாமி நம்ம கோவில் குலதெய்வம் கிராம தெய்வம் இஷ்ட தெய்வம் ஆலயம் பரம்பரை கோத்திரம் வழிபாடு"

def process_audio(audio_path):
    filename = os.path.basename(audio_path)
    base_name = os.path.splitext(filename)[0]
    wav_path = os.path.join(WAV_DIR, base_name + ".wav")
    out_prefix = os.path.join(TRANSCRIPTS_DIR, base_name)
    txt_path = out_prefix + ".txt"
    json_path = out_prefix + ".json"

    # 1. Convert to 16kHz mono WAV if not present or empty
    if not os.path.exists(wav_path) or os.path.getsize(wav_path) == 0:
        print(f"[FFMPEG] Converting {filename} -> WAV...", flush=True)
        cmd_ffmpeg = [
            FFMPEG_BIN, "-y",
            "-i", audio_path,
            "-ar", "16000",
            "-ac", "1",
            "-c:a", "pcm_s16le",
            wav_path
        ]
        res_ff = subprocess.run(cmd_ffmpeg, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if res_ff.returncode != 0:
            print(f"[ERROR] Failed to convert {filename}", flush=True)
            return base_name, False, "Conversion failed"

    # 2. Check if already transcribed
    if os.path.exists(txt_path) and os.path.getsize(txt_path) > 50:
        print(f"[SKIP] Already transcribed: {base_name}", flush=True)
        return base_name, True, "Already completed"

    print(f"[START] Transcribing: {base_name}...", flush=True)
    t0 = time.time()

    cmd_whisper = [
        WHISPER_CLI,
        "-m", MODEL_PATH,
        "-f", wav_path,
        "-l", "ta",
        "-t", "6",
        "-bs", "1",
        "-bo", "1",
        "-otxt",
        "-oj",
        "-of", out_prefix,
        "--prompt", PROMPT_TEXT
    ]

    res_wh = subprocess.run(cmd_whisper, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    elapsed = time.time() - t0

    if res_wh.returncode == 0 and os.path.exists(txt_path) and os.path.getsize(txt_path) > 0:
        print(f"[DONE] {base_name} finished in {elapsed:.1f}s", flush=True)
        return base_name, True, f"Done in {elapsed:.1f}s"
    else:
        print(f"[ERROR] {base_name} transcription failed", flush=True)
        return base_name, False, "Whisper failed"

def main():
    audio_files = sorted(glob.glob(os.path.join(AUDIO_DIR, "*.mpeg")))
    print(f"Found {len(audio_files)} WhatsApp audio recordings.", flush=True)
    print(f"Using Whisper model: {os.path.basename(MODEL_PATH)}", flush=True)

    # Use 2 parallel workers (6 threads each = 12 CPU cores)
    with ProcessPoolExecutor(max_workers=2) as executor:
        results = list(executor.map(process_audio, audio_files))

    successes = sum(1 for _, ok, _ in results if ok)
    print(f"\n--- Batch Transcription Completed: {successes}/{len(audio_files)} successful ---\n", flush=True)

    # Combine all transcripts into master markdown and json summary
    combined_transcripts = []
    json_catalog = {}

    for idx, audio_file in enumerate(audio_files):
        filename = os.path.basename(audio_file)
        base_name = os.path.splitext(filename)[0]
        txt_path = os.path.join(TRANSCRIPTS_DIR, base_name + ".txt")
        json_path = os.path.join(TRANSCRIPTS_DIR, base_name + ".json")

        text_content = ""
        if os.path.exists(txt_path):
            with open(txt_path, "r", encoding="utf-8") as f:
                text_content = f.read().strip()

        json_catalog[filename] = {
            "index": idx + 1,
            "filename": filename,
            "base_name": base_name,
            "transcript": text_content,
            "size_bytes": os.path.getsize(audio_file)
        }

        combined_transcripts.append(f"## பகுதி {idx + 1}: `{filename}`\n")
        combined_transcripts.append(f"**கோப்புப் பெயர்**: `{filename}`  \n")
        combined_transcripts.append(f"**முழு உரை வடிவம் (Tamil Transcript)**:\n\n```\n{text_content}\n```\n\n---\n")

    # Save master markdown transcript
    master_md_path = os.path.join(AUDIO_DIR, "NSNK_Audio_Lectures_Complete_Transcript.md")
    with open(master_md_path, "w", encoding="utf-8") as f:
        f.write("# நம்ம சாமி நம்ம கோவில் - முழு ஆடியோ உரைகள் (Audio Transcripts)\n\n")
        f.write(f"- **மொத்த ஆடியோ பதிவுகள்**: {len(audio_files)}\n")
        f.write("- **மொழி**: தமிழ் (Tamil)\n")
        f.write("- **ஆதாரம்**: `NSNK-ProgramBrief/` WhatsApp Audio Recordings\n\n---\n\n")
        f.write("\n".join(combined_transcripts))

    print(f"Saved master markdown transcript to: {master_md_path}", flush=True)

    # Save json catalog
    master_json_path = os.path.join(AUDIO_DIR, "audio_transcripts.json")
    with open(master_json_path, "w", encoding="utf-8") as f:
        json.dump(json_catalog, f, ensure_ascii=False, indent=2)

    print(f"Saved master JSON catalog to: {master_json_path}", flush=True)

if __name__ == "__main__":
    main()
