#!/bin/bash
set -e

# 1. Handle MPM Conflicts (The "More than one MPM loaded" fix)
echo "Configuring Apache MPM..."
rm -f /etc/apache2/mods-enabled/mpm_event.load
rm -f /etc/apache2/mods-enabled/mpm_event.conf
rm -f /etc/apache2/mods-enabled/mpm_worker.load
rm -f /etc/apache2/mods-enabled/mpm_worker.conf

# Ensure prefork is enabled
if [ ! -f /etc/apache2/mods-enabled/mpm_prefork.load ]; then
    ln -s /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load
    ln -s /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf
fi

# 2. Configure Port (The "timeout" fix)
# Railway provides $PORT, but Apache defaults to 80.
PORT="${PORT:-80}"
echo "Configuring Apache to listen on port $PORT..."
sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
sed -i "s/:80/:$PORT/g" /etc/apache2/sites-available/*.conf

# 3. Start Apache
echo "Starting Apache..."
exec "$@"
