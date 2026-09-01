FROM php:8.3-cli-alpine

# Install system dependencies, PHP extensions, and Python 3 runtime
RUN apk add --no-cache \
    sqlite-dev \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    python3 \
    py3-pip \
    && docker-php-ext-install pdo pdo_sqlite pdo_pgsql pdo_mysql bcmath mbstring zip pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy application code (including backend/ai_engine)
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Prepare SQLite database if configured
RUN touch database/database.sqlite && chmod 777 database/database.sqlite
RUN chmod -R 777 storage bootstrap/cache

EXPOSE 8000

CMD ["sh", "-c", "php -r \"file_exists('.env') || copy('.env.example', '.env');\" && php artisan key:generate --force && php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=8000"]
