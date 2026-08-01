#!/usr/bin/env python3
"""Build src/assets/data/user-permissions.json from a Hitit user/role export.

Unlike the daily transaction ingestion (which appends), this is a full
snapshot export each time (filename pattern "...UserList_Full.xls"), so the
output file is fully replaced, not merged.

Usage:
    python3 tools/build_user_permissions.py /path/to/User_ListUserList_Full.xls
"""
import argparse
import json
from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / 'src' / 'assets' / 'data' / 'user-permissions.json'


def s(v, default=''):
    return v if pd.notna(v) else default


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('xls_path', help='Path to the user list .xls export')
    parser.add_argument('--sheet', default=0, help='Excel sheet name or index (default: first sheet)')
    parser.add_argument('--data', default=str(DATA_PATH), help='Output path (default: repo data file)')
    args = parser.parse_args()

    df = pd.read_excel(args.xls_path, sheet_name=args.sheet, header=0)

    grouped: dict[str, dict] = {}
    for _, r in df.iterrows():
        logon_id = s(r['Logon ID'])
        if not logon_id:
            continue
        user = grouped.get(logon_id)
        if not user:
            user = {
                'logonId': logon_id,
                'fullName': s(r['Full Name'], logon_id),
                'banned': str(s(r['Banned'], 'F')).strip().upper() == 'T',
                'portCode': s(r['Port Code'], ''),
                'srCode': s(r['SR Code'], ''),
                'srName': s(r['SR Name'], ''),
                'salesLevel': int(r['Sales Level']) if pd.notna(r['Sales Level']) else 0,
                'roles': [],
            }
            grouped[logon_id] = user
        role = s(r['Role'])
        if role and role not in user['roles']:
            user['roles'].append(role)

    users = list(grouped.values())
    users.sort(key=lambda u: u['logonId'])

    data_path = Path(args.data)
    data_path.write_text(json.dumps(users, ensure_ascii=False, allow_nan=False), encoding='utf-8')

    print(f'Read {len(df)} row(s) from {args.xls_path}')
    print(f'Wrote {len(users)} unique user(s) to {data_path}')


if __name__ == '__main__':
    main()
