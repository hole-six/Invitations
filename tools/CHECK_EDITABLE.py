#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script kiểm tra xem file HTML nào có data-editable và data-image-editable
"""

import os
import re
from pathlib import Path

def check_file(filepath):
    """Kiểm tra 1 file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Count attributes
        editable_count = len(re.findall(r'data-editable="[^"]*"', content))
        image_editable_count = len(re.findall(r'data-image-editable="[^"]*"', content))
        
        return {
            'file': os.path.basename(filepath),
            'editable': editable_count,
            'image_editable': image_editable_count,
            'has_both': editable_count > 0 and image_editable_count > 0
        }
    except Exception as e:
        return {
            'file': os.path.basename(filepath),
            'error': str(e)
        }

def main():
    # Find all mau*.html files
    files = []
    
    # Check in generate-html folder
    generate_dir = 'generate-html'
    if os.path.exists(generate_dir):
        for i in range(1, 101):
            filepath = os.path.join(generate_dir, f'mau{i}.html')
            if os.path.exists(filepath):
                files.append(filepath)
    
    print("="*80)
    print("KIỂM TRA DATA-EDITABLE VÀ DATA-IMAGE-EDITABLE")
    print("="*80)
    print()
    
    results = []
    for filepath in sorted(files):
        result = check_file(filepath)
        results.append(result)
    
    # Print results
    print(f"{'File':<20} {'data-editable':<20} {'data-image-editable':<20} {'Status'}")
    print("-"*80)
    
    missing = []
    for r in results:
        if 'error' in r:
            print(f"{r['file']:<20} {'ERROR':<20} {'ERROR':<20} ❌")
            missing.append(r['file'])
        else:
            status = "✅" if r['has_both'] else "❌"
            print(f"{r['file']:<20} {r['editable']:<20} {r['image_editable']:<20} {status}")
            
            if not r['has_both']:
                missing.append(r['file'])
    
    print()
    print("="*80)
    print(f"TỔNG KẾT:")
    print(f"  - Tổng files: {len(results)}")
    print(f"  - Có đầy đủ: {len([r for r in results if r.get('has_both')])} ✅")
    print(f"  - Thiếu: {len(missing)} ❌")
    
    if missing:
        print()
        print("Files thiếu data-editable hoặc data-image-editable:")
        for f in missing:
            print(f"  - {f}")
    
    print("="*80)

if __name__ == "__main__":
    main()
