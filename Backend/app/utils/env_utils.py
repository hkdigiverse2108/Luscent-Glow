import os

def sync_to_env(updates: dict):
    """
    Updates the .env file with the provided key-value pairs.
    Preserves comments and existing formatting where possible.
    """
    # Determine the project root (where .env usually lives relative to this file)
    # This file is in Backend/app/utils/env_utils.py
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
    env_path = os.path.join(project_root, ".env")
    
    if not os.path.exists(env_path):
        print(f"Error: .env file not found at {env_path}")
        return

    try:
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        new_lines = []
        updated_keys = set()
        
        # Mapping of DB field names to .env keys
        db_to_env_map = {
            "smtpHost": "SMTP_HOST",
            "smtpPort": "SMTP_PORT",
            "smtpUser": "SMTP_USER",
            "smtpPassword": "SMTP_PASSWORD",
            "fromEmail": "SMTP_FROM_EMAIL",
            "fromName": "SMTP_FROM_NAME"
        }

        # Prepare updates using the mapping
        env_updates = {}
        for db_key, value in updates.items():
            if db_key in db_to_env_map:
                env_updates[db_to_env_map[db_key]] = str(value)

        # Process existing lines
        for line in lines:
            stripped = line.strip()
            if stripped and "=" in stripped and not stripped.startswith("#"):
                key = stripped.split("=")[0].strip()
                if key in env_updates:
                    # Update value
                    val = env_updates[key]
                    # Wrap in quotes if it has spaces or is a name
                    if " " in val or key.endswith("_NAME"):
                         val = f"'{val}'"
                    new_lines.append(f"{key}={val}\n")
                    updated_keys.add(key)
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)

        # Add any keys that weren't in the file
        for key, val in env_updates.items():
            if key not in updated_keys:
                if " " in val or key.endswith("_NAME"):
                    val = f"'{val}'"
                new_lines.append(f"{key}={val}\n")

        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
            
        print(f"✓ .env synchronized successfully with {len(env_updates)} keys updated.")

    except Exception as e:
        print(f"Error syncing to .env: {str(e)}")
