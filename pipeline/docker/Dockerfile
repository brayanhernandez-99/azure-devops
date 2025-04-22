# Download image from ECR
FROM --platform=linux/amd64 861262569826.dkr.ecr.us-east-1.amazonaws.com/node-alpine:latest

# Install qpdf
RUN apk add --no-cache --no-check-certificate libjpeg libstdc++ fontconfig imagemagick libmagic file
RUN wget https://github.com/gmitirol/qpdf-alpine/releases/latest/download/qpdf-bin-amd64.tgz
RUN tar xzf qpdf-bin-amd64.tgz -C /

# Install PhantomJs
RUN cd /tmp && curl -Ls https://github.com/Nuxify/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz | tar xz &&\
  cp -R lib lib64 / &&\
  cp -R usr/lib/x86_64-linux-gnu /usr/lib &&\
  cp -R usr/share/fonts /usr/share &&\
  cp -R etc/fonts /etc &&\
  curl -k -Ls https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 | tar -jxf - &&\
  cp phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs &&\
  rm -rf /tmp/*

# Copy xray to docker
RUN cp xray /usr/bin/xray

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
ENTRYPOINT [ "npm", "run", "executeWithXRay" ]
