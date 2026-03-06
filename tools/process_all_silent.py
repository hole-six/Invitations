#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Process all templates silently"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

from ULTIMATE_EDITABLE_TOOL import UltimateEditableTool

tool = UltimateEditableTool()

# Find all files
files = tool.find_html_files('generate-html')

print(f"Processing {len(files)} files...")
print("="*80)

total_text = 0
total_images = 0
success_count = 0
failed_files = []

for i, filepath in enumerate(files, 1):
    # Silent processing
    result = tool.process_file(filepath, log_callback=None)
    
    if result['success']:
        success_count += 1
        total_text += result.get('text', 0)
        total_images += result.get('images', 0)
        if result.get('text', 0) > 0 or result.get('images', 0) > 0:
            print(f"[{i}/{len(files)}] {filepath.split('/')[-1]}: +{result.get('text', 0)} text, +{result.get('images', 0)} images")
    else:
        failed_files.append((filepath, result.get('error', 'Unknown')))
        print(f"[{i}/{len(files)}] {filepath.split('/')[-1]}: FAILED - {result.get('error', 'Unknown')}")

print("\n" + "="*80)
print("SUMMARY:")
print(f"  Success: {success_count}/{len(files)} files")
print(f"  Total text fields added: {total_text}")
print(f"  Total image fields added: {total_images}")

if failed_files:
    print(f"\n  Failed: {len(failed_files)} files")
    for filepath, error in failed_files[:10]:  # Show first 10
        print(f"    - {filepath.split('/')[-1]}: {error}")
    if len(failed_files) > 10:
        print(f"    ... and {len(failed_files) - 10} more")

print("="*80)
