# Professional Report Builder

A lightweight, professional-grade analytical report generator with drag-and-drop interface. Connect your MySQL database, design multi-table queries with JOINs and aggregations, and create beautiful reports with charts, tables, and KPIs - no code required.

**Perfect for**: Business analysts, data professionals, and non-technical users who need to generate analytical reports from relational databases.

## 🚀 Features

### Enterprise-Grade Capabilities
- **Multi-Table Queries**: Select and combine data from multiple tables
- **Advanced JOINs**: Inner, Left, Right, and Full joins for complex data relationships
- **Aggregations**: SUM, AVG, COUNT, MIN, MAX functions
- **Filtering**: 9 filter operators (=, !=, >, <, >=, <=, LIKE, IN, BETWEEN)
- **Grouping**: GROUP BY support for detailed analytics
- **Data Preview**: See actual query results before creating reports with validation

### Beautiful Visualizations
- **4 Chart Types**: Bar, Line, Pie, and Area charts with Recharts
- **Data Tables**: Display query results with automatic column detection
- **KPI Widgets**: Highlight key metrics with number/currency/percentage formatting
- **Multi-Widget Reports**: Combine multiple visualizations in one report

### User-Friendly Interface
- **Connection Management**: Support for connection form and connection string
- **Schema Browser**: Explore database structure visually
- **Relationship Builder**: Define table relationships with visual feedback
- **Real-Time Validation**: Helpful error messages guide users
- **Query Preview**: Run queries to validate before report generation

## 📋 Tech Stack

- **Frontend**: React 18 + Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: MySQL with mysql2/promise driver
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Build**: Next.js with optimized production bundles

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- MySQL Server 5.7+ (local or remote)
- A database with tables to query

### Setup Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd ReportS
```

2. **Install dependencies**
```bash
npm install
```

3. **Verify the setup**
```bash
npm run build
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or `3001` if port 3000 is in use).

## 📖 Quick Start Guide

### 1. Connect to Your Database

Visit the home page and either:

**Option A: Connection Form**
```
Host: localhost
Port: 3306
Database: your_database
Username: root
Password: your_password
```

**Option B: Connection String**
```
mysql://root:password@localhost:3306/your_database
```

### 2. Build Your Data Model

1. Select the tables you want to work with
2. Click on table names to see available columns
3. Define relationships between tables (JOINs)
4. Name your data model and click "Create Data Model"

### 3. Create Your Query

1. Add columns from your selected tables
2. Apply aggregations (SUM, AVG, COUNT, etc.)
3. Add filters to limit results
4. Enable GROUP BY for aggregated results
5. Click "Run Preview" to see sample data with validation
6. Click "Use This Query for Report" to finalize

### 4. Design Your Report

1. Add Chart, Table, or KPI widgets
2. Configure each widget with your query data
3. Adjust titles and settings as needed
4. View your completed report with multiple visualizations

## 📁 Project Structure

```
ReportS/
├── app/
│   ├── api/
│   │   └── database/              # API endpoints for database operations
│   │       ├── test-connection/
│   │       ├── schema/
│   │       ├── query/
│   │       └── complex-query/
│   ├── page.tsx                   # Home page with connection modal
│   └── layout.tsx                 # Root layout
├── components/
│   ├── DatabaseConnectionModal.tsx # Connection form & string input
│   ├── DataModelBuilder.tsx       # Multi-table selection & JOINs
│   ├── QueryBuilder.tsx           # Advanced query composer with preview
│   ├── ReportBuilder.tsx          # Main orchestrator component
│   ├── ReportCanvas.tsx           # Widget rendering & management
│   ├── SchemaExplorer.tsx         # Database schema browser
│   ├── WidgetConfigPanel.tsx      # Widget configuration sidebar
│   └── widgets/
│       ├── ChartWidget.tsx        # Chart visualization
│       ├── TableWidget.tsx        # Table display
│       └── KPIWidget.tsx          # Metric display
├── lib/
│   └── database.ts                # Database utilities & query builder
├── types/
│   └── index.ts                   # TypeScript type definitions
├── public/                        # Static assets
├── TEST_GUIDE.md                  # Detailed testing guide with examples
└── README.md                      # This file
```

## 🔑 Key Components

### DatabaseConnectionModal
Handles both connection form and connection string input with real-time validation.

