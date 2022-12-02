FROM node:19.2-bullseye

ARG APT_FLAGS="-y --no-install-recommends"
ARG WORKDRIR="/app"

ENV LIB_PACKAGES \
    # https://github.com/puppeteer/puppeteer/blob/3cdd5d82925e0a913a0827193a3d7f96930fa3d2/docker/Dockerfile#L11
    google-chrome-stable \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-khmeros \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1

RUN mkdir ${WORKDRIR}
COPY index.js ${WORKDRIR}
COPY package.json ${WORKDRIR}
COPY package-lock.json ${WORKDRIR}
WORKDIR ${WORKDRIR}


RUN set -eux \
    && apt-get update --fix-missing \
	&& apt-get dist-upgrade -y \
    # https://github.com/puppeteer/puppeteer/blob/3cdd5d82925e0a913a0827193a3d7f96930fa3d2/docker/Dockerfile#L7
    && apt-get ${APT_FLAGS} install wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update --fix-missing \
    && apt-get ${APT_FLAGS} install ${LIB_PACKAGES} \
    && npm install -g npm \
	&& apt-get clean -y \
	&& apt-get autoclean -y \
	&& apt-get autoremove -y \
    # https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#run
    && rm -rf /var/lib/apt/lists/* \
    && npm ci

CMD node index.js