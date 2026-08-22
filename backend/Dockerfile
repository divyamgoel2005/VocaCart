FROM python:3.11-slim

WORKDIR /app

# Install system audio libraries and build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY data /data
COPY scripts /app/scripts
COPY backend /app

# Ensure dataset script runs if data missing
RUN python /app/scripts/download_dataset.py && python /app/scripts/generate_synthetic_orders.py

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
