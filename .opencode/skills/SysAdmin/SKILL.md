---
name: SysAdmin
description: Manage private network infrastructure - Hostinger VPS servers, Tailscale VPN, Docker services, and Nginx Proxy Manager. Deploy, monitor, and troubleshoot all services across the network. USE WHEN server management, VPS, Docker, Tailscale, nginx, service restart, system admin, infrastructure, network manager.
---

# SysAdmin - Private Network Operations

**Manage your distributed private network infrastructure with automated deployment, monitoring, and troubleshooting.**

---

## Quick Start

**When to use this skill:**
- Restart, start, or stop services on your servers
- Check service status and health
- Deploy or update services
- Monitor resource usage (RAM, CPU, disk)
- Troubleshoot network connectivity
- Configure and manage Nginx Proxy Manager routes
- Manage Tailscale network and devices

**Your Network:**
- **Server-1 (s.cytrax.com.au):** Database server (Supabase, n8n, Paperless-ngx, RustDesk)
- **Server-2 (s2.cytrax.com.au):** Applications server (Open WebUI, Ollama, Crawl4ai, Searxng, Redis)
- **VPN:** Tailscale (jerboa-boa tailnet)
- **Reverse Proxy:** Nginx Proxy Manager (NPM)

---

## Passwordless Sudo Configuration

**All `sudo` commands work without password prompts - fully automated!**

**Configuration Applied (both servers):**
- **File:** `/etc/sudoers.d/30-tailscale`
- **Rule:** `prowler ALL=(ALL) NOPASSWD: /usr/bin/tailscale`
- **Effect:** Allows `prowler` user to run tailscale commands without password

**Format:** `ssh -i ~/.ssh/id-prowler prowler@<server> "sudo <command>"`

**Example:**
```bash
# All these work without password prompts (non-interactive)
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "sudo tailscale status"
ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au "sudo tailscale up"
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "sudo ufw status"
```

This enables full network automation - the SysAdmin skill can manage your infrastructure completely unattended.

---

## Infrastructure Overview

### Server Details

| Server | IP | Specs | RAM | Disk | Purpose |
|--------|----|----|-----|------|---------|
| **s.cytrax.com.au** | `100.77.x.x` (Tailscale) | 2vCPU, 8GB RAM | 67% used (5.2GB) | 42% used (40GB) | **Database Server** |
| **s2.cytrax.com.au** | `100.90.x.x` (Tailscale) | 2vCPU, 8GB RAM | 28% used (2.2GB) | 35% used (34GB) | **Applications Server** |

### Tailnet Details

| Device | Type | Tailscale Host | Purpose | Exit Node |
|--------|------|-----------------|---------|-----------|
| **server-1** | Server | app-server-1.jerboa-boa.ts.net | Database server | N/A |
| **app-server-2** | Server | app-server-2.jerboa-boa.ts.net | Applications server | N/A |
| **kheerans-desktop** | Client | kheerans-desktop.jerboa-boa.ts.net | Desktop | YES |
| **kheerans-laptop** | Client | kheerans-laptop.jerboa-boa.ts.net | Laptop 1 | NO |
| **podione** | Client | podione.jerboa-boa.ts.net | Laptop 2 | NO |

### Service Ports & URLs

#### Server-1 Services

| Service | Port | Docker Compose | Internal URL | NPM Route | Status |
|---------|------|----------------|--------------|-----------|--------|
| **Supabase** | 5432, 3000, 8000 | ❌ Not yet | localhost:3000 | supabase.s.cytrax.com.au | ✅ Running |
| **n8n** | 5678 | ❌ Not yet | localhost:5678 | n8n.s.cytrax.com.au | ✅ Running |
| **Paperless-ngx** | 8010 | ❌ Not yet | localhost:8010 | paperless.s.cytrax.com.au | ✅ Running |
| **RustDesk** | 21114-21119 | ✅ Yes | N/A | (no route) | ✅ Running |
| **Nginx Proxy Manager** | 80, 81, 443 | ❌ Not yet | localhost:81 | nginx.s.cytrax.com.au | ✅ Running |

