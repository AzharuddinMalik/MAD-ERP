#!/bin/bash
# Backup automation script for MAD-ERP
BACKUP_DIR="d:\Spring-Boot Vipul Tyagi\journalApp\mad-erp-backups"
DATE=$(date +%Y%m%d_%H%M)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

DB_HOST="localhost"
DB_USER="root"
DB_PASS="root"

echo "Creating backup..."
# Attempt mysqldump if mysql installed locally
# NOTE: This uses local dev DB credentials. Render backup operates via dashboard native feature normally.
if command -v mysqldump &> /dev/null; then
  mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS mad_erp | gzip > "$BACKUP_DIR/mad_erp_$DATE.sql.gz"
  
  if [ ! -s "$BACKUP_DIR/mad_erp_$DATE.sql.gz" ]; then
    echo "ERROR: Backup file is empty"
    exit 1
  fi
  
  echo "Backup created successfully: $BACKUP_DIR/mad_erp_$DATE.sql.gz"
else
  echo "mysqldump not found locally. Skipping local backup database dump simulation."
fi
