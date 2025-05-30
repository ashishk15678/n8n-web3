#!/bin/bash

# Function to check if we're in the correct directory
is_correct_dir() {
    local dir=$1
    if [ -f "$dir/package.json" ] && ([ -d "$dir/app" ] || [ -d "$dir/src" ]); then
        return 0
    else
        return 1
    fi
}

# Function to start the server
start_server() {
    local dir=$1
    echo "Starting development server with Bun in $dir directory..."
    if command -v bun &> /dev/null; then
        cd "$dir" && bun run dev
    else
        echo "Bun is not installed. Installing Bun..."
        curl -fsSL https://bun.sh/install | bash
        source ~/.bashrc
        cd "$dir" && bun run dev
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: ./run.sh [OPTION]"
    echo "Options:"
    echo "  --desktop    Run the desktop application"
    echo "  --web        Run the web application (default)"
    echo "  -h, --help   Show this help message"
    exit 1
}

# Function to run web application
run_web() {
    if [ -d "frontend" ]; then
        if is_correct_dir "frontend"; then
            start_server "frontend"
        else
            echo "Error: Invalid frontend directory structure"
            exit 1
        fi
    else
        echo "Error: Frontend directory not found"
        exit 1
    fi
}

# Parse command line arguments
if [ $# -eq 0 ]; then
    echo "No option provided, running web application by default..."
    run_web
    exit 0
fi

case "$1" in
    --desktop)
        if [ -d "desktop" ]; then
            if is_correct_dir "desktop"; then
                start_server "desktop"
            else
                echo "Error: Invalid desktop directory structure"
                exit 1
            fi
        else
            echo "Error: Desktop directory not found"
            exit 1
        fi
        ;;
    --web)
        run_web
        ;;
    -h|--help)
        show_usage
        ;;
    *)
        echo "Error: Invalid option '$1'"
        show_usage
        ;;
esac
