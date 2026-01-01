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
  run: "bun install",
  workingDir: "bunker_cicd_web",
});

// Step 2: Build do projeto React
const build = step("build", async (ctx) => {
  console.log("🔨 Building React application...");
  await ctx.exec("bun run build");
  console.log("✅ Build completed successfully");
}, {
  image: "oven/bun:1",
  run: "bun run build",
  workingDir: "bunker_cicd_web",
  env: {
    NODE_ENV: "production"
  }
});

// Step 3: Gerar Dockerfile otimizado
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

const generateDockerfile = step("generate-dockerfile", async (ctx) => {
  console.log("📝 Generating optimized Dockerfile...");

  await ctx.exec(`cat << 'EOF' > Dockerfile
${dockerfile.trim()}
EOF`);

  console.log("✅ Dockerfile generated");
}, {
  image: "alpine:latest",
  run: `cat << 'EOF' > Dockerfile
${dockerfile.trim()}
EOF`,
});

// Step 4: Build da imagem Docker
const dockerBuild = step("docker-build", async (ctx) => {
  console.log("🐳 Building Docker image...");

  await ctx.exec("docker build -t my-react-app:latest .");

  console.log("✅ Docker image built: my-react-app:latest");
}, {
  image: "docker:dind",
  run: "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .",
  env: {
    DOCKER_HOST: "tcp://docker:2375",
    IMAGE_NAME: "my-react-app",
    IMAGE_TAG: "latest"
  }
});

// Step 5 (opcional): Push para registry
const dockerPush = step("docker-push", async (ctx) => {
  console.log("🚀 Pushing Docker image to registry...");

  console.log("⚠️ Not implemented in this example");
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
