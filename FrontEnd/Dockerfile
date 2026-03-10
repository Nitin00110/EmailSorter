# 1. THE FOUNDATION: We need Node.js to run a React/Vite app
FROM node:22-alpine

# 2. THE WORKSPACE: Create a folder for the frontend inside the container
WORKDIR /app

# 3. INSTALL DEPENDENCIES FIRST: We copy only the package files first.
# This is a Docker pro-tip! It caches your node_modules so building is much faster.
COPY package*.json ./
RUN npm install

# 4. COPY THE REST OF THE CODE
COPY . .

# 5. OPEN THE PORT: Vite's default port is 5173
EXPOSE 5173

# 6. START VITE: The "--host" part is CRUCIAL!
# Without it, Vite only listens inside its own container and your browser won't see it.
CMD ["npm", "run", "dev", "--", "--host"]