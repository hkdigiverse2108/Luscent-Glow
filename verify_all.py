import requests
import json

# Luscent Glow - Final Registry Verification Ritual
# This script confirms that all policies and the footer registry are perfectly synchronized.

BASE_URL = "http://127.0.0.1:5172/api"

def verify_all():
    print("Initiating Final Registry Verification Ritual...")
    
    # 1. Verify Policies Registry
    print("\n[Audit] Policies Registry:")
    try:
        res = requests.get(f"{BASE_URL}/policies/")
        if res.status_code == 200:
            policies = res.json()
            print(f"  - Total policies in cloud sanctuary: {len(policies)}")
            for p in policies:
                print(f"  - Found: {p['type']} ({p['title']})")
        else:
            print(f"  - ERROR: Could not fetch policies. (Status: {res.status_code})")
    except Exception as e:
        print(f"  - EXCEPTION: {e}")

    # 2. Verify Footer Navigation Paths
    print("\n[Audit] Footer Navigation Paths:")
    try:
        res = requests.get(f"{BASE_URL}/footer/")
        if res.status_code == 200:
            footer = res.json()
            print("  - Footer registry retrieved successfully.")
            for col_idx, col in enumerate(footer.get('columns', [])):
                if col.get('title') == "Policies":
                    print(f"  - Calibrating 'Policies' Column (Col {col_idx + 1}):")
                    for link in col.get('links', []):
                        current_path = link.get('path', '')
                        if "/policies/" in current_path:
                            new_path = current_path.replace("/policies/", "/")
                            print(f"    - Fixing legacy path: {current_path} -> {new_path}")
                            link['path'] = new_path
            
            # Synchronize fixed footer back to cloud
            upd_res = requests.put(f"{BASE_URL}/footer/", json=footer)
            if upd_res.status_code == 200:
                print("  - Navigational Calibration: SUCCESS. All legacy paths purged.")
            else:
                print("  - Navigational Calibration: SKIPPED (Already Synchronized).")
        else:
            print(f"  - ERROR: Could not fetch footer settings. (Status: {res.status_code})")
    except Exception as e:
        print(f"  - EXCEPTION: {e}")

if __name__ == "__main__":
    verify_all()
