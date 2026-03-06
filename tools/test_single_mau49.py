#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for mau49.html
"""

import sys
import os

# Add tools directory to path
sys.path.insert(0, os.path.dirname(__file__))

from ULTIMATE_EDITABLE_TOOL import UltimateEditableTool

def main():
    tool = UltimateEditableTool()
    
    # Test on mau49
    filepath = 'generate-html/mau49.html'
    
    print("="*80)
    print(f"Testing on {filepath}")
    print("="*80)
    
    result = tool.process_file(filepath)
    
    print("\n" + "="*80)
    print("RESULT:")
    print(f"  Success: {result['success']}")
    if result['success']:
        print(f"  Text fields: {result.get('text', 0)}")
        print(f"  Image fields: {result.get('images', 0)}")
    else:
        print(f"  Error: {result.get('error', 'Unknown')}")
    print("="*80)

if __name__ == "__main__":
    main()
