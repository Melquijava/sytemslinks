# ---- Estágio 1: Build (Apenas para garantir um ambiente limpo, opcional mas bom) ----
# Usamos uma imagem base simples para copiar os arquivos.
FROM busybox:latest as builder

# Define o diretório de trabalho dentro deste estágio temporário.
WORKDIR /app

# Copia todos os arquivos do seu projeto para o diretório de trabalho.
COPY . .


# ---- Estágio 2: Final (O que será enviado para o Railway) ----
# Usamos a imagem oficial e leve do Nginx baseada em Alpine Linux.
FROM nginx:stable-alpine

# Remove o arquivo de configuração padrão do Nginx.
RUN rm /etc/nginx/conf.d/default.conf

# Copia o nosso arquivo de configuração personalizado do NGINX.
COPY nginx.conf /etc/nginx/conf.d/

# ---- A PARTE MAIS IMPORTANTE ----
# Copia os arquivos do site do estágio 'builder' para o diretório final do Nginx.
# Seja explícito sobre o que está sendo copiado para evitar problemas.
COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/style.css /usr/share/nginx/html/
COPY --from=builder /app/script.js /usr/share/nginx/html/
COPY --from=builder /app/img/ /usr/share/nginx/html/img/

# Expõe a porta 80 para que o Railway possa se conectar.
EXPOSE 80

# Comando para iniciar o servidor Nginx em modo 'foreground'.
CMD ["nginx", "-g", "daemon off;"]