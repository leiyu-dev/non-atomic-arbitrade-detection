# 使用官方 Node.js 镜像作为基础镜像
FROM node:22-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat zlib zlib-dev gcompat
WORKDIR /app

# 复制包管理文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1

# 构建 Next.js 应用
RUN npm run build

# 生产运行阶段
FROM base AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat zlib zlib-dev gcompat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制 Prisma 相关文件
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# 复制必要的文件
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 创建上传目录并设置权限
RUN mkdir -p /app/public /app/public/data /app/data && \
    chown -R nextjs:nodejs /app/public /app/data && \
    chmod -R 755 /app/public /app/data

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]
