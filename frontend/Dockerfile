# image ของ frontend (Next.js) แบ่งเป็น 2 ขั้น: build แล้วคัดลอกเฉพาะผลลัพธ์ไปรัน

# ---------- ขั้นที่ 1: build ----------
FROM node:24.22.3-alpine AS build
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# rewrites ของ Next.js ถูกบันทึกตอน build จึงต้องรู้ที่อยู่ backend ตั้งแต่ขั้นนี้
ARG BACKEND_URL=http://backend:4000
ENV BACKEND_URL=$BACKEND_URL
# standalone = รวมเฉพาะไฟล์ที่จำเป็นต่อการรัน
ENV NEXT_OUTPUT=standalone
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- ขั้นที่ 2: รัน ----------
FROM node:24.22.3-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# รับการเชื่อมต่อจากนอก container
ENV HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

# ไม่รันด้วย root
USER node
EXPOSE 3000
CMD ["node", "server.js"]
