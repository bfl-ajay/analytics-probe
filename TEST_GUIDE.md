# Professional Report Builder - Testing Guide

## Application Overview

Your Report Builder is now a professional-grade analytical report generation tool with the following features:

### ✨ Core Features Implemented

#### 1. **Database Connection Management**
- **Connection Form**: Enter individual connection parameters (host, port, username, password, database)
- **Connection String**: Quick connection using MySQL connection string (e.g., `mysql://user:pass@host:port/db`)
- **Connection Testing**: Validates connection before proceeding
- **Secure**: Credentials are not stored; they're used only for the current session

#### 2. **Data Model Builder**
- **Multi-Table Selection**: Browse and select multiple tables from your database
- **Table Relationships (JOINs)**: Define relationships between tables with support for:
  - Inner Join (default)
  - Left Join (all records from left table)
  - Right Join (all records from right table)
  - Full Join (all records from both tables)
- **Relationship Visualization**: View selected tables and their connections
- **Schema Explorer**: Browse database tables, columns, and data types

#### 3. **Advanced Query Builder**
- **Column Selection**: Add columns from multiple tables with ease
- **Aggregations**: Apply aggregation functions:
  - SUM (total)
  - AVG (average)
  - COUNT (count)
  - MIN (minimum)
  - MAX (maximum)
  - NONE (raw values)
- **Filtering**: Advanced filter conditions with multiple operators:
  - Equals (=), Not Equals (!=)
  - Greater than (>), Less than (<)
  - Greater or equal (>=), Less or equal (<=)
  - LIKE (pattern matching)
  - IN (value list)
  - BETWEEN (range)
- **GROUP BY**: Group query results by selected columns
- **Data Preview**: Run a preview to see actual data (first 10 rows) before finalizing
- **Validation**: Real-time validation with helpful error messages

#### 4. **Report Widgets**
- **Chart Widgets**: Visualize data with:
  - Bar Charts
  - Line Charts
  - Pie Charts
  - Area Charts
- **Table Widget**: Display data in tabular format with custom columns
- **KPI Widget**: Show key performance indicators with formatting:
  - Number format
  - Currency format
  - Percentage format

#### 5. **Report Canvas**
- **Drag & Drop**: Add multiple widgets to your report (coming soon: drag to reorder)
- **Widget Configuration**: Configure each widget's data source and display options
- **Multi-Widget Reports**: Combine charts, tables, and KPIs in one report
- **Widget Management**: Add, edit, and remove widgets

---

## Step-by-Step Testing Guide

### Step 1: Database Connection

1. Open http://localhost:3001 in your browser
2. You'll see the **Report Builder** home page with connection options

**Option A: Connection Form**
- Host: `localhost` (or your MySQL server address)
- Port: `3306` (default MySQL port)
- Database: Name of your test database
- Username: Your MySQL username
- Password: Your MySQL password

**Option B: Connection String**
- Enter your connection string: `mysql://username:password@localhost:3306/database`

**To Test:**
```sql
-- Create a test database with sample data:
CREATE DATABASE report_db;

USE report_db;

-- Create sample tables
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100),
  country VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  order_date DATE,
  amount DECIMAL(10, 2),
  status VARCHAR(20),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT,
  product_name VARCHAR(100),
  quantity INT,
  price DECIMAL(10, 2),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Insert sample data
INSERT INTO customers (name, email, country) VALUES
('John Doe', 'john@example.com', 'USA'),
('Jane Smith', 'jane@example.com', 'UK'),
('Bob Johnson', 'bob@example.com', 'USA');

INSERT INTO orders (customer_id, order_date, amount, status) VALUES
(1, '2024-01-15', 1500.00, 'completed'),
(1, '2024-02-20', 2500.00, 'completed'),
(2, '2024-01-10', 500.00, 'pending'),
(3, '2024-03-01', 3000.00, 'completed');

INSERT INTO order_items (order_id, product_name, quantity, price) VALUES
(1, 'Laptop', 1, 1500.00),
(2, 'Monitor', 2, 1250.00),
(3, 'Keyboard', 1, 500.00),
(4, 'Mouse', 3, 1000.00);
```

Click **"Connect Database"** → You should see "Connection successful! Redirecting..."

### Step 2: Data Model Builder

After successful connection, you'll see the **Data Model Builder** page.

**What you can do:**
1. **Select Tables**: Click checkboxes to select tables from your database
   - For testing: Select `customers`, `orders`, and `order_items`
2. **View Table Columns**: Expand each table to see columns and data types
3. **Define Relationships**:
   - Click "Add Relationship"
   - Select: `orders` → `customers` (many-to-one)
   - From Column: `orders.customer_id`
   - To Column: `customers.id`
   - Join Type: `Inner Join`
4. **Name Your Model**: Give your data model a name (e.g., "Customer Orders")
5. **Create Model**: Click "Create Data Model" button

**Expected Result**: Redirects to Query Builder with your data model

### Step 3: Advanced Query Builder

**What you can do:**

1. **Select Columns**:
   - From left panel, expand tables
   - Click column names to add them to your query
   - Example: customers.name, orders.order_date, orders.amount

2. **Add Aggregations**:
   - Select a column in your query
   - Choose aggregation: SUM, AVG, COUNT, MIN, MAX
   - Example: SUM(orders.amount) to get total order value

3. **Add Filters**:
   - Click "+ Add Filter"
   - Select: Table, Column, Operator, Value
   - Example: orders.status = 'completed'

4. **Group By**:
   - Check the "Group" checkbox for columns to group
   - Example: Group by customers.name to see totals per customer

