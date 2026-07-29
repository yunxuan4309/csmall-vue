# 2026-05-15 前端部署问题修复总结

## 一、本次修改内容

### 1. AI 组件深色模式样式修复

**文件**：`src/views/front/ai/AIAssistant.vue`

**问题**：对比表格单元格文字在深色模式下显示不明显

**解决**：为 `.compare-cell` 添加明确颜色
```css
.compare-cell {
  font-size: 13px;
  line-height: 1.5;
  color: #303133;
}
```

---

### 2. 修复 Nginx 配置错误

**文件**：`/etc/nginx/conf.d/csmall.conf`（服务器端）

**问题**：
- 第一行被错误写成了 `iiserver` 而非 `server`
- `location /ai/` 代理配置缺失
- Nginx 未使用 csmall.conf 配置

**解决**：
1. 修复首行：`sed -i 's/^iiserver/server/' csmall.conf`
2. 添加 `/ai/` 代理配置
3. 添加 `default_server` 标记：
   ```
   listen 80 default_server;
   ```
4. 重启 Nginx 服务

---

### 3. 前端构建并部署

**问题**：本地 dist 目录是旧版本（2026/05/11），导致服务器前端未更新

**解决**：
1. 删除旧的 dist 目录
2. 重新执行 `npm run build`
3. 使用 scp 上传到服务器：
   ```bash
   scp -r .\dist\* ecs-user@8.156.85.160:/data/frontend/
   ```

---

## 二、服务器 Nginx 完整配置

```nginx
server {
    listen 80;
    listen 80 default_server;
    server_name 8.156.85.160 coolshark-shop.cn;

    location ~* .(jpg|jpeg|png|gif|webp)$ {
        root /data/csmall-upload;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        root /data/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /front/ { proxy_pass http://127.0.0.1:10087; ... }
    location /sso/ { proxy_pass http://127.0.0.1:10087; ... }
    location /user/ { proxy_pass http://127.0.0.1:10087; ... }
    location /admin/ { proxy_pass http://127.0.0.1:10087; ... }
    location /oms/ { proxy_pass http://127.0.0.1:10087; ... }
    location /search/ { proxy_pass http://127.0.0.1:10087; ... }
    location /resource/ { proxy_pass http://127.0.0.1:10087; ... }
    location /seckill/ { proxy_pass http://127.0.0.1:10087; ... }
    location /ai/ { proxy_pass http://127.0.0.1:10087; ... }
}
```

---

## 三、部署检查清单

- [x] 前端构建生产版本
- [x] 上传 dist 到服务器 `/data/frontend/`
- [x] Nginx 添加所有 API 代理（含 /ai/）
- [x] Nginx 添加 default_server 标记
- [x] 重启 Nginx 服务
- [x] 验证 `/ai/` 代理正常
- [x] 验证前端页面正常访问

---

## 四、后续部署命令速查

```bash
# 本地构建
npm run build

# 上传到服务器
scp -r .\dist\* ecs-user@8.156.85.160:/data/frontend/

# 服务器端（Nginx 配置已修复，只需重载）
sudo nginx -s reload
```
