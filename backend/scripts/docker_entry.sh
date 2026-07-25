#!/bin/sh

run_command() {
    command="$1"
    echo "Running: $command"
    eval "$command"
    if [ $? -ne 0 ]; then
        echo "Error executing command: $command"
        exit 1
    fi
}

if [ ! -f /var/www/.env ] && [ -f /var/www/.env.example ]; then
    cp /var/www/.env.example /var/www/.env
fi

run_command "php artisan package:discover --ansi"

# APP_KEY should be set as a permanent environment variable
# (Portainer stack env, GitHub secrets, etc). Only generate one
# here if it's genuinely missing — regenerating on every boot
# would invalidate all existing sessions and encrypted data.
if [ -z "$APP_KEY" ]; then
    echo "APP_KEY not set, generating one..."
    run_command "php artisan key:generate --no-interaction"
else
    echo "APP_KEY already set, skipping key:generate"
fi

run_command "php artisan key:generate --no-interaction"
run_command "php artisan storage:link --no-interaction"
run_command "php artisan migrate --force"
run_command "php artisan config:cache"
run_command "php artisan route:cache"

# If the first arg is "scheduler", run the Laravel scheduler loop instead of php-fpm
if [ "$1" = "scheduler" ]; then
    echo "Starting Laravel scheduler..."
    exec php artisan schedule:work
fi

echo "Starting application server..."
exec "$@"