#### Server-2 Services

| Service | Port | Docker Compose | Internal URL | NPM Route | Status |
|---------|------|----------------|--------------|-----------|--------|
| **Redis** | 6379 | ✅ Yes | localhost:6379 | (no route) | ✅ Running |
| **Open WebUI** | 3000 | ✅ Yes | localhost:3000 | openwebui.s.cytrax.com.au | ✅ Running |
| **Ollama** | 11434 | ✅ Yes | localhost:11434 | (no route) | ✅ Running |
| **Searxng** | 8888 | ✅ Yes | localhost:8888 | search.s.cytrax.com.au | ✅ Running |
| **Crawl4ai** | 11235 | ✅ Yes | localhost:11235 | crawl4ai.s.cytrax.com.au | ⚠️ Issue |
| **Nginx Proxy Manager** | 80, 81, 443 | ❌ Not yet | localhost:81 | nginx.s.cytrax.com.au | ✅ Running |

---

## Service Management

### Restart Searxng Service

Restart the searxng search engine service on server-2.

```bash
# SSH to server-2
ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au

# Navigate to service directory
cd ~/docker/searxng

# Restart via Docker Compose
docker compose restart

# Verify service is running
docker compose logs -f

# Check connectivity
curl -I http://localhost:8888
```

**Verification:**
- Service responds to HTTP requests on port 8888
- Via Tailscale: `http://app-server-2.jerboa-boa.ts.net:8888`
- Via NPM: `https://search.s.cytrax.com.au`

---

### Manage Services by Type

#### Restart a Service

```bash
# SSH to appropriate server
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au          # For server-1
ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au         # For server-2

# Navigate to service directory
cd ~/docker/<service-name>

# Restart using Docker Compose
docker compose restart

# Verify logs
docker compose logs -f --tail=20
```

#### Check Service Status

```bash
# SSH to server
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au

# List all running containers
docker ps

# Check specific service
docker compose -f ~/docker/<service-name>/docker-compose.yaml ps

# View service health
docker inspect <container-id> | grep -A 5 Health
```

#### View Service Logs

```bash
# SSH to server
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au

# Tail logs (last 50 lines, follow mode)
cd ~/docker/<service-name>
docker compose logs -f --tail=50

# View specific time range
docker compose logs --since 2h --until 30m
```

#### Stop/Start Services

```bash
# SSH to server
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au

cd ~/docker/<service-name>

# Stop service
docker compose stop

# Start service
docker compose start

# Stop and remove containers (but keep volumes)
docker compose down

# Start again
docker compose up -d
```

---

## Resource Monitoring

### Check Server Resources

```bash
# SSH to server
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au

# Memory usage
free -h

# Disk usage
df -h

# CPU load
top -b -n 1 | head -20

# Docker container resource usage
docker stats --no-stream
```

### Monitor Both Servers

```bash
# Server-1 resources
echo "=== SERVER-1 ===" && ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "free -h && echo && df -h"

# Server-2 resources
echo "=== SERVER-2 ===" && ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au "free -h && echo && df -h"
```

---

## Tailscale Network Management

### Check Tailscale Status

```bash
# View Tailscale status (passwordless sudo)
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "sudo tailscale status"

# List all devices in tailnet
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "tailscale status --json | jq '.Peer[] | {name: .Name, ip: .TailscaleIPs}'"

# Check exit node status
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "tailscale status | grep -E 'exit|Exit'"
```

### Test Tailscale Connectivity

```bash
# From local machine or another device
# Test direct server access
ping app-server-1.jerboa-boa.ts.net
ping app-server-2.jerboa-boa.ts.net

# Test service access
curl -I http://app-server-2.jerboa-boa.ts.net:3000      # Open WebUI
curl -I http://app-server-2.jerboa-boa.ts.net:8888      # Searxng
curl -I http://app-server-2.jerboa-boa.ts.net:11235     # Crawl4ai
```

