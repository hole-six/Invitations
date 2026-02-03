#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Xử lý tất cả templates với ULTIMATE EDITABLE TOOL
"""

import os
import sys
from ULTIMATE_EDITABLE_TOOL import UltimateEditableTool

def main():
    print("🔥 ULTIMATE EDITABLE TOOL - BATCH PROCESSING 🔥")
    print("="*80)
    
    tool = UltimateEditableTool()
    
    # Tìm tất cả file HTML
    files = tool.find_html_files('generate-html')
    
    if not files:
        print("❌ Không tìm thấy file HTML nào!")
        return
    
    print(f"📁 Tìm thấy {len(files)} file(s)")
    print("="*80)
    
    # Hỏi xác nhận
    response = input(f"\n⚠️  Bạn có muốn xử lý {len(files)} file(s)? (y/n): ")
    if response.lower() != 'y':
        print("❌ Đã hủy!")
        return
    
    print("\n🚀 BẮT ĐẦU XỬ LÝ...\n")
    
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
            print(f"  ✅ OK: +{result.get('text', 0)} text, +{result.get('images', 0)} images")
        else:
            failed_files.append((filepath, result.get('error', 'Unknown error')))
            print(f"  ❌ FAILED: {result.get('error', 'Unknown error')}")
    
    # Tổng kết
    print("\n" + "="*80)
    print("📊 TỔNG KẾT:")
    print(f"  ✅ Thành công: {success_count}/{len(files)} files")
    print(f"  📝 Tổng text fields: {total_text}")
    print(f"  🖼️  Tổng image fields: {total_images}")
    
    if failed_files:
        print(f"\n  ❌ Thất bại: {len(failed_files)} files")
        for filepath, error in failed_files:
            print(f"    - {os.path.basename(filepath)}: {error}")
    
    print("="*80)
    print("\n✅ HOÀN THÀNH!")

if __name__ == "__main__":
    main()
