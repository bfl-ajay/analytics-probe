# Deployment Guide

This guide covers how to deploy the Professional Report Builder to production environments.

## Deployment Platforms

### 1. Vercel (Recommended for Next.js)

Vercel is the official Next.js deployment platform with zero-config deployment.

#### Prerequisites
- Vercel account (free tier available)
- GitHub repository with your code

#### Steps

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the project

3. **Configure Environment Variables**
   - No .env.local variables needed for basic deployment
   - For custom MySQL servers, add via Vercel dashboard if needed

4. **Deploy**
   - Click "Deploy"
   - Your application will be live in ~1-2 minutes
   - Get your production URL (e.g., `your-app.vercel.app`)

#### Cost
- **Free tier**: Includes 6,000 function executions per month
- **Pro tier**: $20/month for more functions and support

### 2. AWS (EC2)

For more control and scalability, deploy to AWS EC2.

#### Prerequisites
- AWS account
- EC2 instance (t3.micro or larger recommended)
- Node.js 18+ installed on instance

#### Steps

1. **Connect to your EC2 instance**
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

2. **Install dependencies**
```bash
sudo yum update -y
sudo yum install nodejs npm -y
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs -y
```

3. **Clone and setup**
```bash
git clone https://github.com/yourusername/ReportS.git
cd ReportS
npm install
npm run build
```

4. **Setup PM2 for process management**
```bash
sudo npm install -g pm2
pm2 start npm --name "report-builder" -- start
pm2 startup
pm2 save
```

5. **Setup Nginx as reverse proxy**
```bash
sudo yum install nginx -y
sudo systemctl start nginx
```

6. **Configure Nginx** (edit `/etc/nginx/nginx.conf`)
```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

7. **Setup SSL with Let's Encrypt**
```bash
sudo yum install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

#### Cost
- **t3.micro**: Free tier (first 12 months)
- **t3.small**: ~$10-15/month
- **t3.medium**: ~$30-40/month

### 3. DigitalOcean

Simple, affordable alternative to AWS.

#### Steps

1. **Create a Droplet**
   - Choose Node.js pre-built image
   - Select Basic plan ($4-6/month minimum)

2. **SSH into your droplet**
```bash
ssh root@your-droplet-ip
```

3. **Clone and setup** (same as AWS above)

4. **Setup with DigitalOcean App Platform**
   - More expensive but fully managed (~$12/month)
   - Direct GitHub integration
   - Automatic deployments

#### Cost
- **Droplet**: $4/month (basic)
- **App Platform**: Starting at $12/month

### 4. Docker Deployment

Create a Docker image for deployment to any Docker-compatible platform.

#### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Build and run locally
```bash
docker build -t report-builder .
docker run -p 3000:3000 report-builder
```

#### Deploy to Docker Hub
```bash
docker tag report-builder yourusername/report-builder:latest
docker push yourusername/report-builder:latest
```

#### Deploy to AWS ECS, Kubernetes, or similar services using your image.

## Environment Configuration

### Production Environment Variables

Create `.env.production.local`:

```env
# Database connection pooling (optional)
DATABASE_POOL_MAX=10
DATABASE_POOL_IDLE_TIMEOUT=30000

# API endpoints
NEXT_PUBLIC_API_URL=https://your-app-url.com/api

# Optional: External analytics
NEXT_PUBLIC_ANALYTICS_ID=
```

### Database Configuration for Production

**Recommended for production**:
- Use managed database service (AWS RDS, DigitalOcean Managed)
- Enable automated backups
- Use connection pooling
- Configure read replicas for high traffic

**Connection pooling** (update `lib/database.ts`):
```typescript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

## Performance Optimization

### 1. Enable Caching
```typescript
// In API routes
response.setHeader('Cache-Control', 'public, max-age=60');
```

### 2. Database Optimization
- Add indexes on frequently queried columns
- Use EXPLAIN to analyze slow queries
- Monitor query performance

```sql
-- Add indexes
CREATE INDEX idx_customer_id ON orders(customer_id);
CREATE INDEX idx_order_status ON orders(status);
```

### 3. Frontend Optimization
- Already optimized with Next.js
- Tree-shaking removes unused code
- Image optimization built-in
- Minified CSS and JavaScript

### 4. Monitor Performance
- Use Vercel Analytics (if deployed on Vercel)
- Use AWS CloudWatch (if on AWS)
- Monitor API response times

## Security Checklist

- [ ] Use HTTPS/SSL certificates
- [ ] Enable database credentials via environment variables
- [ ] Use strong database passwords
- [ ] Enable firewall rules (only allow necessary ports)
- [ ] Regular security updates for dependencies
- [ ] Database backups enabled
- [ ] Monitor access logs
- [ ] Rate limiting on API (consider adding Upstash)

## Database Backup Strategy

### AWS RDS
- Automated daily backups enabled by default
- Retention: 7 days
- Enable backtrack for point-in-time recovery

### DigitalOcean Managed
- Automated daily backups (free)
- Backup retention: 2-30 days

### Manual Backup
```bash
# Backup
mysqldump -h host -u user -p database > backup.sql

# Restore
mysql -h host -u user -p database < backup.sql
```

## Monitoring & Logging

### Application Logs
- Vercel: Check in dashboard
- AWS: CloudWatch Logs
- DigitalOcean: Droplet logs via SSH

### Database Logs
```bash
# MySQL logs
tail -f /var/log/mysql/error.log
tail -f /var/log/mysql/slow.log
```

### Setup Alerts
- Monitor API error rates
- Monitor database connection count
- Monitor response times
- Setup email/SMS notifications

## Continuous Integration/Deployment (CI/CD)

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  Deploy-Production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test  # if you add tests
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Post-Deployment Steps

1. **Test the application**
   - Test database connection
   - Create sample reports
   - Verify all features work

2. **Monitor for errors**
   - Check error logs
   - Monitor performance metrics
   - Get user feedback

3. **Optimize based on usage**
   - Identify slow queries
   - Add indexes as needed
   - Scale resources if needed

## Rollback Procedure

### Vercel
1. Go to Vercel dashboard
2. Select your project
3. Go to "Deployments"
4. Click the previous deployment
5. Click "Promote to Production"

### AWS EC2
```bash
# Backup current code
mv /home/app /home/app-backup

# Deploy previous version
git checkout <previous-commit>
npm run build
pm2 restart all
```

## Cost Estimation

| Platform | Minimum Cost | Recommended | Notes |
|----------|--------------|-------------|-------|
| Vercel | Free | $20/month | Best for Next.js |
| AWS EC2 | Free (12 mo) | $20-40/month | More control |
| DigitalOcean | $4-6/month | $12+/month | Simple, affordable |
| AWS RDS | $15/month | $30+/month | Managed database |

## Support & Troubleshooting

### Deployment Issues

**Build fails:**
- Clear cache: `npm cache clean --force`
- Check Node version: `node --version` (should be 18+)
- Review build logs for specific errors

**Runtime errors:**
- Check environment variables are set
- Verify database is accessible
- Review API error responses

**Performance issues:**
- Check database indexes
- Monitor API response times
- Consider caching strategy

## Next Steps After Deployment

1. **Monitoring**: Setup application and database monitoring
2. **Backups**: Ensure automated backups are configured
3. **Security**: Regular security audits and updates
4. **Scaling**: Monitor usage and scale as needed
5. **Updates**: Regular dependency updates for security

---

For questions or issues with deployment, refer to the platform-specific documentation or contact support.

**Happy deploying!** 🚀
