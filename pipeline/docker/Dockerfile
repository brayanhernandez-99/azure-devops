# Download image from ECR
FROM --platform=linux/amd64 861262569826.dkr.ecr.us-east-1.amazonaws.com/node-alpine:latest

# Workspace application
WORKDIR /usr/src/app

# Arguments
ARG PORT=8080

# Copy files npm to docker
COPY package.json .
COPY .npmrc /root/.

# Install package microservice
RUN npm i

# Copy project in docker
COPY . .

# Uninstall minimal packages for docker image
RUN rm -rf .npmrc && \
    rm -f THIRD-PARTY-LICENSES.txt \
    rm -f LICENSE

ENV OPENSSL_CONF=/etc/ssl/

# Start the application
EXPOSE ${PORT}
ENTRYPOINT [ "npm", "run", "execute" ]