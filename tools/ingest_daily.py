#!/usr/bin/env python3
"""Append a daily payment-gateway export into src/assets/data/transactions.json.

Each daily .xls file is expected to contain only that day's new transactions
(not a full re-export), in the same '900' sheet / column layout as the
original historical export. Rows are appended to the existing dataset and
deduplicated by a composite key, so re-running this script on the same file
(or an overlapping file) is safe and never creates duplicate rows.

Usage:
    python3 tools/ingest_daily.py /path/to/daily-export.xls
    python3 tools/ingest_daily.py /path/to/daily-export.xls --sheet 900

Agent-name canonicalization (merging duplicate/sub-account agent names) is
intentionally NOT applied here - it happens client-side in
DashboardDataService so the raw source names stay intact in the data file.
"""
import argparse
import json
from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / 'src' / 'assets' / 'data' / 'transactions.json'


def s(v, default=''):
    return v if pd.notna(v) else default


def load_rows(xls_path: str, sheet: str) -> list[dict]:
    df = pd.read_excel(xls_path, sheet_name=sheet, header=0)

    before = len(df)
    df = df[df['PNR'].notna()].reset_index(drop=True)
    dropped = before - len(df)
    if dropped:
        print(f'Dropped {dropped} row(s) with empty PNR (footer/totals row).')

    df['Date'] = pd.to_datetime(df['Date'])

    records = []
    for _, r in df.iterrows():
        records.append({
            'pnr': s(r['PNR'], ''),
            'agent': s(r['Agent'], '-'),
            'user': s(r['User'], '-'),
            'date': r['Date'].strftime('%Y-%m-%d') if pd.notna(r['Date']) else '',
            'time': pd.to_datetime(r['Timestamp']).strftime('%H:%M:%S') if pd.notna(r['Timestamp']) else '',
            'amount': float(r['Amount']) if pd.notna(r['Amount']) else 0,
            'currency': s(r['Currency'], ''),
            'type': s(r['Type'], ''),
            'vpos': s(r['VPOS'], ''),
            'status': s(r['Reponse Code'], ''),
            'errorCode': s(r['Error Code'], ''),
            'errMessage': s(r['Err Message'], ''),
        })
    return records


def dedup_key(row: dict) -> tuple:
    return (row['pnr'], row['date'], row['time'], row['amount'], row['type'], row['vpos'], row['user'])


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('xls_path', help='Path to the daily .xls export')
    parser.add_argument('--sheet', default='900', help="Excel sheet name (default: '900')")
    parser.add_argument('--data', default=str(DATA_PATH), help='Path to transactions.json (default: repo data file)')
    args = parser.parse_args()

    data_path = Path(args.data)
    existing = json.loads(data_path.read_text(encoding='utf-8')) if data_path.exists() else []
    existing_keys = {dedup_key(r) for r in existing}

    new_rows = load_rows(args.xls_path, args.sheet)

    added, skipped = 0, 0
    for row in new_rows:
        key = dedup_key(row)
        if key in existing_keys:
            skipped += 1
            continue
        existing.append(row)
        existing_keys.add(key)
        added += 1

    existing.sort(key=lambda r: (r['date'], r['time']))

    data_path.write_text(
        json.dumps(existing, ensure_ascii=False, allow_nan=False),
        encoding='utf-8',
    )

    print(f'Read {len(new_rows)} row(s) from {args.xls_path}')
    print(f'Added {added} new row(s), skipped {skipped} duplicate(s).')
    print(f'Total transactions now: {len(existing)} (written to {data_path})')


if __name__ == '__main__':
    main()