5. **Run Preview**:
   - Click "Run Preview" button
   - **NEW**: See actual query results (first 10 rows)
   - **NEW**: Validation messages show any issues

6. **Save Query**:
   - Click "Use This Query for Report"

**Expected Result**: Proceeds to Report Canvas with your configured data

### Step 4: Create Report

On the **Report Canvas**:

1. **Add Chart Widget**:
   - Click "+ Add Chart"
   - Select chart type (Bar, Line, Pie, Area)
   - Configure data source from your query

2. **Add Table Widget**:
   - Click "+ Add Table"
   - Shows your query data in table format

3. **Add KPI Widget**:
   - Click "+ Add KPI"
   - Configure to show key metrics
   - Apply currency or percentage formatting

4. **Configure Widgets**:
   - Click on a widget to select it
   - Right panel shows configuration options
   - Edit title, adjust display options

5. **View Report**:
   - Your report with all widgets displays in real-time
   - See data from your multi-table query with JOINs applied

---

## Testing Scenarios

### Scenario 1: Simple Report
**Goal**: Create a report showing all customers

1. Connection Form: Connect to your test database
2. Select: `customers` table only
3. Columns: id, name, email, country
4. Create: Table widget to display all customers

**Expected**: Table showing all customer records

### Scenario 2: Multi-Table with JOIN
**Goal**: Show orders with customer names and totals

1. Data Model: Select `customers` and `orders`
2. Relationship: orders → customers (Inner Join)
3. Columns: customers.name, orders.order_date, orders.amount
4. Aggregation: SUM(orders.amount)
5. Group By: customers.name
6. Widgets: Chart (bar) and Table

**Expected**: 
- Bar chart showing total order value per customer
- Table showing customer names with their total order amounts

### Scenario 3: Advanced Filtering
**Goal**: Show completed orders only, grouped by customer

1. Data Model: Select `customers` and `orders`
2. Columns: customers.name, orders.amount
3. Filter: orders.status = 'completed'
4. Aggregation: SUM(orders.amount)
5. Group By: customers.name
6. Preview: Click "Run Preview" to see results
7. Widget: KPI showing total revenue (in currency format)

**Expected**: 
- Preview shows completed orders only
- KPI widget displays total revenue in currency format

### Scenario 4: Complex Analysis
**Goal**: Analyze order items across customers

1. Data Model: Select all tables (customers, orders, order_items)
2. Relationships:
   - orders → customers
   - order_items → orders
3. Columns: customers.name, order_items.product_name, order_items.quantity, order_items.price
4. Aggregation: SUM(quantity), SUM(price)
5. Filter: orders.status = 'completed'
6. Group By: customers.name, product_name
7. Preview: Verify data looks correct
8. Widgets: Table and Bar chart

**Expected**: 
- Table showing product sales by customer
- Chart visualizing quantity/price trends

---

## Key Features to Validate

- [ ] Database connection works with your MySQL setup
- [ ] Connection form accepts all parameters correctly
- [ ] Connection string parsing works properly
- [ ] Schema introspection retrieves all tables and columns
- [ ] Data Model Builder shows all available tables
- [ ] Relationship builder allows defining JOINs
- [ ] Query builder columns appear when tables are selected
- [ ] Aggregations are applied correctly
- [ ] Filters work with all operators (=, !=, >, <, >=, <=, LIKE, IN, BETWEEN)
- [ ] GROUP BY works with multiple columns
- [ ] **NEW**: Data Preview runs successfully
- [ ] **NEW**: Preview shows actual query results
- [ ] **NEW**: Validation messages appear when needed
- [ ] Charts render correctly with sample data
- [ ] Table widget displays filtered/aggregated data
- [ ] KPI widget shows calculations correctly
- [ ] Multiple widgets work together in one report

---

## Troubleshooting

### Connection Failed
- Check MySQL is running: `mysql -u root -p`
- Verify database exists: `SHOW DATABASES;`
- Check firewall isn't blocking port 3306
- Ensure connection string syntax is correct

### Preview Not Working
- Ensure at least one column is selected
- Verify database connection is still active
- Check browser console for error messages
- Check Next.js terminal for API errors

### Widget Not Showing Data
- Verify data model was created successfully
- Check that query columns are properly configured
- Run preview to see if data exists
- Look for validation warnings in Query Builder

### Join Not Working
- Ensure both tables are selected in Data Model
- Verify relationship is defined correctly
- Check that foreign key columns are specified
- Try with Inner Join first, then test other types

---

## Next Steps

After testing the application:

1. **Customize**: Adjust UI colors, add your branding
2. **Deploy**: Deploy to production (Vercel, AWS, etc.)
3. **Scale**: Add user authentication, save reports to database
4. **Enhance**: Add report scheduling, email export, more chart types
5. **Optimize**: Cache query results, add data refresh options

---

## Project Statistics

- **Components**: 15+ reusable React components
- **API Routes**: 4 database operation endpoints
- **Database Functions**: Complex query builder with multi-table support
- **Type System**: 10+ TypeScript interfaces for type safety
- **Build Size**: ~120KB (gzipped JavaScript)
- **Features**: JOINs, aggregations, filtering, multiple chart types

---

## Support & Documentation

For issues or questions:
1. Check the TEST_GUIDE.md (this file)
2. Review components in `/components/`
3. Check API routes in `/app/api/database/`
4. See database utilities in `/lib/database.ts`
5. Review type definitions in `/types/index.ts`

Happy reporting! 🚀
