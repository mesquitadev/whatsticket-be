# Use a imagem oficial do Node.js Alpine como base
FROM node:22-alpine AS build

# Crie um diretório de trabalho
WORKDIR /app

# Copie o arquivo package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante do código da aplicação para o diretório de trabalho
COPY . .

# Compile o código TypeScript
RUN npm run build

# Use a imagem oficial do Node.js Alpine como base para a imagem final
FROM node:22-alpine

# Crie um diretório de trabalho
WORKDIR /app

# Crie um usuário não-root e mude para esse usuário
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copie os arquivos compilados do estágio de build
COPY --from=build /app /app

# Exponha a porta que a aplicação irá rodar
EXPOSE 8080

# Defina a variável de ambiente NODE_ENV como produção
ENV NODE_ENV=production

# Adicione uma instrução de healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Comando para iniciar a aplicação
CMD ["node", "dist/main.js"]