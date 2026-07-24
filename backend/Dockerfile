FROM php:8.2-fpm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    unzip \
    zip \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
    && rm -rf /var/lib/apt/lists/*

ENV COMPOSER_ALLOW_SUPERUSER=1

# Install Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --no-scripts

COPY . .

# RUN php artisan package:discover --ansi


RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod +x ./scripts/docker_entry.sh

EXPOSE 9000

ENTRYPOINT ["./scripts/docker_entry.sh"]
CMD ["php-fpm"]
