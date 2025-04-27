-- Sample data generation for ERP Dashboard

-- Insert sample users with placeholder password hashes
-- Replace '$2b$10$...' with actual bcrypt hashes during seeding or registration
-- Example password for all: 'password123'
INSERT INTO Users (username, password_hash, role) VALUES
('admin_user', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGH.IJKLMNOPQRSTUVWXYZabcdef', 'admin'),
('exec_viewer', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGH.IJKLMNOPQRSTUVWXYZabcdef', 'executive'),
('ops_manager', '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGH.IJKLMNOPQRSTUVWXYZabcdef', 'operations');

-- Generate freight delivery data
DO $$
DECLARE
    truck_names TEXT[] := ARRAY['Thunderbolt', 'RoadRunner', 'BigHauler', 'MilesMaster'];
    states TEXT[] := ARRAY['Texas', 'California', 'Florida', 'New York', 'Illinois'];
    delivery_types TEXT[] := ARRAY['Expedited', 'Standard'];
    current_date DATE := '2024-01-01'::DATE;
    end_date DATE := '2024-12-31'::DATE;
    temp_date DATE;
    truck_id INTEGER;
    truck_name TEXT;
    origin_state TEXT;
    destination_state TEXT;
    delivery_type TEXT;
    freight_weight REAL;
    is_on_time BOOLEAN;
    delay_days INTEGER;
    revenue REAL;
    counter INTEGER := 1;
    daily_deliveries INTEGER;
BEGIN
    -- Loop through each day of the year
    WHILE current_date <= end_date LOOP
        -- 8-12 deliveries per day
        daily_deliveries := floor(random() * 5) + 8;
        
        FOR i IN 1..daily_deliveries LOOP
            -- Assign truck
            truck_id := (counter % 4) + 1;
            truck_name := truck_names[truck_id];
            
            -- Assign states
            origin_state := states[1 + floor(random() * 5)];
            LOOP
                destination_state := states[1 + floor(random() * 5)];
                IF origin_state != destination_state THEN
                    EXIT;
                END IF;
            END LOOP;
            
            -- Delivery type (40% Expedited, 60% Standard)
            delivery_type := CASE WHEN random() < 0.4 THEN 'Expedited' ELSE 'Standard' END;
            
            -- Weight (8-25 tons)
            freight_weight := 8.0 + (random() * 17.0);
            
            -- Delivery status (85% on-time)
            IF random() < 0.85 THEN
                is_on_time := true;
                delay_days := NULL;
            ELSE
                is_on_time := false;
                delay_days := 1 + floor(random() * 3);
            END IF;
            
            -- Revenue calculation
            revenue := freight_weight * 
                      CASE delivery_type 
                          WHEN 'Standard' THEN 300 
                          ELSE 400 
                      END * 
                      (0.9 + random() * 0.2);
            
            INSERT INTO FreightDeliveryStats (
                TruckID, TruckName, OriginState, DestinationState, DeliveryDate, 
                DeliveryType, FreightWeightTons, IsOnTime, DelayDays, Revenue
            ) VALUES (
                truck_id, truck_name, origin_state, destination_state, current_date, 
                delivery_type, ROUND(freight_weight::numeric, 1), is_on_time, delay_days, ROUND(revenue::numeric, 2)
            );
            
            -- Log the insertion in AuditLog
            INSERT INTO AuditLog (user_id, action_type, affected_table, record_id, change_description)
            VALUES ('system', 'INSERT', 'FreightDeliveryStats', currval('freightdeliverystats_deliveryid_seq'), 
                    'Sample data generation - delivery record created');
            
            counter := counter + 1;
        END LOOP;
        
        current_date := current_date + INTERVAL '1 day';
    END LOOP;
END $$;

-- Insert sample A/B test configurations
INSERT INTO UIVariants (component_name, variant_type, metrics) VALUES
('DashboardLayout', 'A', '{"impressions": 0, "engagement_time": 0}'),
('DashboardLayout', 'B', '{"impressions": 0, "engagement_time": 0}');

-- Insert cache configuration
INSERT INTO CacheConfig (key_pattern, ttl_seconds, invalidation_rules) VALUES
('delivery_stats_*', 300, '{"on_update": true, "dependencies": ["FreightDeliveryStats"]}'),
('user_preferences_*', 3600, '{"on_update": true, "dependencies": ["Users"]}');

-- Insert sample Procurement data

-- Suppliers
INSERT INTO Suppliers (name, contact_person, contact_email, phone, address, performance_rating) VALUES
('Global Parts Inc.', 'Alice Smith', 'alice.smith@globalparts.com', '555-1234', '123 Industrial Way, Anytown, USA', 4.5),
('Component Masters', 'Bob Johnson', 'bob.j@componentmasters.net', '555-5678', '456 Tech Park, Somewhere City, USA', 4.8),
('Reliable Materials Co.', 'Charlie Brown', 'charlie.b@reliablematerials.org', '555-9012', '789 Commerce Blvd, Otherville, USA', 4.2),
('Fastener Solutions', 'Diana Prince', 'diana@fasteners.com', '555-3456', '101 Bolt Ave, Metropolis, USA', 4.0);

-- Inventory Items
INSERT INTO InventoryItems (sku, name, description, category, unit_cost, stock_level, reorder_level) VALUES
('WIDGET-001', 'Standard Widget', 'A standard widget for general use', 'Widgets', 10.50, 500, 100),
('GADGET-A', 'Advanced Gadget', 'An advanced gadget with extra features', 'Gadgets', 25.75, 250, 50),
('COMPONENT-X', 'Component X', 'Essential component for assembly', 'Components', 5.20, 1500, 300),
('BOLT-M8', 'M8 Bolt - Steel', 'Standard M8 steel bolt, 20mm length', 'Fasteners', 0.15, 5000, 1000),
('NUT-M8', 'M8 Nut - Steel', 'Standard M8 steel nut', 'Fasteners', 0.08, 6000, 1000),
('PANEL-STD', 'Standard Panel', 'Standard metal panel 1m x 1m', 'Materials', 45.00, 150, 30);

-- Purchase Orders
-- Note: total_amount will be calculated later or by application logic/triggers
INSERT INTO PurchaseOrders (po_number, supplier_id, order_date, expected_delivery_date, status) VALUES
('PO-2024-001', 1, '2024-07-15', '2024-07-25', 'Processing'),
('PO-2024-002', 2, '2024-07-18', '2024-07-28', 'Pending'),
('PO-2024-003', 1, '2024-07-20', '2024-07-30', 'Shipped'),
('PO-2024-004', 3, '2024-07-21', '2024-08-05', 'Pending'),
('PO-2024-005', 4, '2024-06-10', '2024-06-20', 'Delivered');

-- Purchase Order Items
-- PO-2024-001 (Supplier 1)
INSERT INTO PurchaseOrderItems (po_id, item_id, quantity, unit_cost) VALUES
(1, 1, 100, 10.50), -- Standard Widget
(1, 3, 500, 5.20);  -- Component X

-- PO-2024-002 (Supplier 2)
INSERT INTO PurchaseOrderItems (po_id, item_id, quantity, unit_cost) VALUES
(2, 2, 50, 25.75);   -- Advanced Gadget

-- PO-2024-003 (Supplier 1)
INSERT INTO PurchaseOrderItems (po_id, item_id, quantity, unit_cost) VALUES
(3, 1, 200, 10.45); -- Standard Widget (Slightly different cost)

-- PO-2024-004 (Supplier 3)
INSERT INTO PurchaseOrderItems (po_id, item_id, quantity, unit_cost) VALUES
(4, 6, 20, 45.00);   -- Standard Panel

-- PO-2024-005 (Supplier 4)
INSERT INTO PurchaseOrderItems (po_id, item_id, quantity, unit_cost) VALUES
(5, 4, 1000, 0.15), -- M8 Bolt
(5, 5, 1000, 0.08);  -- M8 Nut

-- Update total_amount in PurchaseOrders (Example - might be done by application)
UPDATE PurchaseOrders po
SET total_amount = (SELECT SUM(line_total) FROM PurchaseOrderItems poi WHERE poi.po_id = po.po_id)
WHERE po.po_id IN (1, 2, 3, 4, 5);

-- Log Procurement data insertion
INSERT INTO AuditLog (user_id, action_type, affected_table, change_description)
VALUES ('system', 'INSERT', 'Suppliers', 'Sample data generation - suppliers created'),
       ('system', 'INSERT', 'InventoryItems', 'Sample data generation - inventory items created'),
       ('system', 'INSERT', 'PurchaseOrders', 'Sample data generation - purchase orders created'),
       ('system', 'INSERT', 'PurchaseOrderItems', 'Sample data generation - purchase order items created');

-- Sample Purchase Requisition Data
INSERT INTO PurchaseRequisitions (item_id, supplier_id, quantity, status, requested_by, request_date) VALUES
(1, 1, 200, 'Pending', 1, '2024-07-15'),
(2, 2, 50, 'Approved', 2, '2024-07-18'),
(3, 1, 1000, 'Rejected', 3, '2024-07-20'),
(6, 3, 20, 'Pending', 1, '2024-07-21'),
(4, 4, 500, 'Approved', 2, '2024-06-10');
