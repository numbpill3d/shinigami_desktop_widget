#!/bin/bash
# Helper script to set window rules via xdotool
# Run this after starting the application

WINDOW_ID=$(xdotool search --name "Shinigami Companion")

if [ -n "$WINDOW_ID" ]; then
    # Set window type to desktop
    xdotool windowtype --type desktop "$WINDOW_ID"
    
    # Set to stay below other windows
    wmctrl -i -r "$WINDOW_ID" -b add,below
    
    echo "Window rules applied to Shinigami Companion"
else
    echo "Shinigami Companion window not found"
fi
