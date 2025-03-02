
#!/usr/bin/env fish

# Function for proper process termination
function cleanup
    echo "Waiting for server to terminate..."
    pkill -f "nodemon"
end

# Set exit handler
trap cleanup EXIT

# Check if public directory exists, create if not
if not test -d "./public"
    echo "Creating public directory..."
    mkdir -p ./public
end

# Check if index.html exists in public, create if not
if not test -f "./public/index.html"
    echo "Creating placeholder index.html..."
    echo '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=/"></head><body>Redirecting...</body></html>' > ./public/index.html
end

# Start the server
konsole -e fish -c "NODE_ENV=development nodemon src/Server/Server.js; exec fish"
