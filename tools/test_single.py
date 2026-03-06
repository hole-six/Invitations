#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test single file"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

from ULTIMATE_EDITABLE_TOOL import UltimateEditableTool

tool = UltimateEditableTool()

# Test on mau40.html (one that failed)
result = tool.process_file('generate-html/mau40.html')

print("\n" + "="*80)
if result['success']:
    print(f"SUCCESS: +{result.get('text', 0)} text, +{result.get('images', 0)} images")
else:
    print(f"FAILED: {result.get('error', 'Unknown error')}")
print("="*80)
