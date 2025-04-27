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
    password_hash VARCHAR(255) NOT NULL, -- Store hashed password
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

-- Procurement Module Tables

-- Suppliers Table
CREATE TABLE Suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    performance_rating DECIMAL(3, 2) CHECK (performance_rating >= 0 AND performance_rating <= 5), -- e.g., 4.50
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE Suppliers IS 'Stores information about suppliers';

-- Inventory Items Table
CREATE TABLE InventoryItems (
    item_id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL, -- Stock Keeping Unit
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_cost DECIMAL(10, 2),
    stock_level INTEGER NOT NULL DEFAULT 0 CHECK (stock_level >= 0),
    reorder_level INTEGER DEFAULT 0 CHECK (reorder_level >= 0),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE InventoryItems IS 'Stores details about individual inventory items';
CREATE INDEX idx_inventory_sku ON InventoryItems(sku);
CREATE INDEX idx_inventory_category ON InventoryItems(category);

-- Purchase Orders Table
CREATE TABLE PurchaseOrders (
    po_id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., PO-2025-001
    supplier_id INTEGER NOT NULL REFERENCES Suppliers(supplier_id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    status VARCHAR(50) NOT NULL CHECK(status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    total_amount DECIMAL(12, 2), -- Calculated or updated via trigger/application logic
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE PurchaseOrders IS 'Header information for purchase orders';
CREATE INDEX idx_po_supplier ON PurchaseOrders(supplier_id);
CREATE INDEX idx_po_status ON PurchaseOrders(status);
CREATE INDEX idx_po_order_date ON PurchaseOrders(order_date);

-- Purchase Order Items Table (Junction Table)
CREATE TABLE PurchaseOrderItems (
    po_item_id SERIAL PRIMARY KEY,
    po_id INTEGER NOT NULL REFERENCES PurchaseOrders(po_id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES InventoryItems(item_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_cost DECIMAL(10, 2) NOT NULL, -- Cost at the time of order
    line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    UNIQUE (po_id, item_id) -- Ensure an item appears only once per PO
);
COMMENT ON TABLE PurchaseOrderItems IS 'Links purchase orders to inventory items and specifies quantities/costs';
CREATE INDEX idx_po_items_po ON PurchaseOrderItems(po_id);
CREATE INDEX idx_po_items_item ON PurchaseOrderItems(item_id);

-- Purchase Requisitions Table
CREATE TABLE PurchaseRequisitions (
    pr_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES InventoryItems(item_id),
    supplier_id INTEGER NOT NULL REFERENCES Suppliers(supplier_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(50) NOT NULL CHECK(status IN ('Pending', 'Approved', 'Rejected')),
    requested_by INTEGER NOT NULL REFERENCES Users(user_id),
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    approval_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE PurchaseRequisitions IS 'Stores information about purchase requisitions';
CREATE INDEX idx_pr_item ON PurchaseRequisitions(item_id);
CREATE INDEX idx_pr_supplier ON PurchaseRequisitions(supplier_id);
CREATE INDEX idx_pr_status ON PurchaseRequisitions(status);
CREATE INDEX idx_pr_requested_by ON PurchaseRequisitions(requested_by);
