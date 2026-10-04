-- Adds a category for each shipment without changing existing shipment data.
alter table public.shipments
    add column if not exists product_type text;

update public.shipments
set product_type = 'OTHER'
where product_type is null;

alter table public.shipments
    alter column product_type set default 'OTHER',
    alter column product_type set not null;
