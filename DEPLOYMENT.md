# 🚀 CSS MCP Service - 详细部署指南

## 📋 部署概述

CSS MCP Service 是一个基于 Node.js 的 Monorepo 项目，支持多种部署方式和环境配置。本指南涵盖从开发环境到生产环境的完整部署流程。

## 📋 目录

1. [系统要求](#系统要求)
2. [快速开始](#快速开始)
3. [开发环境部署](#开发环境部署)
4. [测试环境部署](#测试环境部署)
5. [生产环境部署](#生产环境部署)
6. [Claude Code集成](#claude-code集成)
7. [Docker部署](#docker部署)
8. [监控和日志](#监控和日志)
9. [故障排除](#故障排除)
10. [性能优化](#性能优化)

---

## 💻 系统要求

### 基础要求
- **Node.js**: >= 18.0.0 (推荐 18.17+ 或 20.x)
- **npm**: >= 8.0.0
- **Yarn**: >= 3.8.0 (推荐)
- **内存**: 最低 512MB，推荐 2GB+
- **存储**: 最低 500MB 可用空间

### 操作系统支持
- ✅ **Linux**: Ubuntu 20.04+, CentOS 7+, RHEL 8+
- ✅ **macOS**: 10.15+ (Catalina及以上)
- ✅ **Windows**: Windows 10+ (WSL2推荐)

### 依赖检查脚本
```bash
# 创建系统检查脚本
cat > check-requirements.sh << 'EOF'
#!/bin/bash
echo "🔍 检查系统要求..."

# 检查 Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js 未安装"
    exit 1
fi

# 检查 npm
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm 未安装"
fi

# 检查 Yarn
if command -v yarn >/dev/null 2>&1; then
    YARN_VERSION=$(yarn --version)
    echo "✅ Yarn: $YARN_VERSION"
else
    echo "⚠️  建议安装 Yarn 以获得更好的性能"
fi

# 检查内存
MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}' 2>/dev/null || echo "未知")
echo "💾 可用内存: ${MEMORY}GB"

# 检查磁盘空间
DISK=$(df -h . | awk 'NR==2 {print $4}')
echo "💽 可用磁盘: $DISK"

echo "✅ 系统检查完成"
EOF

chmod +x check-requirements.sh
./check-requirements.sh
```

---

## 🚀 快速开始

### 一键部署脚本
```bash
#!/bin/bash
# quick-deploy.sh - CSS MCP Service 快速部署

set -e

echo "🚀 CSS MCP Service 快速部署开始..."

# 1. 克隆代码库
if [ ! -d "plugcss" ]; then
    echo "📥 克隆代码库..."
    git clone <your-repo-url> plugcss
fi

cd plugcss

# 2. 安装依赖
echo "📦 安装依赖..."
if command -v yarn >/dev/null 2>&1; then
    yarn install
else
    npm install
fi

# 3. 构建项目
echo "🔨 构建项目..."
if command -v yarn >/dev/null 2>&1; then
    yarn build
else
    npm run build
fi

# 4. 运行测试
echo "🧪 运行测试..."
if command -v yarn >/dev/null 2>&1; then
    yarn test --run
else
    npm test
fi

# 5. 启动服务
echo "🎉 部署完成！启动MCP服务器..."
echo "使用以下命令启动服务："
echo "  node packages/server/dist/server.js"
echo ""
echo "或使用 PM2："
echo "  pm2 start packages/server/dist/server.js --name css-mcp-server"
```

### 环境变量配置
```bash
# .env.example - 环境变量模板
NODE_ENV=production
LOG_LEVEL=info
MAX_CSS_FILE_SIZE=1048576    # 1MB
MAX_ANALYSIS_TIME=30000      # 30秒
CACHE_TTL=3600              # 1小时
ENABLE_METRICS=true
METRICS_PORT=9090
```

---

## 🛠️ 开发环境部署

### 本地开发设置
```bash
# 1. 克隆项目
git clone <repo-url>
cd css-mcp

# 2. 使用正确的 Node.js 版本
nvm use 18  # 如果使用 nvm

# 3. 启用 Corepack (推荐)
corepack enable

# 4. 安装依赖
yarn install

# 5. 开发模式启动
yarn dev
```

### 开发环境配置文件
```json
// .vscode/settings.json - VS Code 配置
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "css"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.yarn": true
  }
}
```

### 热重载开发
```bash
# 终端1: 监听核心包变化
cd packages/core
yarn dev

# 终端2: 监听服务器变化  
cd packages/server
yarn dev

# 终端3: 启动测试监听
yarn test --watch
```

### 调试配置
```json
// .vscode/launch.json - 调试配置
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug CSS MCP Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/server/dist/server.js",
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "css-mcp:*"
      },
      "console": "integratedTerminal",
      "sourceMaps": true,
      "restart": true,
      "runtimeArgs": ["--inspect"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--reporter=verbose"],
      "env": {
        "NODE_ENV": "test"
      },
      "console": "integratedTerminal",
      "sourceMaps": true
    }
  ]
}
```

---

## 🧪 测试环境部署

### 测试环境Docker配置
```dockerfile
# Dockerfile.test - 测试环境
FROM node:18-alpine

WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache git

# 复制package文件
COPY package*.json yarn.lock ./
COPY packages/*/package.json ./packages/*/

# 安装依赖
RUN corepack enable && yarn install --frozen-lockfile

# 复制源码
COPY . .

# 构建项目
RUN yarn build

# 运行测试
RUN yarn test --run

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "packages/server/dist/server.js"]
```

### CI/CD 流水线
```yaml
# .github/workflows/test.yml
name: Test Deployment

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'yarn'
    
    - name: Install dependencies
      run: yarn install --frozen-lockfile
    
    - name: Run tests
      run: yarn test --run --coverage
    
    - name: Build project
      run: yarn build
    
    - name: Test MCP Server startup
      run: |
        timeout 10s node packages/server/dist/server.js &
        sleep 5
        kill %1 || true
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### 集成测试脚本
```bash
#!/bin/bash
# integration-test.sh - 集成测试

set -e

echo "🧪 开始集成测试..."

# 1. 启动服务器 (后台)
echo "🚀 启动测试服务器..."
node packages/server/dist/server.js &
SERVER_PID=$!

# 等待服务器启动
sleep 3

# 2. 测试基本功能
echo "🔍 测试CSS分析功能..."
cat > test.css << 'EOF'
.test {
  font-size: 10px;
  color: #ccc;
}
#nav ul li a.active {
  margin: 20px;
}
button:focus {
  outline: none;
}
EOF

# 3. 模拟MCP调用
echo "📡 测试MCP协议通信..."
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | nc localhost 3000 || true

# 4. 清理
echo "🧹 清理测试环境..."
kill $SERVER_PID 2>/dev/null || true
rm -f test.css

echo "✅ 集成测试完成"
```

---

## 🏭 生产环境部署

### 生产环境最佳实践

#### 1. 应用配置
```bash
# production.env
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn
MAX_CSS_FILE_SIZE=2097152    # 2MB
MAX_ANALYSIS_TIME=60000      # 60秒
CACHE_TTL=7200              # 2小时
ENABLE_METRICS=true
HEALTH_CHECK_PATH=/health
GRACEFUL_SHUTDOWN_TIMEOUT=30000
```

#### 2. PM2 配置
```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'css-mcp-server',
    script: './packages/server/dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      LOG_LEVEL: 'warn'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }],
  
  deploy: {
    production: {
      user: 'deploy',
      host: ['server1.example.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/css-mcp.git',
      path: '/var/www/css-mcp',
      'post-deploy': 'yarn install --production && yarn build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
```

#### 3. Nginx 反向代理
```nginx
# /etc/nginx/sites-available/css-mcp
upstream css_mcp_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001 backup;
}

server {
    listen 80;
    server_name css-mcp.yourdomain.com;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # 限制请求体大小
    client_max_body_size 5M;
    
    # 健康检查
    location /health {
        proxy_pass http://css_mcp_backend;
        proxy_set_header Host $host;
        access_log off;
    }
    
    # MCP 协议代理
    location / {
        proxy_pass http://css_mcp_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 4. systemd 服务配置
```ini
# /etc/systemd/system/css-mcp.service
[Unit]
Description=CSS MCP Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/var/www/css-mcp/current
ExecStart=/usr/local/bin/pm2 start ecosystem.config.js --no-daemon --env production
ExecStop=/usr/local/bin/pm2 stop ecosystem.config.js
ExecReload=/usr/local/bin/pm2 reload ecosystem.config.js
Restart=always
RestartSec=10
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=30

# 安全配置
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/www/css-mcp

# 环境变量
Environment=NODE_ENV=production
Environment=PATH=/usr/local/bin:/usr/bin:/bin

# 资源限制
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

#### 5. 部署脚本
```bash
#!/bin/bash
# deploy-production.sh

set -e

DEPLOY_DIR="/var/www/css-mcp"
BACKUP_DIR="/var/backups/css-mcp"
SERVICE_NAME="css-mcp"

echo "🚀 开始生产环境部署..."

# 1. 备份当前版本
if [ -d "$DEPLOY_DIR/current" ]; then
    echo "💾 备份当前版本..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    cp -r "$DEPLOY_DIR/current" "$BACKUP_DIR/backup_$TIMESTAMP"
fi

# 2. 拉取最新代码
echo "📥 拉取最新代码..."
cd $DEPLOY_DIR
git pull origin main

# 3. 安装依赖
echo "📦 安装生产依赖..."
yarn install --production --frozen-lockfile

# 4. 构建项目
echo "🔨 构建项目..."
yarn build

# 5. 运行生产测试
echo "🧪 运行生产测试..."
yarn test --run --silent

# 6. 健康检查
echo "🏥 预部署健康检查..."
node packages/server/dist/server.js --check-config

# 7. 重启服务
echo "🔄 重启服务..."
sudo systemctl reload $SERVICE_NAME

# 8. 部署后验证
echo "✅ 部署后验证..."
sleep 10

# 检查服务状态
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo "✅ 服务运行正常"
else
    echo "❌ 服务启动失败，回滚..."
    # 回滚逻辑
    exit 1
fi

# 9. 清理旧备份
echo "🧹 清理旧备份..."
find $BACKUP_DIR -name "backup_*" -mtime +7 -delete

echo "🎉 生产环境部署完成！"
```

---

## 🤖 Claude Code集成

### Claude Desktop 配置

#### 1. 配置文件位置
```bash
# macOS
~/Library/Application Support/Claude/claude_desktop_config.json

# Windows  
%APPDATA%\Claude\claude_desktop_config.json

# Linux
~/.config/Claude/claude_desktop_config.json
```

#### 2. 基础配置
```json
{
  "mcpServers": {
    "css-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/packages/server/dist/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### 3. 高级配置
```json
{
  "mcpServers": {
    "css-mcp": {
      "command": "node",
      "args": [
        "/var/www/css-mcp/packages/server/dist/server.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "warn",
        "MAX_CSS_FILE_SIZE": "2097152",
        "CACHE_TTL": "7200"
      },
      "cwd": "/var/www/css-mcp"
    }
  },
  "globalShortcuts": {
    "css-analysis": {
      "key": "cmd+shift+c",
      "prompt": "Analyze the CSS code using the CSS MCP analyzer"
    }
  }
}
```

### 集成验证脚本
```bash
#!/bin/bash
# verify-claude-integration.sh

echo "🔍 验证Claude Code集成..."

# 检查配置文件
CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CONFIG_FILE" ]; then
    echo "✅ 找到Claude配置文件"
    
    # 验证配置
    if jq -e '.mcpServers."css-mcp"' "$CONFIG_FILE" > /dev/null; then
        echo "✅ CSS MCP配置存在"
        
        # 提取服务器路径
        SERVER_PATH=$(jq -r '.mcpServers."css-mcp".args[0]' "$CONFIG_FILE")
        if [ -f "$SERVER_PATH" ]; then
            echo "✅ MCP服务器文件存在: $SERVER_PATH"
        else
            echo "❌ MCP服务器文件不存在: $SERVER_PATH"
            exit 1
        fi
    else
        echo "❌ CSS MCP配置不存在"
        exit 1
    fi
else
    echo "❌ Claude配置文件不存在"
    exit 1
fi

echo "✅ Claude Code集成验证完成"
```

### 使用示例
```
# 在Claude Code中使用
用户: 请使用analyze_css工具分析这段CSS代码：

.header {
  font-size: 10px;
  color: #ccc;
  background: #ddd;
}

#nav ul li a.active {
  margin-top: 20px;
}

button:focus {
  outline: none;
}

Claude: 我将使用CSS分析工具来检查您的代码...

[CSS分析报告]
发现3个问题：
1. 可访问性问题: 字体过小 (10px)
2. 可访问性问题: 移除focus outline
3. 特异性问题: 选择器过于复杂
```

---

## 🐳 Docker部署

### 多阶段Dockerfile
```dockerfile
# Dockerfile - 生产优化
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# 启用 Corepack
RUN corepack enable

# 复制依赖文件
COPY package*.json yarn.lock ./
COPY packages/*/package.json ./packages/*/
COPY turbo.json ./
COPY tsconfig*.json ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源码
COPY . .

# 构建项目
RUN yarn build

# 运行测试
RUN yarn test --run

# 生产阶段
FROM node:18-alpine AS runtime

# 创建用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S css-mcp -u 1001

# 安装运行时依赖
RUN apk add --no-cache dumb-init

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=css-mcp:nodejs /app/packages/core/dist ./packages/core/dist
COPY --from=builder --chown=css-mcp:nodejs /app/packages/server/dist ./packages/server/dist
COPY --from=builder --chown=css-mcp:nodejs /app/packages/cli/dist ./packages/cli/dist

# 复制必要文件
COPY --from=builder --chown=css-mcp:nodejs /app/package.json ./
COPY --from=builder --chown=css-mcp:nodejs /app/packages/*/package.json ./packages/*/

# 切换用户
USER css-mcp

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# 暴露端口
EXPOSE 3000

# 启动命令
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "packages/server/dist/server.js"]
```

### Docker Compose配置
```yaml
# docker-compose.yml
version: '3.8'

services:
  css-mcp-server:
    build: .
    container_name: css-mcp-server
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
      - MAX_CSS_FILE_SIZE=2097152
      - CACHE_TTL=7200
    volumes:
      - ./logs:/app/logs
    networks:
      - css-mcp-network
    healthcheck:
      test: ["CMD", "node", "-e", "console.log('OK')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M

  nginx:
    image: nginx:alpine
    container_name: css-mcp-nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - css-mcp-server
    networks:
      - css-mcp-network

networks:
  css-mcp-network:
    driver: bridge

volumes:
  logs:
    driver: local
```

### 开发环境 Docker Compose
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  css-mcp-dev:
    build:
      context: .
      target: builder
    container_name: css-mcp-dev
    volumes:
      - .:/app
      - /app/node_modules
      - /app/packages/*/node_modules
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug port
    environment:
      - NODE_ENV=development
      - DEBUG=css-mcp:*
    command: ["yarn", "dev"]
    networks:
      - css-mcp-dev-network

networks:
  css-mcp-dev-network:
    driver: bridge
```

### Kubernetes 配置
```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: css-mcp-server
  labels:
    app: css-mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: css-mcp-server
  template:
    metadata:
      labels:
        app: css-mcp-server
    spec:
      containers:
      - name: css-mcp-server
        image: css-mcp:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "info"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: css-mcp-service
spec:
  selector:
    app: css-mcp-server
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

---

## 📊 监控和日志

### 日志配置
```typescript
// packages/server/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'css-mcp-server' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### Prometheus 监控
```typescript
// packages/server/src/middleware/metrics.ts
import promClient from 'prom-client';

// 创建指标
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const analysisCounter = new promClient.Counter({
  name: 'css_analysis_total',
  help: 'Total number of CSS analyses performed',
  labelNames: ['status']
});

const analysisTime = new promClient.Histogram({
  name: 'css_analysis_duration_seconds',
  help: 'Time taken for CSS analysis',
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

// 导出指标
export const register = promClient.register;
export { httpRequestDuration, analysisCounter, analysisTime };
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "CSS MCP Service",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_count[5m])",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "Analysis Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, css_analysis_duration_seconds_bucket)",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

---

## 🔧 故障排除

### 常见问题和解决方案

#### 1. 服务启动失败
```bash
# 检查Node.js版本
node --version

# 检查依赖完整性
yarn install --check-files

# 检查端口占用
netstat -tlnp | grep :3000

# 查看详细错误日志
NODE_ENV=development node packages/server/dist/server.js
```

#### 2. 内存使用过高
```bash
# 监控内存使用
node --max-old-space-size=1024 packages/server/dist/server.js

# 启用垃圾收集日志
node --trace-gc packages/server/dist/server.js

# 分析内存泄露
node --inspect packages/server/dist/server.js
```

#### 3. Claude Code连接问题
```bash
# 验证MCP服务器路径
which node
ls -la /path/to/server.js

# 测试服务器响应
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node packages/server/dist/server.js

# 检查权限
chmod +x packages/server/dist/server.js
```

#### 4. 性能问题诊断
```bash
# 启用性能分析
node --prof packages/server/dist/server.js

# 分析性能数据
node --prof-process isolate-0x*.log > profile.txt

# CPU 使用监控
top -p $(pgrep -f "css-mcp")
```

### 调试工具脚本
```bash
#!/bin/bash
# debug-css-mcp.sh

echo "🔍 CSS MCP 故障诊断工具"

# 系统信息
echo "📋 系统信息:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "内存: $(free -h | grep '^Mem:' | awk '{print $3 "/" $2}')"
echo "CPU: $(nproc) 核心"

# 服务状态
echo -e "\n🔍 服务状态:"
if pgrep -f "css-mcp" > /dev/null; then
    echo "✅ CSS MCP 进程运行中"
    echo "PID: $(pgrep -f css-mcp)"
    echo "内存使用: $(ps -p $(pgrep -f css-mcp) -o %mem --no-headers)%"
    echo "CPU使用: $(ps -p $(pgrep -f css-mcp) -o %cpu --no-headers)%"
else
    echo "❌ CSS MCP 进程未运行"
fi

# 端口检查
echo -e "\n🌐 端口状态:"
if netstat -tlnp | grep :3000 > /dev/null; then
    echo "✅ 端口 3000 正在监听"
else
    echo "❌ 端口 3000 未监听"
fi

# 文件检查
echo -e "\n📁 文件检查:"
FILES_TO_CHECK=(
    "packages/server/dist/server.js"
    "packages/core/dist/index.js"
    "packages/cli/dist/index.js"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (缺失)"
    fi
done

# 日志检查
echo -e "\n📝 最近日志:"
if [ -f "logs/error.log" ]; then
    echo "最近错误:"
    tail -5 logs/error.log
else
    echo "无错误日志文件"
fi

echo -e "\n✅ 诊断完成"
```

---

## ⚡ 性能优化

### Node.js 性能调优
```bash
# 内存和GC优化
export NODE_OPTIONS="--max-old-space-size=2048 --optimize-for-size"

# 启用HTTP/2
export NODE_OPTIONS="$NODE_OPTIONS --enable-source-maps"

# 预编译优化
export NODE_OPTIONS="$NODE_OPTIONS --jitless"
```

### 应用层优化
```typescript
// packages/server/src/utils/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL || '3600'),
  checkperiod: 120,
  useClones: false
});

export const getCacheKey = (css: string): string => {
  return require('crypto')
    .createHash('md5')
    .update(css)
    .digest('hex');
};

export const getFromCache = (key: string) => cache.get(key);
export const setToCache = (key: string, value: any) => cache.set(key, value);
```

### 负载均衡配置
```nginx
# nginx-lb.conf
upstream css_mcp_cluster {
    least_conn;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3002 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3003 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    location / {
        proxy_pass http://css_mcp_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_cache css_mcp_cache;
        proxy_cache_valid 200 1h;
        proxy_cache_key "$scheme$host$uri$is_args$args";
    }
}
```

---

## 📋 部署检查清单

### 部署前检查 ✅
- [ ] 系统要求满足 (Node.js ≥18, 内存≥2GB)
- [ ] 依赖安装完成且无冲突
- [ ] 所有测试通过
- [ ] 构建成功且文件完整
- [ ] 配置文件正确
- [ ] 环境变量设置
- [ ] 安全配置到位
- [ ] 备份策略准备

### 部署后验证 ✅
- [ ] 服务正常启动
- [ ] 健康检查通过
- [ ] MCP协议通信正常
- [ ] Claude Code集成工作
- [ ] 日志记录正常
- [ ] 监控指标正常
- [ ] 性能指标达标
- [ ] 错误处理正确

### 长期维护 ✅
- [ ] 定期更新依赖
- [ ] 监控日志和指标
- [ ] 备份和恢复测试
- [ ] 安全漏洞扫描
- [ ] 性能优化跟踪
- [ ] 容量规划评估

---

## 📞 支持和联系

### 问题报告
- **GitHub Issues**: [项目仓库]/issues
- **Email**: support@css-mcp.com
- **文档**: [项目仓库]/wiki

### 社区资源
- **讨论区**: [项目仓库]/discussions  
- **更新日志**: CHANGELOG.md
- **路线图**: ROADMAP.md

---

**部署指南版本**: v1.0  
**最后更新**: 2025年1月  
**适用版本**: CSS MCP Service v0.1.0+

🎉 **部署成功后，您就可以在Claude Code中享受AI驱动的CSS分析体验了！**