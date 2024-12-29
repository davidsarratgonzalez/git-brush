#!/bin/bash

# Default multiplier if not provided
MULTIPLIER=${2:-200}
JSON_FILE=$1

# If no JSON file specified, look for a single JSON file in directory
if [ -z "$JSON_FILE" ]; then
    # Count JSON files
    json_count=$(ls -1 *.json 2>/dev/null | wc -l)
    
    if [ "$json_count" -eq 1 ]; then
        JSON_FILE=$(ls *.json)
    else
        echo "Error: Please specify a JSON file, or ensure only one JSON file exists in directory"
        exit 1
    fi
fi

# Check if git repo is initialized
if [ ! -d .git ]; then
    echo "Error: Not a git repository. Please run 'git init' first."
    exit 1
fi

# Check if JSON file exists
if [ ! -f "$JSON_FILE" ]; then
    echo "Error: JSON file not found"
    exit 1
fi

# Create initial README.md with git brush link
echo "Made with [git brush](https://www.github.com/davidsarratgonzalez/git-brush)! 🎨" > README.md
git add README.md
git commit -m "Painted my GitHub contribution grid! 🎨

Co-authored-by: David Sarrat González <113605621+davidsarratgonzalez@users.noreply.github.com>" > /dev/null

# Initialize contribution grid
declare -A grid
declare -A commit_counts
declare -A year_commits
weeks=53 # Account for years that span 53 weeks
days=7
current_year=""

# Clear screen and hide cursor
clear
tput civis

# ANSI color codes matching GitHub's contribution colors
NO_CONTRIBUTION=$'\e[38;5;238m'  # Dark gray
LEVEL1=$'\e[38;5;22m'   # Lightest green
LEVEL2=$'\e[38;5;28m'   # Light green
LEVEL3=$'\e[38;5;34m'   # Medium green
LEVEL4=$'\e[38;5;40m'   # Dark green
RED=$'\e[38;5;196m'     # Red color for heart
RESET=$'\e[0m'

# Function to draw empty grid for a year
draw_empty_grid() {
    local year=$1
    local start_day=$(date -j -f "%Y-%m-%d" "$year-01-01" "+%w")
    
    # Calculate if it's a leap year
    local is_leap_year=0
    if [ $((year % 4)) -eq 0 ] && [ $((year % 100)) -ne 0 ] || [ $((year % 400)) -eq 0 ]; then
        is_leap_year=1
    fi
    
    # Calculate total days in year
    local total_days=$((365 + is_leap_year))
    
    # Initialize empty grid
    for ((d=0; d<days; d++)); do
        for ((w=0; w<weeks; w++)); do
            grid[$w,$d]=" "
            commit_counts[$w,$d]=0
            grid[$w,$d]="${NO_CONTRIBUTION}■${RESET}"
        done
    done

    # Draw initial grid display
    echo -e "\n🎨 Contribution grid for $year:\n"
    
    # Print grid
    for ((d=0; d<days; d++)); do
        for ((w=0; w<weeks; w++)); do
            echo -n "${grid[$w,$d]} "
        done
        echo
    done

    # Draw progress display
    echo -e "\n📊 Progress dashboard"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⏳ Progress: [                    ] 0%"
    echo "📅 Current date:                             "
    echo "📅 Day progress:                         "
    echo "📅 Year progress:                            "
    echo "📈 Total progress:                           "
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "Made with ${RED}❤️${RESET} by David Sarrat González"
}

# Count total commits needed
total_commits=0
while IFS= read -r line; do
    intensity=$(echo "$line" | grep -o '": [0-9]' | tr -d '": ')
    if [ ! -z "$intensity" ]; then
        total_commits=$((total_commits + intensity * MULTIPLIER))
    fi
done < "$JSON_FILE"

commits_done=0
start_time=$(date +%s)
last_commit_date=""

