# image ของ backend (Express)
# build จากโฟลเดอร์หลักของโปรเจกต์ เพราะ db-init ต้องใช้ไฟล์ db/schema.sql
FROM node:24.22.3-alpine

ENV NODE_ENV=production
WORKDIR /app/backend

# คัดลอกรายการแพ็กเกจก่อน ถ้าแพ็กเกจไม่เปลี่ยน Docker จะใช้ผลเดิม (cache) ไม่ต้องติดตั้งใหม่
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# คัดลอกโค้ด และ schema (db-init.js อ้างถึง ../../db/schema.sql)
COPY backend/src ./src
COPY backend/scripts ./scripts
COPY db /app/db

# โฟลเดอร์รูป: ให้ผู้ใช้ node เขียนได้ (compose จะ mount volume ทับที่นี่)
RUN mkdir -p /data/uploads && chown node:node /data/uploads

# ไม่รันด้วย root
USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
