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

# Install vendor if missing (happens when volume mount overwrites build)
if [ ! -f /var/www/vendor/autoload.php ]; then
    echo "vendor/ not found, running composer install..."
    run_command "composer install --optimize-autoloader --no-dev"
fi

run_command "php artisan package:discover --ansi"

# # Only generate a key if one isn't already set — generating on every
# # boot would invalidate existing sessions and encrypted data.
# if [ -z "$APP_KEY" ]; then
#     echo "APP_KEY not set, generating one..."
# else
#     echo "APP_KEY already set, skipping key:generate"
# fi
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
