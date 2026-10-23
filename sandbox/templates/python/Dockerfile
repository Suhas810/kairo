FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /workspace
COPY templates/python/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --disable-pip-version-check \
    --requirement /tmp/requirements.txt \
    && useradd --uid 10001 --create-home --shell /usr/sbin/nologin sandbox \
    && rm /tmp/requirements.txt

USER 10001:10001
CMD ["python", "--version"]
