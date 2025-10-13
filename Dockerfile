FROM node:22-alpine AS node_builder

WORKDIR /app

RUN npm install -g pnpm

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm install --no-frozen-lockfile

RUN pnpm run build

FROM nginx:1.29.2-alpine-slim

COPY --from=node_builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
