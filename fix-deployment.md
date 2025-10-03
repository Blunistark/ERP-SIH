# 🔧 Quick Fixes for Deployment Issues

## Issue 1: Git Merge Conflict

Your local `quick-start.sh` has changes from the failed run. Reset it:

```bash
cd ~/ERP-SIH
git reset --hard origin/main
git pull origin main
```

This will discard local changes and get the fixed version from GitHub.

## Issue 2: Docker Permission Denied

Your user needs to be added to the docker group:

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply the group change (choose ONE option):

# Option A: Log out and back in (recommended)
exit
# Then SSH back in

# Option B: Start a new shell session
newgrp docker

# Option C: Reboot (if nothing else works)
sudo reboot
```

After fixing permissions, verify:

```bash
# Test docker without sudo
docker ps

# Should work without permission error
```

## Run Deployment

Once both issues are fixed:

```bash
cd ~/ERP-SIH
./quick-start.sh
```

## Complete Command Sequence

Here's everything in order:

```bash
# 1. Fix git conflict
cd ~/ERP-SIH
git reset --hard origin/main
git pull origin main

# 2. Fix docker permissions
sudo usermod -aG docker $USER

# 3. Apply group change (log out and back in, or):
newgrp docker

# 4. Run deployment
./quick-start.sh
```

## Verify Everything Works

```bash
# Check docker works
docker ps

# Check files are correct
cat .env.production.example

# Run deployment
./quick-start.sh
```

That's it! 🚀
