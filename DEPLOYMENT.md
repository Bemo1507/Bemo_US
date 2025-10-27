# 🚀 Deployment Guide - BSC Arbitrage Bot

Panduan lengkap untuk deploy bot ke production environment.

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Node.js v18+ installed
- [ ] Git configured
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] Server dengan minimal 2GB RAM
- [ ] Stable internet connection

### 2. Security
- [ ] Private key aman (gunakan hardware wallet untuk production)
- [ ] .env file tidak di-commit
- [ ] Firewall configured
- [ ] SSH key authentication enabled
- [ ] Regular backup strategy

### 3. RPC Configuration
- [ ] Premium RPC endpoint (Ankr, QuickNode, Infura)
- [ ] Multiple backup RPC configured
- [ ] Rate limits checked
- [ ] Latency tested

## 🖥️ Deployment Options

### Option 1: VPS Deployment (Recommended)

#### Step 1: Setup VPS
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

#### Step 2: Clone & Setup
```bash
# Clone repository
git clone <your-repo-url>
cd bsc-arbitrage-bot

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit dengan config Anda
```

#### Step 3: Build
```bash
npm run build
```

#### Step 4: Start with PM2
```bash
# Start bot
pm2 start dist/index.js --name "arbitrage-bot"

# Save PM2 config
pm2 save

# Setup auto-start on reboot
pm2 startup
```

#### Step 5: Monitor
```bash
# View logs
pm2 logs arbitrage-bot

# Monitor status
pm2 monit

# View stats
pm2 status
```

### Option 2: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  arbitrage-bot:
    build: .
    container_name: bsc-arbitrage-bot
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### Deploy
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Cloud Deployment

#### AWS EC2
1. Launch EC2 instance (t3.small minimum)
2. Configure security group (allow SSH)
3. Follow VPS deployment steps
4. Setup CloudWatch for monitoring

#### Google Cloud Platform
1. Create Compute Engine instance
2. Configure firewall rules
3. Follow VPS deployment steps
4. Setup Stackdriver logging

#### DigitalOcean
1. Create Droplet (2GB RAM minimum)
2. Follow VPS deployment steps
3. Setup monitoring alerts

## 🔧 Production Configuration

### Recommended .env Settings
```env
# Use premium RPC
BSC_RPC_URL=https://your-premium-rpc.com/
BSC_RPC_URL_BACKUP=https://backup-rpc.com/

# Conservative settings for production
MIN_PROFIT_PERCENTAGE=1.0        # Higher threshold
MAX_SLIPPAGE=0.5                 # Lower slippage
GAS_PRICE_MULTIPLIER=1.2         # Faster execution
MAX_GAS_PRICE_GWEI=8             # Reasonable limit

# Start small
TRADE_AMOUNT_BNB=0.05

# Enable all safety features
ENABLE_HONEYPOT_CHECK=true
ENABLE_CIRCUIT_BREAKER=true
MAX_CONSECUTIVE_FAILURES=2

# Production logging
LOG_LEVEL=info
LOG_TO_FILE=true
```

## 📊 Monitoring Setup

### PM2 Monitoring
```bash
# Install PM2 Plus (optional, paid)
pm2 plus

# Or use free monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Log Rotation
```bash
# Install logrotate
sudo apt install logrotate

# Create config
sudo nano /etc/logrotate.d/arbitrage-bot
```

Add:
```
/path/to/bot/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 user user
    sharedscripts
}
```

### Health Check Script
Create `health-check.sh`:
```bash
#!/bin/bash

# Check if bot is running
if ! pm2 list | grep -q "arbitrage-bot.*online"; then
    echo "Bot is down! Restarting..."
    pm2 restart arbitrage-bot
    # Send alert (email, telegram, etc)
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage high: ${DISK_USAGE}%"
    # Send alert
fi
```

Add to crontab:
```bash
crontab -e
# Add: */5 * * * * /path/to/health-check.sh
```

## 🔐 Security Hardening

### 1. Firewall Setup
```bash
# UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw enable
```

### 2. Fail2Ban
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. SSH Hardening
```bash
# Disable password auth
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### 4. Auto Updates
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📈 Performance Tuning

### 1. Node.js Optimization
```bash
# Increase memory limit
pm2 start dist/index.js --name "arbitrage-bot" --node-args="--max-old-space-size=2048"
```

### 2. System Optimization
```bash
# Increase file descriptors
sudo nano /etc/security/limits.conf
# Add:
# * soft nofile 65535
# * hard nofile 65535
```

### 3. Network Optimization
```bash
# Optimize TCP settings
sudo nano /etc/sysctl.conf
# Add:
# net.ipv4.tcp_fin_timeout = 30
# net.ipv4.tcp_keepalive_time = 1200
# net.core.netdev_max_backlog = 5000

sudo sysctl -p
```

## 🔄 Update & Maintenance

### Update Bot
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart arbitrage-bot
```

### Backup Strategy
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_${DATE}.tar.gz .env logs/
# Upload to S3/backup server
```

### Database Backup (if using)
```bash
# MongoDB example
mongodump --out=/backup/mongodb_${DATE}
```

## 🚨 Disaster Recovery

### 1. Bot Crashes
```bash
# Check logs
pm2 logs arbitrage-bot --lines 100

# Restart
pm2 restart arbitrage-bot

# If persistent, rebuild
npm run build && pm2 restart arbitrage-bot
```

### 2. Server Crashes
- PM2 auto-restart configured
- Check system logs: `sudo journalctl -xe`
- Monitor resources: `htop`

### 3. Fund Recovery
- Keep backup of private key offline
- Document all wallet addresses
- Regular balance checks

## 📱 Alerts & Notifications

### Telegram Bot (Optional)
```typescript
// Add to MonitorService.ts
import axios from 'axios';

async sendTelegramAlert(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) return;
  
  await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: message
  });
}
```

### Email Alerts
```bash
# Install mailutils
sudo apt install mailutils

# Send email
echo "Bot alert!" | mail -s "Arbitrage Bot Alert" your@email.com
```

## 📊 Metrics & Analytics

### Track Performance
- Daily profit/loss
- Success rate
- Gas costs
- Opportunity frequency
- Execution time

### Tools
- Grafana + Prometheus
- PM2 Plus
- Custom dashboard
- Google Sheets API

## ✅ Post-Deployment Checklist

- [ ] Bot running stable for 24h
- [ ] Logs rotating properly
- [ ] Monitoring alerts working
- [ ] Backup strategy tested
- [ ] Security audit passed
- [ ] Performance metrics tracked
- [ ] Emergency procedures documented
- [ ] Team notified

## 🆘 Emergency Contacts

- VPS Provider Support
- RPC Provider Support
- Blockchain Explorer
- Community Discord/Telegram

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Docker Documentation](https://docs.docker.com/)
- [BSC Documentation](https://docs.bnbchain.org/)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

**Remember**: Always test in testnet first! 🧪
