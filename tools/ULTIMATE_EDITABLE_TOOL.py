#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔥 ULTIMATE EDITABLE MAKER - CLEAN VERSION 🔥
💎 Chỉ thêm data-editable và data-image-editable
🚫 KHÔNG thêm CSS hay style gì cả
"""

import re
import os
import glob
from pathlib import Path
from typing import List, Dict, Tuple, Set
import json
from datetime import datetime
from collections import defaultdict
import tkinter as tk
from tkinter import ttk, filedialog, scrolledtext, messagebox
import threading

class UltimateEditableTool:
    def __init__(self):
        self.stats = {
            'files_processed': 0,
            'text_fields_added': 0,
            'image_fields_added': 0,
            'errors': [],
            'warnings': []
        }
        
        # MEGA DICTIONARY - Từ điển thông minh
        self.smart_keywords = self._build_smart_keywords()
        
        # Track used names per file
        self.used_names = defaultdict(int)
    
    def _build_smart_keywords(self) -> Dict:
        """Xây dựng từ điển thông minh với TẤT CẢ các từ khóa"""
        return {
            # TÊN NGƯỜI
            'groom': ['chú rể', 'chu re', 'groom', 'mr', 'ông', 'anh'],
            'bride': ['cô dâu', 'co dau', 'bride', 'mrs', 'ms', 'bà', 'chị'],
            
            # GIA ĐÌNH
            'family': ['gia đình', 'gia dinh', 'family', 'nhà trai', 'nhà gái', 'nha trai', 'nha gai'],
            'parents': ['cha', 'mẹ', 'bố', 'má', 'father', 'mother', 'parents', 'ông bà', 'ong ba'],
            
            # SỰ KIỆN
            'wedding': ['tiệc cưới', 'tiec cuoi', 'wedding', 'lễ cưới', 'le cuoi', 'hôn lễ', 'hon le'],
            'ceremony': ['lễ', 'le', 'ceremony', 'nghi lễ', 'nghi le'],
            
            # ĐỊA ĐIỂM
            'venue': ['địa điểm', 'dia diem', 'venue', 'location', 'nơi', 'noi'],
            'address': ['địa chỉ', 'dia chi', 'address', 'đường', 'duong', 'street'],
            'hotel': ['khách sạn', 'khach san', 'hotel'],
            'restaurant': ['nhà hàng', 'nha hang', 'restaurant'],
            
            # THỜI GIAN
            'date': ['ngày', 'ngay', 'date', 'day'],
            'time': ['giờ', 'gio', 'time', 'hour'],
            'month': ['tháng', 'thang', 'month'],
            'year': ['năm', 'nam', 'year'],
            
            # LỜI MỜI
            'invite': ['kính mời', 'kinh moi', 'invite', 'invitation', 'trân trọng', 'tran trong'],
            'welcome': ['chào mừng', 'chao mung', 'welcome'],
            
            # ALBUM
            'album': ['album', 'thư viện', 'thu vien', 'gallery', 'ảnh', 'anh', 'photo'],
            
            # TIMELINE
            'timeline': ['chương trình', 'chuong trinh', 'timeline', 'lịch trình', 'lich trinh'],
            
            # RSVP
            'rsvp': ['rsvp', 'xác nhận', 'xac nhan', 'confirm', 'phản hồi', 'phan hoi'],
            
            # GIFT
            'gift': ['mừng cưới', 'mung cuoi', 'gift', 'quà', 'qua', 'present'],
            
            # QUOTES
            'love': ['yêu', 'yeu', 'love', 'tình yêu', 'tinh yeu'],
            'happy': ['hạnh phúc', 'hanh phuc', 'happy', 'happiness'],
            'forever': ['mãi mãi', 'mai mai', 'forever', 'eternal'],
            
            # BUTTONS
            'button': ['xem', 'view', 'see', 'click', 'bấm', 'bam', 'gửi', 'gui', 'send'],
        }
    
    def find_html_files(self, directory: str = '.') -> List[str]:
        """Tìm tất cả file HTML"""
        files = []
        
        # Tìm mau*.html
        for i in range(1, 101):
            for pattern in [f'mau{i}.html', f'mau{i:02d}.html']:
                filepath = os.path.join(directory, pattern)
                if os.path.exists(filepath):
                    files.append(filepath)
        
        # Tìm trong generate-html
        generate_dir = os.path.join(directory, 'generate-html')
        if os.path.exists(generate_dir):
            for i in range(1, 101):
                for pattern in [f'mau{i}.html', f'mau{i:02d}.html']:
                    filepath = os.path.join(generate_dir, pattern)
                    if os.path.exists(filepath):
                        files.append(filepath)
        
        return sorted(list(set(files)))
    
    def extract_text_elements(self, html: str) -> List[Dict]:
        """Trích xuất TẤT CẢ text elements - MAXIMUM AGGRESSIVE VERSION"""
        elements = []
        seen_positions = set()
        
        # STRATEGY 1: Find ALL opening tags that might contain text
        # Pattern: <TAG ...> followed by some content (may include nested tags)
        opening_tag_pattern = r'<(h[1-6]|p|span|div|strong|em|i|b|a|li|td|th|label|figcaption|small|mark|del|ins|sub|sup|button|option)([^>]*)>'
        
        for match in re.finditer(opening_tag_pattern, html, re.IGNORECASE):
            tag_name = match.group(1)
            attributes = match.group(2)
            start_pos = match.start()
            
            # Skip if already processed
            if start_pos in seen_positions:
                continue
            
            # Skip if already has data-editable
            if 'data-editable=' in attributes:
                continue
            
            # Find the closing tag
            closing_pattern = f'</{tag_name}>'
            end_match = re.search(closing_pattern, html[start_pos:], re.IGNORECASE)
            if not end_match:
                continue
            
            end_pos = start_pos + end_match.end()
            full_element = html[start_pos:end_pos]
            content = html[match.end():start_pos + end_match.start()]
            
            # Clean content
            clean_content = self._clean_text(content)
            
            # MAXIMUM RELAXED FILTERS
            # Skip ONLY if:
            # 1. Completely empty after cleaning
            if not clean_content:
                continue
            
            # 2. Skip if EXTREMELY long (definitely a major container)
            if len(content) > 3000:
                continue
            
            # 3. Skip if contains TOO MANY block elements (is a major wrapper)
            block_count = len(re.findall(r'<(div|section|article|header|footer|nav|ul|ol|table)', content, re.IGNORECASE))
            if block_count > 8:
                continue
            
            # 4. Skip script/style/svg/iframe
            skip_patterns = [
                r'<script', r'<style', r'<svg[^>]*>', r'<iframe',
            ]
            if any(re.search(pattern, content, re.IGNORECASE) for pattern in skip_patterns):
                continue
            
            # 5. Skip if it's ONLY whitespace/nbsp
            if re.match(r'^[\s\n\r\t&nbsp;]+$', clean_content):
                continue
            
            # 6. Skip common UI elements that shouldn't be editable
            skip_classes = ['icon', 'fa-', 'material-icons', 'close', 'menu-toggle']
            if any(cls in attributes.lower() for cls in skip_classes):
                continue
            
            # Store the opening tag
            opening_tag = match.group(0)
            
            seen_positions.add(start_pos)
            elements.append({
                'type': 'text_element',
                'content': clean_content,
                'position': start_pos,
                'tag': tag_name,
                'attributes': attributes,
                'opening_tag': opening_tag
            })
        
        log_msg = f"  ✓ Found {len(elements)} text elements (maximum aggressive matching)"
        
        # STRATEGY 2: FALLBACK PATTERNS for older templates (mau1-20)
        # Only use if we didn't find many elements
        if len(elements) < 15:
            seen_ids = set()
            
            # Pattern: HEADLINE
            headline_patterns = [
                r'id="(HEADLINE\d+)"[^>]*>(?:(?!</div>).)*?<(h[1-6])[^>]*>(.*?)</\2>',
                r'<(h[1-6])[^>]*id="(HEADLINE\d+)"[^>]*>(.*?)</\1>',
                r'id="(HEADLINE\d+)"[^>]*>(?:(?!</div>).)*?<div[^>]*class="[^"]*ladi-headline[^"]*"[^>]*>(.*?)</div>',
            ]
            
            for pattern in headline_patterns:
                for match in re.finditer(pattern, html, re.DOTALL | re.IGNORECASE):
                    groups = match.groups()
                    if 'HEADLINE' in groups[0]:
                        element_id, content = groups[0], groups[-1]
                    elif len(groups) >= 3:
                        element_id, content = groups[1], groups[2]
                    else:
                        continue
                    
                    if element_id not in seen_ids:
                        content = self._clean_text(content)
                        if content:
                            seen_ids.add(element_id)
                            elements.append({'type': 'headline', 'id': element_id, 'content': content})
            
            # Pattern: PARAGRAPH
            para_patterns = [
                r'id="(PARAGRAPH\d+)"[^>]*>(?:(?!</div>).)*?<div[^>]*class="[^"]*ladi-paragraph[^"]*"[^>]*>(.*?)</div>',
                r'id="(PARAGRAPH\d+)"[^>]*>(?:(?!</div>).)*?<p[^>]*>(.*?)</p>',
            ]
            
            for pattern in para_patterns:
                for match in re.finditer(pattern, html, re.DOTALL | re.IGNORECASE):
                    element_id, content = match.group(1), match.group(2)
                    if element_id not in seen_ids:
                        content = self._clean_text(content)
                        if content:
                            seen_ids.add(element_id)
                            elements.append({'type': 'paragraph', 'id': element_id, 'content': content})
            
            # Pattern: BUTTON_TEXT
            button_patterns = [
                r'id="(BUTTON_TEXT\d+)"[^>]*>(?:(?!</div>).)*?<div[^>]*class="[^"]*ladi-headline[^"]*"[^>]*>(.*?)</div>',
                r'id="(BUTTON_TEXT\d+)"[^>]*>(?:(?!</div>).)*?<p[^>]*>(.*?)</p>',
            ]
            
            for pattern in button_patterns:
                for match in re.finditer(pattern, html, re.DOTALL | re.IGNORECASE):
                    element_id, content = match.group(1), match.group(2)
                    if element_id not in seen_ids:
                        content = self._clean_text(content)
                        if content:
                            seen_ids.add(element_id)
                            elements.append({'type': 'button', 'id': element_id, 'content': content})
            
            # Pattern: FORM_ITEM
            form_patterns = [
                r'id="(FORM_ITEM\d+)"[^>]*>(?:(?!</div>).)*?(?:placeholder|value)="([^"]+)"',
            ]
            
            for pattern in form_patterns:
                for match in re.finditer(pattern, html, re.DOTALL | re.IGNORECASE):
                    element_id, content = match.group(1), match.group(2)
                    if element_id not in seen_ids:
                        content = self._clean_text(content)
                        if content:
                            seen_ids.add(element_id)
                            elements.append({'type': 'form', 'id': element_id, 'content': content})
        
        return elements
    
    def extract_image_elements(self, html: str) -> List[Dict]:
        """Trích xuất TẤT CẢ image elements"""
        images = []
        seen_positions = set()  # Track by position to avoid duplicates
        
        # 1. PLAIN IMG TAGS (for templates like mau21-mau100)
        # Find all <img> tags and add data-image-editable to them
        img_pattern = r'<img[^>]*>'
        for match in re.finditer(img_pattern, html, re.IGNORECASE):
            img_tag = match.group(0)
            position = match.start()
            
            # Skip if already has data-image-editable
            if 'data-image-editable=' in img_tag:
                continue
            
            # Skip tiny images (likely icons)
            if 'width="50"' in img_tag or 'height="50"' in img_tag:
                continue
            if 'width: 50px' in img_tag or 'height: 50px' in img_tag:
                continue
            
            # Skip common icon/UI element patterns
            skip_patterns = [
                'play-icon', 'pause-icon', 'music', 'play.png',
                'menu.svg', 'icon', 'logo', 'favicon'
            ]
            if any(pattern in img_tag.lower() for pattern in skip_patterns):
                continue
            
            # Skip very small images by checking src filename
            src_match = re.search(r'src="([^"]+)"', img_tag)
            if src_match:
                src = src_match.group(1).lower()
                # Skip if filename suggests it's an icon/small graphic
                if any(x in src for x in ['icon', 'logo', 'menu', 'play.png', 'pause.png']):
                    continue
            
            if position not in seen_positions:
                seen_positions.add(position)
                images.append({
                    'type': 'plain_img',
                    'position': position,
                    'original_tag': img_tag,
                    'is_plain': True
                })
        
        # 2. GENERIC IMAGES WITH DATA-UUID
        # <img ... data-uuid="UUID" ...>
        img_uuid_pattern = r'<img[^>]*data-uuid="([^"]+)"[^>]*>'
        for match in re.finditer(img_uuid_pattern, html, re.IGNORECASE):
            uuid = match.group(1)
            position = match.start()
            if position not in seen_positions:
                seen_positions.add(position)
                images.append({'type': 'generic_image', 'id': uuid, 'is_uuid': True})

        # 3. GENERIC BACKGROUNDS WITH DATA-UUID
        bg_pattern = r'<(div|section)[^>]*class="[^"]*?(?:bg|banner|image|photo|pattern)[^"]*"[^>]*data-uuid="([^"]+)"[^>]*>'
        for match in re.finditer(bg_pattern, html, re.IGNORECASE):
            uuid = match.group(2)
            position = match.start()
            if position not in seen_positions:
                seen_positions.add(position)
                images.append({'type': 'generic_background', 'id': uuid, 'is_uuid': True})

        # 4. STANDARD PATTERNS (Existing logic for mau1-20)
        patterns = [
            (r'id="(IMAGE\d+)"', 'image'),
            (r'id="(GALLERY\d+)"', 'gallery'),
            (r'id="(BACKGROUND\d+)"', 'background'),
        ]
        
        for pattern, img_type in patterns:
            for match in re.finditer(pattern, html, re.IGNORECASE):
                element_id = match.group(1)
                position = match.start()
                if position not in seen_positions:
                    seen_positions.add(position)
                    images.append({'type': img_type, 'id': element_id, 'is_uuid': False})
        
        return images

    
    def _clean_text(self, text: str) -> str:
        """Làm sạch text"""
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        return text if len(text) < 300 else text[:300]
    
    def get_smart_field_name(self, content: str, element_type: str, index: int) -> str:
        """Đặt tên field THÔNG MINH dựa trên nội dung"""
        content_lower = content.lower()
        
        # Check keywords
        for category, keywords in self.smart_keywords.items():
            for keyword in keywords:
                if keyword in content_lower:
                    base_name = category
                    count = self.used_names[base_name]
                    self.used_names[base_name] += 1
                    return f"{base_name}_{count + 1}" if count > 0 else base_name
        
        # Check date/time patterns
        if re.search(r'\d{1,2}[./]\d{1,2}[./]\d{2,4}', content):
            return self._unique_name('event_date')
        if re.search(r'\d{1,2}:\d{2}', content):
            return self._unique_name('event_time')
        
        # Fallback
        type_map = {
            'headline': 'title',
            'paragraph': 'text',
            'button': 'button',
            'form': 'input'
        }
        base = type_map.get(element_type, 'field')
        return self._unique_name(base)
    
    def get_smart_image_name(self, element_id: str, index: int) -> str:
        """Đặt tên image field thông minh"""
        if 'BACKGROUND' in element_id:
            return self._unique_name('background')
        if 'GALLERY' in element_id:
            return self._unique_name('gallery')
        if index <= 2:
            return self._unique_name('couple_photo')
        return self._unique_name('photo')
    
    def _unique_name(self, base: str) -> str:
        """Tạo tên duy nhất"""
        count = self.used_names[base]
        self.used_names[base] += 1
        return f"{base}_{count + 1}" if count > 0 else base
    
    def process_file(self, filename: str, log_callback=None) -> Dict:
        """Xử lý một file HTML"""
        def log(msg):
            if log_callback:
                log_callback(msg)
            print(msg)
        
        log(f"\n{'='*60}")
        log(f"[PROCESSING] {os.path.basename(filename)}")
        log(f"{'='*60}")
        
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                html = f.read()
            
            self.used_names.clear()
            original_html = html
            
            # STEP 1: REMOVE ALL data-editable attributes (including ="true" and named ones)
            html = re.sub(r'\s+data-editable="[^"]*"', '', html)
            html = re.sub(r'\s+data-image-editable="[^"]*"', '', html)
            
            log(f"  🧹 Removed all existing data-editable attributes")
            
            # STEP 2: Find ALL text elements
            text_elements = self.extract_text_elements(html)
            log(f"  ✓ Found {len(text_elements)} text elements")
            
            # STEP 3: Add unique data-editable to each element
            count_text = 0
            for idx, el in enumerate(text_elements, 1):
                field_name = self.get_smart_field_name(el['content'], el.get('type', 'text'), idx)
                
                # Check if this is a new-style element (with opening_tag) or old-style (with id)
                if 'opening_tag' in el:
                    # NEW STYLE: Find and replace the opening tag
                    original_tag = el['opening_tag']
                    
                    # Add data-editable attribute before the closing >
                    if original_tag.endswith('>'):
                        new_tag = original_tag[:-1] + f' data-editable="{field_name}">'
                    else:
                        new_tag = original_tag + f' data-editable="{field_name}">'
                    
                    # Replace in HTML (only first occurrence)
                    if original_tag in html:
                        html = html.replace(original_tag, new_tag, 1)
                        count_text += 1
                        content_preview = el['content'][:50] + '...' if len(el['content']) > 50 else el['content']
                        log(f"    ✓ {el.get('tag', 'element')}: \"{content_preview}\" → data-editable=\"{field_name}\"")
                elif 'id' in el:
                    # OLD STYLE: Use ID-based replacement
                    element_id = el['id']
                    pattern = r'(id="' + re.escape(element_id) + r'"[^>]*?)>'
                    replacement = r'\1 data-editable="' + field_name + '">'
                    new_html = re.sub(pattern, replacement, html, count=1)
                    if new_html != html:
                        html = new_html
                        count_text += 1
                        content_preview = el['content'][:50] + '...' if len(el['content']) > 50 else el['content']
                        log(f"    ✓ {el.get('type', 'element')}: {element_id} \"{content_preview}\" → data-editable=\"{field_name}\"")
            
            # STEP 4: Process IMAGES
            image_elements = self.extract_image_elements(html)
            count_images = 0
            for idx, el in enumerate(image_elements, 1):
                image_name = self.get_smart_image_name(el.get('id', f'img_{idx}'), idx)
                
                if el.get('is_plain'):
                    # PLAIN IMG TAG - Add data-image-editable attribute
                    original_tag = el['original_tag']
                    # Insert data-image-editable before the closing >
                    if original_tag.endswith('>'):
                        new_tag = original_tag[:-1] + f' data-image-editable="{image_name}">'
                    else:
                        new_tag = original_tag + f' data-image-editable="{image_name}">'
                    
                    # Replace only the first occurrence at this position
                    html = html.replace(original_tag, new_tag, 1)
                    count_images += 1
                    # Extract src for logging
                    src_match = re.search(r'src="([^"]+)"', original_tag)
                    src_preview = src_match.group(1)[-50:] if src_match else 'unknown'
                    log(f"    🖼️ img: ...{src_preview} → data-image-editable=\"{image_name}\"")
                    
                elif el.get('is_uuid'):
                    # GENERIC IMAGE REPLACEMENT
                    tag_regex = r'<[^>]*data-uuid="' + re.escape(el['id']) + r'"[^>]*>'
                    match = re.search(tag_regex, html)
                    if match:
                        original_tag = match.group(0)
                        # Add or Replace data-image-editable
                        if 'data-image-editable=' in original_tag:
                             # Replace existing value
                             new_tag = re.sub(r'data-image-editable="[^"]*"', f'data-image-editable="{image_name}"', original_tag)
                        else:
                             # Append
                             new_tag = original_tag[:-1] + f' data-image-editable="{image_name}">'
                        
                        html = html.replace(original_tag, new_tag)
                        count_images += 1
                        log(f"    🖼️ {el['type']}: {el['id']} → data-image-editable=\"{image_name}\"")
                else:
                    # LEGACY IMAGE REPLACEMENT (id="IMAGE1" pattern)
                    pattern = r'(id="' + re.escape(el['id']) + r'"[^>]*?)>'
                    # Add data-image-editable
                    html = re.sub(pattern, r'\1 data-image-editable="' + image_name + '">', html)
                    count_images += 1
                    log(f"    🖼️ {el['type']}: {el['id']} → data-image-editable=\"{image_name}\"")
            
            # Save if changed
            if html != original_html:
                # Backup
                backup_path = filename + ".backup"
                if not os.path.exists(backup_path):
                    with open(backup_path, 'w', encoding='utf-8') as f:
                        f.write(original_html)
                
                # Save - Use newline='' to prevent double-spacing
                with open(filename, 'w', encoding='utf-8', newline='') as f:
                    f.write(html)
                
                log(f"\n  ✅ SUCCESS: +{count_text} text fields, +{count_images} image fields")
                return {'success': True, 'text': count_text, 'images': count_images}
            else:
                log(f"\n  ℹ️  No changes needed")
                return {'success': True, 'text': 0, 'images': 0}
        
        except Exception as e:
            log(f"\n  ❌ ERROR: {str(e)}")
            return {'success': False, 'error': str(e)}

# GUI Application
class EditableToolGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🔥 HOAPC 🔥")
        self.root.geometry("900x700")
        self.root.configure(bg='#1e1e1e')
        
        self.tool = UltimateEditableTool()
        self.selected_files = []
        
        self.setup_ui()
    
    def setup_ui(self):
        # Title
        title = tk.Label(self.root, text="🔥HOAPC 🔥", 
                        font=('Arial', 20, 'bold'), bg='#1e1e1e', fg='#00ff00')
        title.pack(pady=10)
        
        subtitle = tk.Label(self.root, text="Tự động thêm data-editable & data-image-editable", 
                           font=('Arial', 12), bg='#1e1e1e', fg='#ffffff')
        subtitle.pack()
        
        # Buttons Frame
        btn_frame = tk.Frame(self.root, bg='#1e1e1e')
        btn_frame.pack(pady=20)
        
        tk.Button(btn_frame, text="📁 Chọn Files", command=self.select_files,
                 bg='#0078d4', fg='white', font=('Arial', 12, 'bold'),
                 padx=20, pady=10).pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="🚀 Xử Lý Tất Cả", command=self.process_all,
                 bg='#00ff00', fg='black', font=('Arial', 12, 'bold'),
                 padx=20, pady=10).pack(side=tk.LEFT, padx=5)
        
        tk.Button(btn_frame, text="🗑️ Xóa Log", command=self.clear_log,
                 bg='#ff4444', fg='white', font=('Arial', 12, 'bold'),
                 padx=20, pady=10).pack(side=tk.LEFT, padx=5)
        
        # Files Label
        self.files_label = tk.Label(self.root, text="Chưa chọn file nào", 
                                    bg='#1e1e1e', fg='#ffff00', font=('Arial', 10))
        self.files_label.pack(pady=5)
        
        # Log Area
        log_frame = tk.Frame(self.root, bg='#1e1e1e')
        log_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        tk.Label(log_frame, text="📋 LOG:", bg='#1e1e1e', fg='#ffffff', 
                font=('Arial', 12, 'bold')).pack(anchor=tk.W)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=25, 
                                                  bg='#2d2d2d', fg='#00ff00',
                                                  font=('Consolas', 10))
        self.log_text.pack(fill=tk.BOTH, expand=True)
    
    def select_files(self):
        files = filedialog.askopenfilenames(
            title="Chọn file HTML",
            filetypes=[("HTML files", "*.html"), ("All files", "*.*")]
        )
        if files:
            self.selected_files = list(files)
            self.files_label.config(text=f"Đã chọn {len(files)} file(s)")
            self.log(f"✓ Đã chọn {len(files)} file(s)")
    
    def process_all(self):
        if not self.selected_files:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn file trước!")
            return
        
        self.log("\n" + "="*80)
        self.log("🚀 BẮT ĐẦU XỬ LÝ...")
        self.log("="*80)
        
        def process():
            total_text = 0
            total_images = 0
            success_count = 0
            
            for filepath in self.selected_files:
                result = self.tool.process_file(filepath, self.log)
                if result['success']:
                    success_count += 1
                    total_text += result.get('text', 0)
                    total_images += result.get('images', 0)
            
            self.log("\n" + "="*80)
            self.log("📊 TỔNG KẾT:")
            self.log(f"  ✅ Thành công: {success_count}/{len(self.selected_files)} files")
            self.log(f"  📝 Tổng text fields: {total_text}")
            self.log(f"  🖼️  Tổng image fields: {total_images}")
            self.log("="*80)
            
            messagebox.showinfo("Hoàn thành", 
                              f"Đã xử lý xong!\n\n"
                              f"✅ {success_count}/{len(self.selected_files)} files\n"
                              f"📝 {total_text} text fields\n"
                              f"🖼️ {total_images} image fields")
        
        threading.Thread(target=process, daemon=True).start()
    
    def clear_log(self):
        self.log_text.delete(1.0, tk.END)
    
    def log(self, message):
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.root.update()

if __name__ == "__main__":
    root = tk.Tk()
    app = EditableToolGUI(root)
    root.mainloop()
