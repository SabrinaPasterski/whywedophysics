#!/usr/bin/env python3
"""Build the static institution autocomplete directory from a PaperView identity database."""

from __future__ import annotations

import argparse
import json
import sqlite3
from collections import defaultdict
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("database", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    connection = sqlite3.connect(f"file:{args.database}?mode=ro", uri=True)
    rows = connection.execute(
        """
        SELECT e.display_name, p.city, p.country
        FROM entities AS e
        JOIN org_places AS p ON p.pv_id = e.entity_id
        WHERE e.kind = 'organisation'
          AND e.status = 'active'
          AND e.display_name IS NOT NULL
          AND p.city IS NOT NULL AND p.city != ''
          AND p.country IS NOT NULL AND p.country != ''
        """
    )

    grouped: dict[str, list[tuple[str, str, str]]] = defaultdict(list)
    for name, city, country in rows:
        name = " ".join(name.split())
        if len(name) < 3 or name.isdigit():
            continue
        grouped[name.casefold()].append((name, city.strip(), country.strip()))

    directory = []
    for records in grouped.values():
        places = {(city.casefold(), country.casefold()) for _, city, country in records}
        if len(places) != 1:
            continue
        name, city, country = sorted(records, key=lambda record: (len(record[0]), record[0]))[-1]
        directory.append({"name": name, "city": city, "country": country})

    directory.sort(key=lambda item: item["name"].casefold())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(directory, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"Wrote {len(directory)} institutions to {args.output}")


if __name__ == "__main__":
    main()
