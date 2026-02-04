#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Xu ly tat ca templates voi ULTIMATE EDITABLE TOOL
"""

import os
import sys
# Set stdout explicitly to utf-8 if possible, though Windows console is tricky.
# Simpler to just avoid fancy chars or force encoding.
sys.stdout.reconfigure(encoding='utf-8')

from ULTIMATE_EDITABLE_TOOL import UltimateEditableTool

def main():
    print("ULTIMATE EDITABLE TOOL - BATCH PROCESSING")
    print("="*80)
    
    tool = UltimateEditableTool()
    
    # Tim tat ca file HTML
    files = tool.find_html_files('generate-html')
    
    if not files:
        print("Khong tim thay file HTML nao!")
        return
    
    print(f"Tim thay {len(files)} file(s)")
    print("="*80)
    
    # Skip prompt, auto run
    print("\nBAT DAU XU LY...\n")
    
    # Xử lý từng file
    total_text = 0
    total_images = 0
    success_count = 0
    failed_files = []
    
    for i, filepath in enumerate(files, 1):
        print(f"\n[{i}/{len(files)}] Processing: {os.path.basename(filepath)}")
        print("-"*60)
        
        result = tool.process_file(filepath)
        
        if result['success']:
            success_count += 1
            total_text += result.get('text', 0)
            total_images += result.get('images', 0)
            print(f"  OK: +{result.get('text', 0)} text, +{result.get('images', 0)} images")
        else:
            failed_files.append((filepath, result.get('error', 'Unknown error')))
            print(f"  FAILED: {result.get('error', 'Unknown error')}")
    
    # Tong ket
    print("\n" + "="*80)
    print("TONG KET:")
    print(f"  Thanh cong: {success_count}/{len(files)} files")
    print(f"  Tong text fields: {total_text}")
    print(f"  Tong image fields: {total_images}")
    
    if failed_files:
        print(f"\n  That bai: {len(failed_files)} files")
        for filepath, error in failed_files:
            print(f"    - {os.path.basename(filepath)}: {error}")
    
    print("="*80)
    print("\nHOAN THANH!")

if __name__ == "__main__":
    main()
