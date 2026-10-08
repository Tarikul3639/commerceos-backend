# Use Node.js 24 on Alpine Linux as the base image
FROM node:24-alpine

# Set the working directory inside the container
WORKDIR /app

# Enable Corepack and activate the project's pnpm version
RUN corepack enable && corepack prepare pnpm@12.6.0 --activate

# Copy dependency manifests first to take advantage of Docker layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies exactly according to the lockfile
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Generate Prisma client code based on the schema
RUN pnpm prisma generate

# Start the NestJS application in development/watch mode
CMD ["pnpm", "run", "start:dev"]