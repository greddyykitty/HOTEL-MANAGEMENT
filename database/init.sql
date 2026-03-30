-- ═══════════════════════════════════════════════════════════════════════════
--  Hotel Booking System — Database Initialization Script
--  Run this script ONCE before starting the application.
--  Hibernate (ddl-auto=update) auto-creates tables; this seeds initial data.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS hackathon_db;
USE hackathon_db;

-- ─── Admin User Seed ─────────────────────────────────────────────────────────
-- Password for admin: Admin@1234  (BCrypt encoded)
INSERT IGNORE INTO users (name, email, username, password, role, created_at, updated_at)
VALUES (
  'System Admin',
  'admin@hotel.com',
  'admin@hotel.com',
  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTTySpAYpYS',
  'ADMIN',
  NOW(), NOW()
);

-- ─── Sample Hotels ────────────────────────────────────────────────────────────
INSERT IGNORE INTO hotels (name, location, description, rating, image_url, amenities, created_at, updated_at)
VALUES
  (
    'The Grand Palace',
    'Mumbai, India',
    'A luxurious 5-star hotel in the heart of Mumbai with stunning sea views and world-class amenities.',
    4.8,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'WiFi,Pool,Spa,Gym,Restaurant,Bar,Room Service,Parking',
    NOW(), NOW()
  ),
  (
    'Serene Hills Resort',
    'Shimla, India',
    'A peaceful mountain retreat with panoramic Himalayan views, perfect for a relaxing getaway.',
    4.5,
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    'WiFi,Mountain View,Restaurant,Bonfire,Trekking,Parking',
    NOW(), NOW()
  ),
  (
    'Blue Lagoon Beach Hotel',
    'Goa, India',
    'Steps from the beach, this vibrant hotel offers the ultimate coastal experience with water sports.',
    4.3,
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    'WiFi,Beach Access,Pool,Restaurant,Bar,Water Sports,Parking',
    NOW(), NOW()
  );

-- ─── Sample Rooms ─────────────────────────────────────────────────────────────
-- Grand Palace Rooms
INSERT IGNORE INTO rooms (hotel_id, room_type, price, capacity, available_rooms, description, image_url)
SELECT h.id, 'Standard', 3500.00, 2, 5,
  'Comfortable standard room with city view and modern amenities.',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
FROM hotels h WHERE h.name = 'The Grand Palace';

INSERT IGNORE INTO rooms (hotel_id, room_type, price, capacity, available_rooms, description, image_url)
SELECT h.id, 'Deluxe Sea View', 6500.00, 2, 3,
  'Spacious deluxe room with a private balcony overlooking the Arabian Sea.',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'
FROM hotels h WHERE h.name = 'The Grand Palace';

INSERT IGNORE INTO rooms (hotel_id, room_type, price, capacity, available_rooms, description, image_url)
SELECT h.id, 'Presidential Suite', 18000.00, 4, 1,
  'The ultimate luxury — a sprawling suite with butler service and panoramic views.',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
FROM hotels h WHERE h.name = 'The Grand Palace';

-- Serene Hills Rooms
INSERT IGNORE INTO rooms (hotel_id, room_type, price, capacity, available_rooms, description, image_url)
SELECT h.id, 'Cozy Cottage', 2800.00, 2, 4,
  'A warm wooden cottage with fireplace and mountain view.',
  'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=800'
FROM hotels h WHERE h.name = 'Serene Hills Resort';

INSERT IGNORE INTO rooms (hotel_id, room_type, price, capacity, available_rooms, description, image_url)
SELECT h.id, 'Family Suite', 5200.00, 4, 2,
  'Spacious family suite with two bedrooms and a living area.',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800'
FROM hotels h WHERE h.name = 'Serene Hills Resort';

-- Blue Lagoon Rooms
INSERT IGNORE INTO rooms (hotel_id, room_type, price, capacity, available_rooms, description, image_url)
SELECT h.id, 'Beach View Room', 4200.00, 2, 6,
  'Wake up to the sound of waves with a direct beach view.',
  'https://images.unsplash.com/photo-1570213489059-0aac6626cade?w=800'
FROM hotels h WHERE h.name = 'Blue Lagoon Beach Hotel';

INSERT IGNORE INTO rooms (hotel_id, room_type, price, capacity, available_rooms, description, image_url)
SELECT h.id, 'Pool Villa', 9500.00, 2, 2,
  'Private villa with a plunge pool, steps from the main beach.',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'
FROM hotels h WHERE h.name = 'Blue Lagoon Beach Hotel';
