FROM node:20

# Install Git, SSH e pnpm
RUN apt-get update && apt-get install -y git openssh-client curl \
    && npm install -g pnpm

# Create work directory
WORKDIR /app

# Copy project files
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

# Install dependencies
RUN pnpm install
# RUN pnpm add -g tsx nodemon

# Expose 3000 port
EXPOSE 3000

# Init app
CMD ["pnpm", "start"]