### DataModelBuilder
Allows users to:
- Select multiple tables from their database
- Define relationships between tables (INNER, LEFT, RIGHT, FULL joins)
- Visualize the data model structure

### QueryBuilder
Advanced query interface with:
- Column selection from multiple tables
- Aggregation functions
- Filter builder with 9 operators
- GROUP BY support
- **Data preview showing actual results**
- **Real-time validation with error messages**

### Widgets
- **ChartWidget**: Responsive charts using Recharts (Bar/Line/Pie/Area)
- **TableWidget**: Automatic column detection and pagination
- **KPIWidget**: Single metric display with formatting options

## 🗄️ Database Schema

The application expects a standard relational database with:
- Tables with primary keys
- Columns with data types
- Optional foreign key relationships

Example setup (see TEST_GUIDE.md for complete SQL):
```sql
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100),
  country VARCHAR(50)
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  order_date DATE,
  amount DECIMAL(10, 2),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

## 🔄 API Endpoints

### POST /api/database/test-connection
Test database connectivity

### POST /api/database/schema
Get database schema (tables and columns)

### POST /api/database/complex-query
Execute complex queries with JOINs, filters, aggregations, and GROUP BY

### POST /api/database/query
Execute simple single-table queries (legacy)

## 🛡️ Security Notes

- **No credential storage**: Database credentials are never persisted
- **Session-based**: Credentials used only for current session
- **SQL injection prevention**: Parameterized queries with backtick escaping
- **Type safety**: Full TypeScript for compile-time error detection

## 🚀 Performance Optimizations

- **Production builds**: Minified and optimized bundles (~120KB gzipped)
- **Component splitting**: Code-split widgets for faster loading
- **Query limits**: Default limits prevent massive result sets
- **Responsive charts**: Hardware-accelerated rendering with Recharts

## 📚 Documentation

- **[TEST_GUIDE.md](./TEST_GUIDE.md)**: Comprehensive testing guide with SQL examples and scenarios
- **[copilot-instructions.md](./.github/copilot-instructions.md)**: Project setup and feature documentation

## 📈 Roadmap / Future Enhancements

- [ ] User authentication and saved reports
- [ ] Report scheduling and email delivery
- [ ] PDF/Excel/CSV export functionality
- [ ] Drag-to-reorder widgets
- [ ] Custom color schemes and branding
- [ ] Real-time data updates
- [ ] Additional chart types (Scatter, Bubble, Gauge)
- [ ] Report templates and sharing
- [ ] Advanced analytics (forecasting, anomaly detection)

## 🐛 Troubleshooting

### Connection Issues
- Ensure MySQL is running
- Verify database exists and is accessible
- Check firewall settings on port 3306
- Confirm credentials are correct

### Query Errors
- Verify table and column names exist in database
- Check data model relationships are defined correctly
- Run preview to see detailed error messages
- Check browser console for JavaScript errors

### Widget Issues
- Ensure data model and query were saved successfully
- Verify database connection is active
- Check widget configuration in settings panel
- Look for API errors in browser DevTools

## 🎯 Key Features Implemented

✅ **Database Connection Management**
- Connection form with validation
- Connection string parsing
- Session-based credential handling

✅ **Multi-Table Data Modeling**
- Table selection from database schema
- Relationship builder with 4 JOIN types
- Visual model overview

✅ **Advanced Query Builder**
- Column selection from multiple tables
- Aggregation functions (SUM, AVG, COUNT, MIN, MAX)
- 9-operator filter system
- GROUP BY support
- Data preview with validation

✅ **Professional Widgets**
- Bar, Line, Pie, Area charts
- Data tables with automatic columns
- KPI metrics with formatting

✅ **Full-Stack Architecture**
- React components with TypeScript
- Next.js API routes for database access
- MySQL connection pooling
- Complex JOIN query generation

## 📊 Project Statistics

- **15+** Reusable React components
- **4** API endpoints for database operations
- **200+** Lines of complex query builder logic
- **10+** TypeScript interfaces for type safety
- **~120KB** Production bundle size (gzipped)

## 🚀 Getting Started

See [TEST_GUIDE.md](./TEST_GUIDE.md) for:
- Step-by-step setup instructions
- Sample SQL database creation
- Complete testing scenarios
- Feature validation checklist

---

**Ready to create amazing reports?** Start by connecting your database and building your first query! 🎉
