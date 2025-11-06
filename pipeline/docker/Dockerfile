# Download image from ECR
FROM --platform=linux/amd64 861262569826.dkr.ecr.us-east-1.amazonaws.com/node-alpine:latest

# Workspace application
WORKDIR /usr/src/app

# Arguments
ARG PORT=8080
ARG PORT_XRAY=2000

# Copy files npm to docker
COPY package.json .
COPY .npmrc /root/.

# Environment variables
ENV AWS_XRAY_LOG_LEVEL=silent

# Install package microservice
RUN npm i

# Copy project in docker
COPY . .

# Uninstall minimal packages for docker image
RUN rm -rf .npmrc && \
    rm -f THIRD-PARTY-LICENSES.txt \
    rm -f LICENSE

# Load xray in docker
EXPOSE ${PORT_XRAY}/udp
EXPOSE ${PORT_XRAY}/tcp
ENV OPENSSL_CONF=/etc/ssl/

# Start the application
EXPOSE ${PORT}
ENTRYPOINT [ "npm", "run", "executeWithXRay", "-t", "0.0.0.0:2000", "-b", "0.0.0.0:2000" ]