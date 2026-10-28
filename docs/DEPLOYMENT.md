# Deployment Guide — ZEROTrace AI

ZEROTrace AI is a client-side Single Page Application (SPA) built with Vite and React Router. It can be deployed to any modern static hosting platform, cloud CDN, or containerized web server.

---

## 1. Important SPA Routing Rule

Because the application uses HTML5 `pushState` routing (`react-router-dom`), the hosting web server **must be configured to route all incoming requests to `index.html`**. Without this rewrite rule, refreshing routes like `/admin-dashboard` or `/verify/ZT-2026-8F1A92` will return a `404 Not Found`.

---

## 2. Deploying to Vercel (Recommended)

The repository already includes a pre-configured `vercel.json` file in the root directory:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Deployment Steps:
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import the `ZEROTrace-AI` repository.
4. Verify Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Click **Deploy**.

---

## 3. Deploying to Netlify

For Netlify, add a `public/_redirects` file with the following content:
```text
/*    /index.html   200
```

### Deployment Steps:
1. Connect your repository in Netlify.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Deploy!

---

## 4. Docker Containerization (Nginx Alpine)

To containerize the production build with Nginx:

### Create `Dockerfile`:
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### Build & Run Docker:
```bash
docker build -t zerotrace-ai:latest .
docker run -p 8080:80 zerotrace-ai:latest
```
Visit `http://localhost:8080`.
