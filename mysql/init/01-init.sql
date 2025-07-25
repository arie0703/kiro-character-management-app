-- Character Management Database Initialization Script

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS character_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE character_management;

-- Grant privileges to app user
GRANT ALL PRIVILEGES ON character_management.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- Create tables will be handled by GORM auto-migration
-- This script just ensures the database and user permissions are set up correctly