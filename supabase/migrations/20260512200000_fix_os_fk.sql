ALTER TABLE service_orders DROP CONSTRAINT service_orders_sale_id_fkey;
ALTER TABLE service_orders ADD CONSTRAINT service_orders_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL;
