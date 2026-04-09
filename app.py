import subprocess
import sys
import os
import time
import threading

def log_output(process, name):
    """Function to print output from a process in a separate thread"""
    try:
        for line in iter(process.stdout.readline, ""):
            if line:
                print(f"[{name}] {line.strip()}")
    except Exception as e:
        print(f"[!] Error in {name} log sanctuary: {e}")

def start_services():
    print("--- Starting Glow Haven Services ---")
    
    # Paths to directories
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "Frontend")
    backend_dir = os.path.join(root_dir, "Backend")

    # Commands - Cross-platform compatibility
    frontend_cmd = ["npm", "run", "dev"]
    backend_cmd = ["uvicorn", "app.main:app", "--reload", "--port", "5172"]
    is_windows = os.name == "nt"

    p_frontend = None
    p_backend = None

    try:
        # Start Frontend
        print(f"[*] Launching Frontend in {frontend_dir}...")
        p_frontend = subprocess.Popen(
            frontend_cmd, 
            cwd=frontend_dir, 
            shell=is_windows,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        # Start Backend
        print(f"[*] Launching Backend in {backend_dir}...")
        p_backend = subprocess.Popen(
            backend_cmd, 
            cwd=backend_dir, 
            shell=is_windows,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        # Start logging threads
        t_frontend = threading.Thread(target=log_output, args=(p_frontend, "FRONTEND"), daemon=True)
        t_backend = threading.Thread(target=log_output, args=(p_backend, "BACKEND"), daemon=True)
        
        t_frontend.start()
        t_backend.start()

        print("\n[✔] Both services are starting up!")
        print("    Frontend: http://localhost:5173")
        print("    Backend:  http://localhost:5172/docs (Swagger UI)")
        print("\nPress Ctrl+C to stop both services.\n")

        # Keep the script running and monitor processes
        while True:
            time.sleep(1)
            if p_frontend.poll() is not None:
                print("[!] Frontend process exited. Check dimensional logs above.")
                break
            if p_backend.poll() is not None:
                print("[!] Backend process exited. Check dimensional logs above.")
                break

    except KeyboardInterrupt:
        print("\n[!] Received stop signal. Cleaning up Sanctuary state...")
    except Exception as e:
        print(f"\n[!] Sanctuary Critical Failure: {e}")
    finally:
        # Kill both processes on exit
        if p_frontend:
            print("[*] Terminating Frontend...")
            p_frontend.terminate()
        if p_backend:
            print("[*] Terminating Backend...")
            p_backend.terminate()
        print("[✔] Sanctuary services have returned to dormancy.")

if __name__ == "__main__":
    start_services()
