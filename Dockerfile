FROM node:20.10.0

# Tạo thư mục app
WORKDIR /app

# Copy package.json và lock file trước để cache install
COPY package*.json ./

# Cài dependencies
RUN npm install --production

# Copy toàn bộ code
COPY . .

# Build NestJS (nếu code của mày là TS)
RUN npm run build

# Render sẽ gán PORT, app phải listen process.env.PORT
EXPOSE 8000

# Chạy app ở mode production
CMD ["npm", "run", "start:prod"]