# Read JSON file and process commits
while IFS= read -r line; do
    # Parse date and intensity from each JSON line
    date=$(echo "$line" | grep -o '"[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}"' | tr -d '"')
    intensity=$(echo "$line" | grep -o '": [0-9]' | tr -d '": ')
    
    if [ ! -z "$date" ] && [ ! -z "$intensity" ]; then
        year=$(echo "$date" | cut -d'-' -f1)
        
        # If year changes, reset grid and draw new one
        if [ "$year" != "$current_year" ]; then
            current_year=$year
            year_commits[$current_year]=0
            # Clear all arrays
            for ((w=0; w<weeks; w++)); do
                for ((d=0; d<days; d++)); do
                    grid[$w,$d]=" "
                    commit_counts[$w,$d]=0
                done
            done
            clear
            draw_empty_grid "$current_year"
        fi
        
        # Get start of year day of week (0-6)
        start_day=$(date -j -f "%Y-%m-%d" "$current_year-01-01" "+%w")
        
        # Use date command compatible with BSD/macOS
        start_of_year=$(date -j -f "%Y-%m-%d" "${current_year}-01-01" "+%s")
        current_date=$(date -j -f "%Y-%m-%d" "$date" "+%s")
        
        # Calculate adjusted week number accounting for start day offset
        days_since_start=$(( (current_date - start_of_year) / (24 * 60 * 60) ))
        week=$(( (days_since_start + start_day) / 7 ))
        
        # Get day of week (0-6, where 0 is Sunday)
        day=$(date -j -f "%Y-%m-%d" "$date" "+%w")
        
        # Update commit count for this cell
        commit_count=$((intensity * MULTIPLIER))
        commit_counts[$week,$day]=$((commit_counts[$week,$day] + commit_count))
        
        # Make the actual commits
        for ((i=1; i<=commit_count; i++)); do
            echo "Commit $i on $date" > temp_file
            git add temp_file
            GIT_AUTHOR_DATE="$date"T12:00:00-05:00" GIT_COMMITTER_DATE="$date"T12:00:00-05:00" git commit -m "$date:$i 🎨" > /dev/null
            commits_done=$((commits_done + 1))
            year_commits[$current_year]=$((year_commits[$current_year] + 1))
            last_commit_date=$date
            
            # Update progress display every 5 commits
            if [ $((commits_done % 5)) -eq 0 ]; then
                # Calculate progress percentage and ETA
                progress=$((commits_done * 100 / total_commits))
                current_time=$(date +%s)
                elapsed=$((current_time - start_time))
                if [ $commits_done -gt 0 ]; then
                    rate=$(bc <<< "scale=2; $elapsed / $commits_done")
                    remaining_commits=$((total_commits - commits_done))
                    eta_seconds=$(bc <<< "$rate * $remaining_commits" | cut -d. -f1)
                    eta_min=$((eta_seconds / 60))
                    eta_sec=$((eta_seconds % 60))
                    
                    # Calculate progress bar width (20 chars)
                    progress_width=$((progress * 20 / 100))
                    
                    # Update progress display
                    tput cup $((days + 6)) 11
                    printf "[%-20s] %3d%% (ETA: %02d:%02d)" "$(printf "%${progress_width}s" | tr ' ' '#')" $progress $eta_min $eta_sec
                    tput cup $((days + 7)) 35
                    echo -n "$date"
                    
                    # Clear previous day progress before showing new one
                    tput cup $((days + 8)) 35
                    printf "%-30s" " " # Clear the line
                    tput cup $((days + 8)) 35
                    echo -n "$i/$commit_count (Intensity: $intensity)"
                    
                    # Clear previous year progress before showing new one  
                    tput cup $((days + 9)) 35
                    printf "%-30s" " " # Clear the line
                    tput cup $((days + 9)) 35
                    echo -n "${year_commits[$current_year]}/$total_commits"
                    
                    tput cup $((days + 10)) 35
                    echo -n "$commits_done/$total_commits"
                fi
            fi
            
            # Update grid cell based on current progress
            if [ $i -eq 0 ]; then
                grid[$week,$day]="${NO_CONTRIBUTION}■${RESET}"
            elif [ $i -le $MULTIPLIER ]; then
                grid[$week,$day]="${LEVEL1}■${RESET}"
            elif [ $i -le $((MULTIPLIER * 2)) ]; then
                grid[$week,$day]="${LEVEL2}■${RESET}"
            elif [ $i -le $((MULTIPLIER * 3)) ]; then
                grid[$week,$day]="${LEVEL3}■${RESET}"
            elif [ $i -le $((MULTIPLIER * 4)) ]; then
                grid[$week,$day]="${LEVEL4}■${RESET}"
            fi
            
            # Update grid display with cursor positioning
            tput cup $((day + 2)) $((week * 2))
            echo -n "${grid[$week,$day]} "
        done
        rm temp_file
    fi
done < "$JSON_FILE"

# Show cursor again
tput cnorm

# Final completion message
tput cup $((days + 13)) 0
echo "We have successfully painted your GitHub contribution grid! 🎉"
echo "Don't forget to push your changes to GitHub!"

exit 0
