-- Sample data generation for ERP Dashboard

-- Insert sample users
INSERT INTO Users (username, role) VALUES
('admin_user', 'admin'),
('exec_viewer', 'executive'),
('ops_manager', 'operations');

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