### View Tailscale Configuration

```bash
# SSH to server
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au

# View Tailscale config
cat /etc/tailscale/tailscaled.conf

# View ACL policy (requires Tailscale admin console access)
# https://login.tailscale.com/admin/acls
```

---

## Nginx Proxy Manager (NPM)

### Access NPM Admin Panel

**URL:** `https://nginx.s.cytrax.com.au`
**Port:** 81 (for unencrypted access): `http://nginx.s.cytrax.com.au:81`

### Manage NPM Routes

#### Add New Route

1. Login to NPM at `https://nginx.s.cytrax.com.au`
2. Click **Proxy Hosts** → **Add Proxy Host**
3. Configure:
   - **Domain Name:** `servicename.s.cytrax.com.au`
   - **Forward Hostname/IP:** `<server-ip>` or container name
   - **Forward Port:** Service port (e.g., 3000, 8080)
   - **SSL Certificate:** Request new SSL certificate from Let's Encrypt
   - **Enable Websocket Support:** If needed
4. Click **Save**
5. Wait for SSL certificate generation (~1 min)

#### Update Existing Route

1. Login to NPM
2. Find route in **Proxy Hosts** list
3. Click **Edit**
4. Update **Forward Port** or other settings
5. Click **Save**
6. Test connectivity

#### Remove Route

1. Login to NPM
2. Find route in **Proxy Hosts** list
3. Click **Delete** (trash icon)
4. Confirm deletion

### Common NPM Configuration Examples

#### Route to Searxng on Server-2

```
Domain Name: search.s.cytrax.com.au
Forward Hostname/IP: app-server-2.jerboa-boa.ts.net
Forward Port: 8888
SSL: Let's Encrypt
```

#### Route to Open WebUI on Server-2

```
Domain Name: openwebui.s.cytrax.com.au
Forward Hostname/IP: app-server-2.jerboa-boa.ts.net
Forward Port: 3000
SSL: Let's Encrypt
```

#### Route to n8n on Server-1

```
Domain Name: n8n.s.cytrax.com.au
Forward Hostname/IP: app-server-1.jerboa-boa.ts.net
Forward Port: 5678
SSL: Let's Encrypt
Websocket Support: ENABLED (n8n requires this)
```

---

## Common Troubleshooting

### Service Not Accessible via Tailscale

1. **Check service is running:**
   ```bash
   ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au
   docker ps | grep <service-name>
   ```

2. **Check port mapping:**
   ```bash
   docker port <container-id>
   ```

3. **Test localhost:**
   ```bash
   ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au
   curl -I http://localhost:<port>
   ```

4. **Test Tailscale IP:**
   ```bash
   curl -I http://app-server-2.jerboa-boa.ts.net:<port>
   ```

5. **Check firewall:**
   ```bash
   ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au
   sudo ufw status | grep <port>
   ```

### Service Consuming High Memory

1. **Check memory usage:**
   ```bash
   docker stats --no-stream | grep <service-name>
   ```

2. **View service logs for errors:**
   ```bash
   cd ~/docker/<service-name>
   docker compose logs --tail=100 | grep -i error
   ```

3. **Restart service:**
   ```bash
   cd ~/docker/<service-name>
   docker compose restart
   ```

4. **Check resource limits:**
   ```bash
   docker inspect <container-id> | grep -A 10 Memory
   ```

### Service Port Conflict

1. **Find service using port:**
   ```bash
   ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "sudo ss -tlnp | grep :<port>"
   ```

2. **View docker port mappings:**
   ```bash
   docker ps --format "{{.Names}}\t{{.Ports}}"
   ```

3. **Change port in docker-compose.yaml:**
   ```bash
   cd ~/docker/<service-name>
   # Edit docker-compose.yaml
   vim docker-compose.yaml

   # Restart with new port
   docker compose down
   docker compose up -d
   ```

