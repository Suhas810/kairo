FROM docker:27.5.1-cli AS docker_cli

FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /opt/kairo

COPY --from=docker_cli /usr/local/bin/docker /usr/local/bin/docker
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --requirement requirements.txt \
    && useradd --uid 10001 --create-home --shell /usr/sbin/nologin kairo

COPY --chown=kairo:kairo runner ./runner

USER 10001:10001
ENTRYPOINT ["python", "-m", "runner.execute"]
