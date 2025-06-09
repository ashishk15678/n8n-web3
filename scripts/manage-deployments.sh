#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
    echo "Usage: ./manage-deployments.sh [command]"
    echo ""
    echo "Commands:"
    echo "  list-failed    List all failed deployments"
    echo "  retry [hash]   Retry a failed deployment by commit hash"
    echo "  cleanup        Clean up old failed deployments"
    echo "  help          Show this help message"
}

# Function to list failed deployments
list_failed() {
    echo -e "${YELLOW}Fetching failed deployments...${NC}"
    git fetch origin failed-deployments
    git log origin/failed-deployments --pretty=format:"%h - %s (%cr)" --no-merges
}

# Function to retry a failed deployment
retry_deployment() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Please provide a commit hash${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Retrying deployment for commit $1...${NC}"
    
    # Create a new branch from the failed commit
    BRANCH_NAME="retry-$(date +%Y%m%d-%H%M%S)"
    git checkout -b $BRANCH_NAME $1
    
    # Push to origin
    git push origin $BRANCH_NAME
    
    echo -e "${GREEN}Created retry branch: $BRANCH_NAME${NC}"
    echo "Please create a pull request to merge this branch into main"
}

# Function to clean up old failed deployments
cleanup_deployments() {
    echo -e "${YELLOW}Cleaning up old failed deployments...${NC}"
    
    # Keep only the last 5 failed deployments
    git fetch origin failed-deployments
    COMMITS_TO_KEEP=5
    
    # Get all commits on failed-deployments branch
    COMMITS=($(git log origin/failed-deployments --pretty=format:"%h" --no-merges))
    
    if [ ${#COMMITS[@]} -gt $COMMITS_TO_KEEP ]; then
        # Create a new branch with only the last 5 commits
        git checkout -B failed-deployments ${COMMITS[$COMMITS_TO_KEEP-1]}
        git push origin failed-deployments --force
        
        echo -e "${GREEN}Cleaned up old failed deployments${NC}"
        echo "Kept the last $COMMITS_TO_KEEP deployments"
    else
        echo -e "${YELLOW}No cleanup needed. Only ${#COMMITS[@]} failed deployments exist.${NC}"
    fi
}

# Main script logic
case "$1" in
    "list-failed")
        list_failed
        ;;
    "retry")
        retry_deployment $2
        ;;
    "cleanup")
        cleanup_deployments
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        show_help
        exit 1
        ;;
esac 