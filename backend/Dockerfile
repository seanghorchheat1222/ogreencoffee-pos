FROM php:8.4-cli

WORKDIR /var/www

RUN apt-get update \
    && apt-get install -y libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && rm composer-setup.php

RUN composer install --no-dev --optimize-autoloader

RUN php artisan config:clear

EXPOSE 10000

CMD php artisan migrate --force && php artisan storage:link && php artisan serve --host=0.0.0.0 --port=$PORT