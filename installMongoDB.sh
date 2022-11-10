# Import the public key used by the package management system
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -

# Add Sources
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Reload the local package database.
sudo apt update

# Install the MongoDB packages.
sudo apt-get install -y mongodb-org

# Verify which version is installed
ps --no-headers -o comm 1

# Start and verify the service
sudo systemctl start mongod
sudo systemctl status mongod

# Enable the service start on every reboot
sudo systemctl enable mongod