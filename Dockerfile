FROM node:20.10.0

WORKDIR /app

COPY package.json ./
COPY tsconfig*.json ./
COPY ormconfig.js ./
COPY typeorm-cli.ts ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "start:migrate"]
