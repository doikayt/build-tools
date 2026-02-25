: <<'DOCUMENTATION'

Animated GIF Demo Generator (asciinema + agg wrapper)
======================================================

Purpose
-------
This workflow provides a reproducible way to generate animated GIF demos
from a predefined shell script. It records terminal execution using
asciinema and converts the recording to an animated GIF using asciinema-agg.

The goal is to:
    - Avoid manual interactive typing
    - Ensure deterministic demo generation
    - Automate terminal recording
    - Produce clean animated GIF artifacts
    - Support Nix-based ephemeral environments
DOCUMENTATION

function demo() {
    local script="$1"

    if [[ -z "$script" ]]; then
        echo "Usage: demo <script>"
        return 1
    fi

    if [[ ! -f "$script" ]]; then
        echo "Error: Script '$script' not found"
        return 1
    fi

    local base
    base="$(basename "$script" .sh)"

    nix-shell -p asciinema asciinema-agg ncurses nodejs --run "
        asciinema rec ${base}.cast --command 'bash $script'
        agg ${base}.cast ${base}.gif
    "
}

