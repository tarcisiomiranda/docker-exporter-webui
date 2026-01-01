import { step, run } from "../dsl/src/index";

/**
 * Pipeline Bunker - React.js Build with Bun
 * 
 * Este pipeline:
 * 1. Instala dependências com Bun
 * 2. Faz build do projeto React
 * 3. Gera um Dockerfile otimizado
 * 4. Faz build da imagem Docker
 */

// Step 1: Instalar dependências com Bun
const install = step("install", async (ctx) => {
  console.log("📦 Installing dependencies with Bun...");
  await ctx.exec("bun install");
  console.log("✅ Dependencies installed successfully");
}, {
  image: "oven/bun:1",
  volumes: [
    "./node_modules:/srv/pipeline/bunker/_work/node_modules"
  ]
});

// Step 2: Build do projeto React
const build = step("build", async (ctx) => {
  console.log("🔨 Building React application...");
  await ctx.exec("bun run build");
  console.log("✅ Build completed successfully");
}, {
  image: "oven/bun:1",
  env: {
    NODE_ENV: "production"
  }
});

// Step 3: Gerar Dockerfile otimizado
const generateDockerfile = step("generate-dockerfile", async (ctx) => {
  console.log("📝 Generating optimized Dockerfile...");

  const dockerfile = `
# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Production stage
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA
RUN echo 'server { \\
    listen 80; \\
    location / { \\
        root /usr/share/nginx/html; \\
        index index.html; \\
        try_files \\$uri \\$uri/ /index.html; \\
    } \\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

  await ctx.exec(`cat << 'EOF' > Dockerfile
${dockerfile.trim()}
EOF`);

  console.log("✅ Dockerfile generated");
}, {
  image: "alpine:latest"
});

// Step 4: Build da imagem Docker
const dockerBuild = step("docker-build", async (ctx) => {
  console.log("🐳 Building Docker image...");

  const imageName = process.env.IMAGE_NAME || "my-react-app";
  const imageTag = process.env.IMAGE_TAG || "latest";

  await ctx.exec(`docker build -t ${imageName}:${imageTag} .`);

  console.log(`✅ Docker image built: ${imageName}:${imageTag}`);
}, {
  image: "docker:dind",
  env: {
    DOCKER_HOST: "tcp://docker:2375",
    IMAGE_NAME: "my-react-app",
    IMAGE_TAG: "latest"
  }
});

// Step 5 (opcional): Push para registry
const dockerPush = step("docker-push", async (ctx) => {
  console.log("🚀 Pushing Docker image to registry...");

  const imageName = process.env.IMAGE_NAME || "my-react-app";
  const imageTag = process.env.IMAGE_TAG || "latest";
  const registry = process.env.DOCKER_REGISTRY || "";

  if (registry) {
    await ctx.exec(`docker tag ${imageName}:${imageTag} ${registry}/${imageName}:${imageTag}`);
    await ctx.exec(`docker push ${registry}/${imageName}:${imageTag}`);
    console.log(`✅ Image pushed to ${registry}/${imageName}:${imageTag}`);
  } else {
    console.log("⚠️ DOCKER_REGISTRY not set, skipping push");
  }
}, {
  image: "docker:dind",
  env: {
    DOCKER_HOST: "tcp://docker:2375"
  }
});

// Executar pipeline: install -> build -> generate-dockerfile -> docker-build
// Para incluir push: adicione .then(dockerPush) no final
run(
  install
    .then(build)
    .then(generateDockerfile)
    .then(dockerBuild)
);
