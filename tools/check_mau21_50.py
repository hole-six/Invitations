#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re
from bs4 import BeautifulSoup

def count_editable_fields(html_file):
    """Count data-editable and data-image-editable fields in HTML file"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Count text editable fields
        text_fields = soup.find_all(attrs={'data-editable': True})
        
        # Count image editable fields
        image_fields = soup.find_all(attrs={'data-image-editable': True})
        
        return len(text_fields), len(image_fields)
    except Exception as e:
        return 0, 0

def main():
    html_dir = 'generate-html'
    
    print("Template | Text Fields | Image Fields")
    print("-" * 45)
    
    total_text = 0
    total_image = 0
    
    # Check mau21 to mau50
    for i in range(21, 51):
        html_file = os.path.join(html_dir, f'mau{i}.html')
        
        if os.path.exists(html_file):
            text_count, image_count = count_editable_fields(html_file)
            total_text += text_count
            total_image += image_count
            print(f"mau{i:02d}   | {text_count:11d} | {image_count:12d}")
    
    print("-" * 45)
    print(f"TOTAL    | {total_text:11d} | {total_image:12d}")

if __name__ == '__main__':
    main()
