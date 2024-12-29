#!/bin/bash

# Function to check if jq is installed
check_jq() {
    if ! command -v jq &> /dev/null; then
        echo "Error: jq is not installed. Please install jq to parse JSON."
        echo "On Ubuntu/Debian: sudo apt-get install jq"
        echo "On MacOS: brew install jq"
        echo "On CentOS/RHEL: sudo yum install jq"
        exit 1
    fi
}

# Check if in a git repository
check_git() {
    if ! git rev-parse --is-inside-work-tree &> /dev/null; then
        echo "Error: Not in a git repository"
        exit 1
    fi
}

# Check for jq and git repo
check_jq
check_git

# Check if a file argument was provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <json_file>"
    exit 1
fi

# Check if the file exists
if [ ! -f "$1" ]; then
    echo "Error: File $1 does not exist"
    exit 1
fi

# Read and parse the JSON file
json_content=$(cat "$1")

# Validate JSON format
if ! echo "$json_content" | jq empty 2>/dev/null; then
    echo "Error: Invalid JSON format in $1"
    exit 1
fi

# Process each date and commit count
echo "$json_content" | jq -r 'to_entries | .[] | "\(.key) \(.value)"' | while read -r date count; do
    # Validate count is between 1 and 4
    if ! [[ "$count" =~ ^[1-4]$ ]]; then
        echo "Error: Count must be between 1 and 4 for date $date"
        continue
    fi
    
    # Calculate total commits needed (count * 10000)
    total_commits=$((count * 10000))
    
    # Set environment variable for Git commits to use NY timezone
    export GIT_AUTHOR_DATE="$date 12:00:00 -0500"
    export GIT_COMMITTER_DATE="$date 12:00:00 -0500"
    
    echo "Processing $date with $total_commits commits..."
    
    # Perform commits
    for ((i=1; i<=total_commits; i++)); do
        # Create a temporary file with random content
        echo "$date-$i-$(date +%s%N)" > temp_file
        
        # Stage and commit
        git add temp_file
        git commit -m "Commit $i for $date" -m "Made with ❤️ by David Sarrat González

Check out the project at: https://github.com/davidsarratgonzalez/git-brush" --quiet
        
        # Remove temporary file
        rm temp_file
        git rm temp_file --quiet
        git commit -m "Cleanup $i for $date" -m "Made with ❤️ by David Sarrat González

Check out the project at: https://github.com/davidsarratgonzalez/git-brush" --quiet
        
        # Show progress every 1000 commits
        if ((i % 1000 == 0)); then
            echo "Progress: $i/$total_commits commits for $date"
        fi
    done
    
    echo "Completed $total_commits commits for $date"
done

echo "All dates processed successfully"
