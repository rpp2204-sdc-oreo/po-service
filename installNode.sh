# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

# Activate NVM
. ~/.nvm/nvm.sh

# Install Latest version of Node.js
nvm install --lts

# Verify
node -e "console.log('Running Node.js ' + process.version)"