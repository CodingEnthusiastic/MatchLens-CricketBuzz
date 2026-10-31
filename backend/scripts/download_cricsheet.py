"""Download a bounded set of real T20 JSON matches from Cricsheet.

Usage:
    python scripts/download_cricsheet.py --count 12

The source is Cricsheet (https://cricsheet.org/), which provides structured
historical ball-by-ball data. The files are intentionally kept outside source
control and loaded by MatchRepository at startup.
"""

import argparse
import json
import shutil
import tempfile
import urllib.request
import zipfile
from pathlib import Path


URL = "https://cricsheet.org/downloads/ipl_json.zip"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=12)
    parser.add_argument("--output", type=Path, default=Path("app/data/matches"))
    args = parser.parse_args()
    if args.count < 1:
        raise SystemExit("--count must be at least 1")
    args.output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as temp_dir:
        archive = Path(temp_dir) / "cricsheet.zip"
        urllib.request.urlretrieve(URL, archive)
        with zipfile.ZipFile(archive) as source:
            candidates = []
            for name in source.namelist():
                if not name.endswith(".json") or name.endswith("README.txt"):
                    continue
                with source.open(name) as stream:
                    payload = json.load(stream)
                info = payload.get("info", {})
                if info.get("match_type") == "T20" and len(payload.get("innings", [])) >= 2:
                    candidates.append(name)
            for name in candidates[:args.count]:
                destination = args.output / Path(name).name
                with source.open(name) as source_file, destination.open("wb") as target:
                    shutil.copyfileobj(source_file, target)
    print(f"Downloaded {min(args.count, len(candidates))} T20 matches to {args.output}")


if __name__ == "__main__":
    main()
