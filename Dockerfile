FROM node:14.8.0-buster-slim

ARG APT_FLAGS="-y --no-install-recommends"
ARG WORKDRIR="/app"

ENV LIB_PACKAGES \
    libglib2.0-0 \
    libnss3 \
    libxrandr2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libcups2 \
    libexpat1 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxss1 \
    libgtk-3-0

RUN mkdir ${WORKDRIR}
COPY index.js ${WORKDRIR}
COPY package-lock.json ${WORKDRIR}
WORKDIR ${WORKDRIR}


RUN set -eux \
    && apt-get update --fix-missing \
	&& apt-get dist-upgrade -y \
    && apt-get ${APT_FLAGS} install ${LIB_PACKAGES} \
	&& apt-get clean -y \
	&& apt-get autoclean -y \
	&& apt-get autoremove -y \
    # https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#run
    && rm -rf /var/lib/apt/lists/* \
    && npm install

CMD node index.js