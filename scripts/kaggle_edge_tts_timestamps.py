#!/usr/bin/env python3
"""
scripts/kaggle_edge_tts_timestamps.py
=============================================================================
Hidaya "0 € & 0 Lag" Kaggle Audio & WordBoundary Timestamp Generator
=============================================================================
Generates high-fidelity neural MP3 audio streams alongside exact millisecond
word-by-word timestamp JSON arrays (`[{"position", "word", "start_ms", "end_ms"}]`)
using `edge_tts.Communicate` `WordBoundary` events (PDF Page 2).

The resulting `.mp3` files can be packed into `ZIP_STORED` (uncompressed)
archives on GitHub Releases, and the `.json` timestamp arrays can be ingested
directly into `public.ayah_audio.timestamps_jsonb` in Supabase.

Usage:
    pip install edge-tts
    python3 scripts/kaggle_edge_tts_timestamps.py \
        --text "Those who spend in prosperity and adversity..." \
        --voice "en-US-ChristopherNeural" \
        --out-prefix "output/surah_003_ayah_134_en"
"""

import argparse
import asyncio
import json
from pathlib import Path
from typing import Any, Dict, List

try:
    import edge_tts
except ImportError:
    edge_tts = None  # Handled gracefully with a clear error message at runtime


async def generate_audio_with_timestamps(
    text: str,
    voice: str,
    output_mp3: Path,
    output_json: Path,
) -> List[Dict[str, Any]]:
    """
    Streams audio chunks to `output_mp3` while capturing exact `WordBoundary`
    millisecond offsets (`offset / 10_000` -> `start_ms`, `(offset + duration) / 10_000` -> `end_ms`)
    and saving them to `output_json`.
    """
    if edge_tts is None:
        raise RuntimeError("Missing dependency 'edge-tts'. Install via: pip install edge-tts")

    output_mp3.parent.mkdir(parents=True, exist_ok=True)
    output_json.parent.mkdir(parents=True, exist_ok=True)

    communicate = edge_tts.Communicate(text, voice)
    timestamps: List[Dict[str, Any]] = []
    position = 1

    with open(output_mp3, "wb") as audio_file:
        async for chunk in communicate.stream():
            chunk_type = chunk.get("type")
            if chunk_type == "audio":
                audio_file.write(chunk["data"])
            elif chunk_type == "WordBoundary":
                # edge-tts offsets and durations are in 100-nanosecond ticks (1 ms = 10,000 ticks)
                start_ms = int(round(chunk["offset"] / 10_000))
                duration_ms = int(round(chunk["duration"] / 10_000))
                end_ms = max(start_ms + 30, start_ms + duration_ms)
                word_text = str(chunk.get("text", "")).strip()

                if word_text:
                    timestamps.append(
                        {
                            "position": position,
                            "word": word_text,
                            "start_ms": start_ms,
                            "end_ms": end_ms,
                        }
                    )
                    position += 1

    with open(output_json, "w", encoding="utf-8") as json_file:
        json.dump(timestamps, json_file, ensure_ascii=False, indent=2)

    return timestamps


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate MP3 audio + exact millisecond WordBoundary JSON timestamps via edge-tts."
    )
    parser.add_argument("--text", required=True, help="Translation or Tafsir text to synthesize.")
    parser.add_argument(
        "--voice",
        default="en-US-ChristopherNeural",
        help="Neural voice identifier (e.g., en-US-ChristopherNeural, fr-FR-HenriNeural, sv-SE-MattiasNeural, ar-EG-ShakirNeural).",
    )
    parser.add_argument(
        "--out-prefix",
        required=True,
        help="Output path prefix without extension (creates <prefix>.mp3 and <prefix>.json).",
    )
    args = parser.parse_args()

    prefix = Path(args.out_prefix)
    mp3_path = prefix.with_suffix(".mp3")
    json_path = prefix.with_suffix(".json")

    timestamps = asyncio.run(
        generate_audio_with_timestamps(
            text=args.text,
            voice=args.voice,
            output_mp3=mp3_path,
            output_json=json_path,
        )
    )
    print(f"Generated {mp3_path} and {json_path} ({len(timestamps)} word timestamps).")


if __name__ == "__main__":
    main()
