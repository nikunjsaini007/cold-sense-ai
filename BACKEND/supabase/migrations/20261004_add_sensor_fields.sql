-- Additive migration for the realistic telemetry simulator.
-- Existing telemetry rows remain unchanged.
alter table if exists public.telemetry
  add column if not exists indoor_temperature double precision,
  add column if not exists outdoor_temperature double precision,
  add column if not exists door_open boolean,
  add column if not exists door_open_seconds integer,
  add column if not exists battery_level double precision;
