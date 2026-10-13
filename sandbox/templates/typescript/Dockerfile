FROM node:22-bookworm-slim

WORKDIR /opt/kairo
COPY templates/typescript/package.json ./package.json
RUN npm install --ignore-scripts --no-audit --no-fund --omit=optional \
    && npm cache clean --force \
    && mkdir -p /opt/kairo

COPY runner/typescript_runner.mjs /opt/kairo/typescript_runner.mjs
WORKDIR /workspace
USER node
ENTRYPOINT ["node", "/opt/kairo/typescript_runner.mjs"]
CMD ["run", "src/index.ts"]