### Cannot Connect to Server via SSH

1. **Check server is running:**
   - Login to Hostinger control panel
   - Verify VPS is active

2. **Check SSH key:**
   ```bash
   ls -la ~/.ssh/id-prowler
   chmod 600 ~/.ssh/id-prowler
   ```

3. **Test SSH connection:**
   ```bash
   ssh -vvv -i ~/.ssh/id-prowler prowler@s.cytrax.com.au
   ```

4. **Check Tailscale as backup:**
   ```bash
   # From any device connected to Tailscale
   tailscale ssh prowler@app-server-1
   tailscale ssh prowler@app-server-2
   ```

---

## Deployment & Updates

### Update Service Image

```bash
# SSH to server
ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au

# Pull latest image
cd ~/docker/<service-name>
docker compose pull

# Restart with new image
docker compose up -d

# Verify update
docker compose logs -f --tail=20
```

### Backup Before Updates

```bash
# SSH to server
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au

# Backup service data
cd ~/docker/<service-name>
tar czf ~/docker/backups/<service>_$(date +%Y%m%d_%H%M%S).tar.gz .

# Verify backup
ls -lh ~/docker/backups/<service>_*.tar.gz
```

### Rollback After Failed Update

```bash
# SSH to server
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au

# Stop service
cd ~/docker/<service-name>
docker compose stop

# Restore from backup
cd ~
tar xzf ~/docker/backups/<service>_YYYYMMDD_HHMMSS.tar.gz

# Restart service
cd ~/docker/<service-name>
docker compose up -d
```

---

## Network Security

### View Firewall Rules

```bash
# List all rules (passwordless sudo)
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "sudo ufw status verbose"

# Show numbered rules
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "sudo ufw status numbered"
```

### Add Firewall Rule

```bash
# Allow specific port (passwordless sudo)
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "sudo ufw allow 8080/tcp"

# Allow from specific IP
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "sudo ufw allow from 192.168.1.100 to any port 8080"

# Verify rules
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "sudo ufw status"
```

### View Tailscale ACLs

1. Go to Tailscale admin console: https://login.tailscale.com/admin/acls
2. View current ACL policy
3. Edit if needed
4. Save changes

---

## Quick Commands Reference

```bash
# Check services on server-1
ssh -i ~/.ssh/id-prowler prowler@s.cytrax.com.au "docker ps --format 'table {{.Names}}\t{{.Status}}'"

# Check services on server-2
ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au "docker ps --format 'table {{.Names}}\t{{.Status}}'"

# Restart a service on server-2
ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au "cd ~/docker/searxng && docker compose restart"

# View searxng logs
ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au "cd ~/docker/searxng && docker compose logs -f --tail=50"

# Check server-2 RAM
ssh -i ~/.ssh/id-prowler prowler@s2.cytrax.com.au "free -h"

# Test Searxng via Tailscale
curl -I http://app-server-2.jerboa-boa.ts.net:8888

# SSH into server-1 via Tailscale
tailscale ssh prowler@app-server-1

# SSH into server-2 via Tailscale
tailscale ssh prowler@app-server-2
```

---

## Emergency Access

If you lose SSH access to servers:

1. **Use Tailscale SSH:**
   ```bash
   # From any device on tailnet
   tailscale ssh prowler@app-server-1
   tailscale ssh prowler@app-server-2
   ```

2. **Use Hostinger Console:**
   - Login to https://hpanel.hostinger.com
   - Find VPS → Click VPS name
   - Look for "Console" or "VNC" button
   - Access server from browser

3. **Reboot server (last resort):**
   - Hostinger control panel → VPS settings → Reboot

---

## Response Format

```
🖥️ SERVER: [server-1 or server-2]
📊 ACTION: [what operation was performed]
⚡ RESULT: [outcome of operation]
✅ STATUS: [service status after action]
➡️ NEXT: [recommended next steps if any]
```

---

