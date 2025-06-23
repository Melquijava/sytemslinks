# ---- Estágio 1: Servidor Web ----
# Usamos a imagem oficial e leve do Nginx baseada em Alpine Linux.
# 'stable' garante uma versão estável e 'alpine' um tamanho de imagem minúsculo.
FROM nginx:stable-alpine

# Remove o arquivo de configuração padrão do Nginx.
RUN rm /etc/nginx/conf.d/default.conf

# Copia o nosso arquivo de configuração personalizado para dentro da imagem.
# Veremos este arquivo na seção extra abaixo.
COPY nginx.conf /etc/nginx/conf.d/

# Copia todos os arquivos do seu site (html, css, js, pasta img)
# para o diretório padrão que o Nginx usa para servir sites.
COPY . /usr/share/nginx/html

# Informa ao Docker que o contêiner irá escutar na porta 80.
# O Railway detectará essa porta automaticamente e direcionará o tráfego para ela.
EXPOSE 80

# O comando para iniciar o servidor Nginx quando o contêiner for executado.
# A imagem base já inclui isso, mas é uma boa prática ser explícito.
CMD ["nginx", "-g", "daemon off;"]