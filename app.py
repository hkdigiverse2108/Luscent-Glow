import subprocess
import sys
import os
import time
import signal

def start_services():
    print("--- Starting Glow Haven Services ---")
    
    # Paths to directories
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "Frontend")
    backend_dir = os.path.join(root_dir, "Backend")

    # Commands
    # Use 'shell=True' for Windows compatibility with npm/uvicorn
    frontend_cmd = ["npm", "run", "dev"]
    backend_cmd = ["uvicorn", "app.main:app", "--reload", "--port", "5172"]

    try:
        # Start Frontend
        print(f"[*] Launching Frontend in {frontend_dir}...")
        p_frontend = subprocess.Popen(
            frontend_cmd, 
            cwd=frontend_dir, 
            shell=True,
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
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        print("\n[✔] Both services are starting up!")
        print("    Frontend: http://localhost:5173")
        print("    Backend:  http://localhost:5172/docs (Swagger UI)")
        print("\nPress Ctrl+C to stop both services.\n")

        # Function to print output from a process in a separate thread (simplified for script)
        def log_output(process, name):
            for line in iter(process.stdout.readline, ""):
                print(f"[{name}] {line.strip()}")

        # We'll just wait for them to finish here
        while True:
            time.sleep(1)
            if p_frontend.poll() is not None:
                print("[!] Frontend process exited.")
                break
            if p_backend.poll() is not None:
                print("[!] Backend process exited.")
                break

    except KeyboardInterrupt:
        print("\n[!] Received stop signal. Cleaning up...")
    finally:
        # Kill both processes on exit
        if 'p_frontend' in locals():
            p_frontend.terminate()
        if 'p_backend' in locals():
            p_backend.terminate()
        print("[✔] Services stopped.")

if __name__ == "__main__":
    start_services()
