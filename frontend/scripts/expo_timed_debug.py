import os
import select
import signal
import subprocess
import sys
import time


def main() -> int:
    env = os.environ.copy()
    env.update({
        "EXPO_DEBUG": "1",
        "EXPO_NO_DOCTOR": "1",
        "EXPO_NO_TELEMETRY": "1",
        "EXPO_NO_UPDATE_CHECK": "1",
        "DEBUG": "expo:*",
        "CI": "1",
        "NODE_OPTIONS": "--dns-result-order=ipv4first",
    })

    default_cmd = [
        "npx",
        "expo",
        "start",
        "--web",
        "--localhost",
        "--max-workers",
        "2",
    ]

    cmd = sys.argv[1:] or default_cmd

    print("[debug] running:", " ".join(cmd))
    start = time.time()

    p = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        env=env,
        start_new_session=True,
    )

    printed = False
    try:
        while True:
            if p.poll() is not None:
                break
            if time.time() - start > 25:
                break

            if p.stdout is None:
                time.sleep(0.2)
                continue

            r, _, _ = select.select([p.stdout], [], [], 0.5)
            if r:
                line = p.stdout.readline()
                if line:
                    printed = True
                    sys.stdout.write(line)
                    sys.stdout.flush()

        if p.poll() is None:
            try:
                os.killpg(p.pid, signal.SIGINT)
            except Exception:
                p.send_signal(signal.SIGINT)
            end_wait = time.time() + 3
            while time.time() < end_wait:
                if p.poll() is not None or p.stdout is None:
                    break
                r, _, _ = select.select([p.stdout], [], [], 0.2)
                if r:
                    line = p.stdout.readline()
                    if line:
                        printed = True
                        sys.stdout.write(line)
                        sys.stdout.flush()

        if p.poll() is None:
            try:
                os.killpg(p.pid, signal.SIGKILL)
            except Exception:
                p.kill()

            end_wait = time.time() + 2
            while time.time() < end_wait:
                if p.poll() is not None:
                    break
                time.sleep(0.05)

    finally:
        try:
            if p.stdout:
                p.stdout.close()
        except Exception:
            pass

    runtime = time.time() - start
    print(f"\n[debug] printed_logs={printed} exit={p.poll()} runtime={runtime:.1f}s")
    # Non-zero exit is fine; this is just a diagnostic runner.
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
