-- ERP Dashboard Database Schema

-- Core table for freight delivery statistics
CREATE TABLE FreightDeliveryStats (
    DeliveryID SERIAL PRIMARY KEY,
    TruckID INTEGER NOT NULL,
    TruckName TEXT NOT NULL CHECK(TruckName IN ('Thunderbolt', 'RoadRunner', 'BigHauler', 'MilesMaster')),
    OriginState TEXT NOT NULL CHECK(OriginState IN ('Texas', 'California', 'Florida', 'New York', 'Illinois')),
    DestinationState TEXT NOT NULL CHECK(DestinationState IN ('Texas', 'California', 'Florida', 'New York', 'Illinois')),
    DeliveryDate DATE NOT NULL,
    DeliveryType TEXT NOT NULL CHECK(DeliveryType IN ('Expedited', 'Standard')),
    FreightWeightTons REAL NOT NULL,
    IsOnTime BOOLEAN NOT NULL,
    DelayDays INTEGER,
    Revenue REAL NOT NULL,
    CHECK(OriginState != DestinationState),
    CHECK((IsOnTime = true AND DelayDays IS NULL) OR (IsOnTime = false AND DelayDays > 0))
);

-- Performance optimization indexes
CREATE INDEX idx_delivery_date ON FreightDeliveryStats(DeliveryDate);
CREATE INDEX idx_route_origin_dest ON FreightDeliveryStats(OriginState, DestinationState);
CREATE INDEX idx_truck_performance ON FreightDeliveryStats(TruckID, IsOnTime);

-- Audit logging for GDPR compliance
CREATE TABLE AuditLog (
    log_id SERIAL PRIMARY KEY,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255),
    action_type VARCHAR(50),
    affected_table VARCHAR(255),
    record_id INTEGER,
    change_description TEXT
);

-- User management for role-based access
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) CHECK(role IN ('admin', 'executive', 'operations')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- A/B testing tracking
CREATE TABLE UIVariants (
    variant_id SERIAL PRIMARY KEY,
    component_name VARCHAR(255),
    variant_type CHAR(1) CHECK(variant_type IN ('A', 'B')),
    metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Redis cache configuration
CREATE TABLE CacheConfig (
    key_pattern VARCHAR(255) PRIMARY KEY,
    ttl_seconds INTEGER NOT NULL,
    invalidation_rules JSONB
);

-- Comments for maintainability
COMMENT ON TABLE FreightDeliveryStats IS 'Core table storing all freight delivery information';
COMMENT ON TABLE AuditLog IS 'GDPR compliance tracking for data access and modifications';
COMMENT ON TABLE Users IS 'User management for role-based dashboard access';
COMMENT ON TABLE UIVariants IS 'A/B testing configuration and metrics tracking';
COMMENT ON TABLE CacheConfig IS 'Redis cache configuration for performance optimization';
