#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test tool with mau21"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

from ULTIMATE_EDITABLE_TOOL import UltimateEditableTool

tool = UltimateEditableTool()

# Test with mau21
result = tool.process_file('generate-html/mau21.html')

print("\n" + "="*80)
print("RESULT:")
print(f"  Success: {result['success']}")
print(f"  Text fields: {result.get('text', 0)}")
print(f"  Image fields: {result.get('images', 0)}")
print("="*80)
