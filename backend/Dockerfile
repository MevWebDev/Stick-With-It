# Używamy oficjalnego obrazu Python
FROM python:3.11-slim

# Ustawiamy zmienne środowiskowe
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Ustawiamy katalog roboczy
WORKDIR /app

# Kopiujemy requirements.txt i instalujemy zależności
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiujemy całą aplikację
COPY . .

# Tworzymy katalog dla bazy danych SQLite (jeśli używasz SQLite)
RUN mkdir -p /app/data

# Eksponujemy port 8000
EXPOSE 8000

# Uruchamiamy migracje i serwer
CMD ["sh","-c","python manage.py migrate && exec python manage.py runserver 0.0.0.0:8000"]
