# Deployment Guide - MAD-ERP

This guide covers deploying the MAD-ERP application to production.

## 🎯 Deployment Options

### Option 1: Railway (Recommended for Quick Deployment)
### Option 2: DigitalOcean (Best for Cost Control)
### Option 3: AWS/Azure/GCP (Enterprise Scale)

---

## 🚂 Option 1: Railway Deployment

### Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- Your code pushed to GitHub

### Step 1: Push to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/mad-erp.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Railway

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Select Your Repository**
   - Choose `mad-erp` from your repositories
   - Railway will auto-detect `docker-compose.yml`

3. **Configure Services**
   Railway will create 3 services:
   - `mysql-db`
   - `mad-backend`
   - `mad-frontend`

4. **Set Environment Variables**
   
   For `mysql-db`:
   ```
   MYSQL_ROOT_PASSWORD=<generate-strong-password>
   MYSQL_DATABASE=madcms
   ```

   For `mad-backend`:
   ```
   SPRING_DATASOURCE_URL=jdbc:mysql://mysql-db:3306/madcms?useSSL=false&serverTimezone=UTC
   SPRING_DATASOURCE_USERNAME=root
   SPRING_DATASOURCE_PASSWORD=<same-as-mysql-root-password>
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   JWT_SECRET=<generate-256-bit-secret>
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 3-5 minutes for build
   - Railway will provide a URL: `https://your-app.up.railway.app`

6. **Access Your App**
   - Frontend: `https://your-app.up.railway.app`
   - Login: `admin` / `admin123`

### Railway Pricing
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage
- Estimated cost: ~$10-15/month for testing

---

## 🌊 Option 2: DigitalOcean Deployment

### Prerequisites
- DigitalOcean account
- SSH key configured

### Step 1: Create a Droplet

1. **Go to DigitalOcean**
   - Create Droplet
   - Choose: Ubuntu 22.04 LTS
   - Plan: Basic ($6/month)
   - Add your SSH key

2. **SSH into Droplet**
   ```bash
   ssh root@your_droplet_ip
   ```

### Step 2: Install Docker

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

### Step 3: Deploy Application

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/mad-erp.git
cd mad-erp

# Create .env file
nano .env
# (Paste your environment variables)

# Build and run
docker-compose up --build -d

# Check logs
docker-compose logs -f
```

### Step 4: Configure Domain (Optional)

1. **Point Domain to Droplet IP**
   - Add A record: `yourdomain.com` → `your_droplet_ip`

2. **Install Nginx & SSL**
   ```bash
   apt install nginx certbot python3-certbot-nginx -y
   
   # Configure Nginx reverse proxy
   nano /etc/nginx/sites-available/mad-erp
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

   ```bash
   # Enable site
   ln -s /etc/nginx/sites-available/mad-erp /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx

   # Get SSL certificate
   certbot --nginx -d yourdomain.com
   ```

### DigitalOcean Pricing
- **Droplet**: $6/month (fixed)
- **Backups**: +$1.20/month (optional)
- **Total**: ~$7-8/month

---

## 🔒 Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Use strong JWT secret (256+ bits)
- [ ] Enable HTTPS/SSL
- [ ] Set `SPRING_JPA_HIBERNATE_DDL_AUTO=validate` in production
- [ ] Configure firewall (only ports 80, 443, 22)
- [ ] Set up database backups
- [ ] Enable Docker restart policies
- [ ] Review CORS allowed origins
- [ ] Set up monitoring/logging

---

## 🧪 Testing Phase (10-15 Days)

### Staging Environment Setup

1. **Create Staging Branch**
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Deploy Staging on Railway**
   - Create separate Railway project
   - Connect to `staging` branch
   - Use different database

3. **Share with Team**
   - Staging URL: `https://mad-erp-staging.up.railway.app`
   - Credentials: `admin` / `admin123`

4. **Collect Feedback**
   - Create GitHub Issues for bugs
   - Track feature requests
   - Monitor performance

### Production Deployment (After Testing)

1. **Merge to Main**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

2. **Deploy Production**
   - Railway auto-deploys from `main` branch
   - Or manually deploy on DigitalOcean

3. **Post-Deployment**
   - Change admin password
   - Backup database
   - Monitor logs for 24 hours

---

## 📊 Monitoring & Maintenance

### Railway
- Built-in metrics dashboard
- Log streaming
- Automatic deployments on git push

### DigitalOcean
```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update application
git pull
docker-compose up --build -d
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs mad-backend

# Common issues:
# - Database not ready → Add health checks
# - Wrong credentials → Check .env file
# - Port conflict → Change port mapping
```

### Frontend 502 Error
```bash
# Check Nginx config
docker exec mad-frontend cat /etc/nginx/conf.d/default.conf

# Verify backend is running
docker exec mad-frontend curl http://mad-backend:8080/api/auth/login
```

### Database connection issues
```bash
# Check MySQL is running
docker-compose ps

# Test connection
docker exec mad-mysql mysql -u root -p<password> -e "SHOW DATABASES;"
```

---

## 📞 Support

For deployment issues, contact the development team or create a GitHub issue.
