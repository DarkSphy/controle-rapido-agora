-- Migration to add labor_value to quotes and reason to movements

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS labor_value DECIMAL(10,2) DEFAULT 0;

ALTER TABLE movements ADD COLUMN IF NOT EXISTS reason VARCHAR(255);
