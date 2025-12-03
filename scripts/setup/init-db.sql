-- Initialize Visucan Database
-- This script creates the initial database structure

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS visucan;

-- Use the database
\c visucan;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (managed by Drizzle ORM migrations)
-- This file is for reference and manual setup only

-- Users table
-- Already defined in schema.ts

-- Create initial admin user (for development)
-- Password: admin123 (change in production)
-- INSERT INTO users (email, name, role) VALUES
--   ('admin@visucan.io', 'Admin User', 'admin');

-- Create sample devices
-- INSERT INTO devices (device_type, slot_number, rack_id, status) VALUES
--   ('raspberry_pi_4', 1, 'rack-001', 'available'),
--   ('raspberry_pi_4', 2, 'rack-001', 'available'),
--   ('arduino_uno', 3, 'rack-001', 'available'),
--   ('arduino_uno', 4, 'rack-001', 'available'),
--   ('stm32_nucleo_f401re', 5, 'rack-001', 'available'),
--   ('stm32_nucleo_f401re', 6, 'rack-001', 'available'),
--   ('intel_fpga_de10_lite', 7, 'rack-001', 'available');

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE visucan TO visucan;
