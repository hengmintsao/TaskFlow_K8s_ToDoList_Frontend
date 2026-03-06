# Docker 配置指南

## 📋 文件说明

### Dockerfile
多阶段构建（Multi-stage Build）的 Dockerfile，用于构建和运行 Next.js 应用

**阶段说明：**

#### Stage 1: Builder (构建阶段)
- 基础镜像：`node:20-alpine`
- 目的：安装依赖并编译应用
- 过程：
  1. 复制 `package.json` 和 `package-lock.json`
  2. 安装生产和开发依赖
  3. 复制源代码
  4. 执行 `npm run build` 构建应用

#### Stage 2: Runner (运行阶段)
- 基础镜像：`node:20-alpine`
- 目的：运行已构建的应用，大幅减小镜像体积
- 特性：
  - 仅包含必要的运行文件（public、.next）
  - 创建非 root 用户 `nextjs`（安全性）
  - 包含 Health Check（健康检查）
  - 暴露端口 3000

### .dockerignore
Docker 构建时忽略的文件，加快构建速度

### docker-compose.yml
用于本地开发和生产环境快速启动的配置

---

## 🚀 使用方法

### 1. 使用 Docker Compose 构建并运行
```bash
docker-compose up --build
```

应用将在 `http://localhost:3000` 运行

### 2. 手动构建 Docker 镜像
```bash
docker build -t taskflow:latest .
```

### 3. 运行 Docker 容器
```bash
docker run -p 3000:3000 taskflow:latest
```

### 4. 查看容器日志
```bash
docker logs <container_id>
```

---

## 📊 Multi-stage Build 的优势

| 对比项 | 单阶段 | Multi-stage |
|--------|--------|-------------|
| **镜像体积** | ~500MB+ | ~150-200MB |
| **构建物包含** | 所有开发文件 | 仅运行时文件 |
| **安全性** | 包含源代码 | 源代码不在镜像中 |
| **启动速度** | 较慢 | 快速 |

### Stage 1 产物（最终不使用）：
- node_modules（所有依赖）
- src（源代码）
- .eslintrc, tsconfig.json 等配置文件

### Stage 2 产物（最终镜像只包含）：
- `/app/public`（静态资源）
- `/app/.next/static`（编译后的 Frontend 资源）
- `/app/server.js`（以及其他必要的运行时文件）

---

## 🔒 安全性特性

1. **非 root 用户运行**
   - 使用 `nextjs` 用户而非 `root`
   - 减少容器逃逸风险

2. **最小化镜像内容**
   - 不包含开发工具
   - 不包含源代码

3. **Health Check**
   ```
   每30秒检查一次应用健康状态
   ```

---

## 🐳 Kubernetes 部署示例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskflow-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskflow
  template:
    metadata:
      labels:
        app: taskflow
    spec:
      containers:
      - name: taskflow
        image: taskflow:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 📝 环境变量配置

创建 `.env.docker` 文件（可选）：
```bash
NODE_ENV=production
```

在 docker-compose.yml 中引用：
```yaml
env_file:
  - .env.docker
```

---

## 🔍 调试技巧

### 查看镜像大小
```bash
docker images taskflow
```

### 进入容器进行调试
```bash
docker exec -it <container_id> sh
```

### 查看构建历史
```bash
docker history taskflow:latest
```

---

## ⚡ 性能优化建议

1. **使用 Alpine 太小**
   - 当前使用 `node:20-alpine` 已经很轻量

2. **缓存优化**
   - Dockerfile 中先复制 package.json，再复制代码，充分利用 Docker 缓存

3. **使用 .dockerignore**
   - 已配置，减少 Docker context 大小

---

## 常见问题

**Q: 为什么需要两个阶段？**
A: 生产镜像不需要源代码和开发依赖，分离可以大幅减小镜像体积。

**Q: 可以使用其他 Base Image 吗？**
A: 可以，但 `node:20-alpine` 已经是最优选择（轻量&安全）。

**Q: docker-compose.yml 的 health check 有什么作用？**
A: 定期检查应用是否正常运行，Kubernetes 和 Swarm 会根据健康状态决定是否重启容器。
