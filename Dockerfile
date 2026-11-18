FROM node:24-alpine
WORKDIR /app
COPY package.json ./
COPY index.html ./
COPY Admin ./Admin
COPY User ./User
COPY shared ./shared
COPY scripts ./scripts
COPY database ./database
ENV NODE_ENV=production
ENV PORT=4173
ENV HOST=0.0.0.0
EXPOSE 4173
CMD ["node", "scripts/serve.cjs"]
