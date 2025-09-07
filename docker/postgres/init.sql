-- PostgreSQL initialization script for School ERP
-- This script sets up the database with proper permissions

-- Create the school_erp database if it doesn't exist
SELECT 'CREATE DATABASE school_erp'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'school_erp')\gexec

-- Grant privileges to the school_admin user
GRANT ALL PRIVILEGES ON DATABASE school_erp TO school_admin;

-- Connect to the school_erp database
\c school_erp;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO school_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO school_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO school_admin;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO school_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO school_admin;
