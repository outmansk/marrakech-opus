import os
import json
import argparse
from pathlib import Path

def rename_photos(mapping_file, base_dir, dry_run=True):
    with open(mapping_file, 'r', encoding='utf-8') as f:
        mappings = json.load(f)

    for property_name, property_mappings in mappings.items():
        property_dir = Path(base_dir) / property_name
        if not property_dir.exists():
            print(f"Directory not found: {property_dir}")
            continue

        print(f"\nProcessing directory: {property_name}")
        
        for original, new_name in property_mappings.items():
            original_path = property_dir / original
            if not original_path.exists():
                print(f"  File not found: {original}")
                continue
            
            # Keep original extension if not provided in new_name
            ext = original_path.suffix
            if not new_name.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.avif')):
                new_name = f"{new_name}{ext}"
            
            new_path = property_dir / new_name
            
            if original_path == new_path:
                print(f"  Skipping (same name): {original}")
                continue
                
            if dry_run:
                print(f"  [DRY RUN] Would rename: {original} -> {new_name}")
            else:
                try:
                    if new_path.exists():
                        print(f"  [ERROR] Target already exists: {new_name}. Skipping.")
                        continue
                    os.rename(original_path, new_path)
                    print(f"  Renamed: {original} -> {new_name}")
                except Exception as e:
                    print(f"  [ERROR] Failed to rename {original}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Rename photos based on a JSON mapping.")
    parser.add_argument("mapping", help="Path to the JSON mapping file")
    parser.add_argument("--dir", default="BIENS", help="Base directory containing the property folders")
    parser.add_argument("--run", action="store_true", help="Perform actual renaming (default is dry run)")
    
    args = parser.parse_args()
    
    rename_photos(args.mapping, args.dir, dry_run=not args.run)
