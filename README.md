# Report Builder

A modern, user-friendly drag-and-drop analytical report builder that connects to your MySQL database. Perfect for non-technical users who need to create professional reports without writing code.

## Features

- 🔌 **Easy Database Connection**: Connect via connection form or connection string
- 📊 **Drag-and-Drop Report Builder**: Intuitive interface for creating reports
- 📈 **Multiple Chart Types**: Bar, Line, Pie, and Area charts
- 📋 **Data Tables**: Display your database tables with column selection
- 📤 **Export Options**: Export reports as PDF, Excel, and CSV
- 🎨 **Modern UI**: Beautiful, user-friendly interface built with React and Tailwind CSS
- ⚡ **Real-time Preview**: See your report changes instantly
- 🔍 **Schema Browser**: Visual exploration of your database tables and columns

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **Charts**: Recharts
- **State Management**: Zustand
- **Database Driver**: mysql2/promise
- **Export**: jsPDF, ExcelJS, PapaParse

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- MySQL database (local or remote)

## Installation

1. Clone the repository or extract the project
2. Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Connect Database**: Open the application and enter your MySQL database credentials
   - Use the form method for individual fields
   - Or use connection string format: `mysql://user:password@host:port/database`

2. **Build Your Report**:
   - Browse your database schema in the left panel
   - Click "Add Chart" or "Add Table" to add widgets
   - Configure each widget by selecting tables and columns
   - See real-time preview of your data

3. **Customize**:
   - Edit widget titles and configurations
   - Change chart types (Bar, Line, Pie, Area)
   - Select which columns to display in tables
   - Remove widgets you don't need

4. **Export**: Export your report as PDF, Excel, or CSV (coming soon)

## API Routes

- `POST /api/database/test-connection` - Test database connectivity
- `POST /api/database/schema` - Fetch database schema (tables and columns)
- `POST /api/database/query` - Execute queries and fetch data

## Project Structure

```
├── app/
│   ├── api/
│   │   └── database/           # API routes for database operations
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── DatabaseConnectionModal.tsx  # Database connection UI
│   ├── ReportBuilder.tsx            # Main builder component
│   ├── ReportCanvas.tsx             # Report canvas
│   ├── SchemaExplorer.tsx           # Database schema explorer
│   ├── WidgetConfigPanel.tsx        # Widget configuration panel
│   └── widgets/
│       ├── ChartWidget.tsx          # Chart rendering component
│       └── TableWidget.tsx          # Table rendering component
├── lib/
│   └── database.ts             # Database utility functions
├── types/
│   └── index.ts                # TypeScript type definitions
└── public/                      # Static assets
```

## Configuration

The application uses environment variables for configuration. Create a `.env.local` file if needed:

```env
# Currently no environment variables required for basic functionality
# Database credentials are provided by users in the UI
```

## Database Compatibility

- MySQL 5.7 or higher
- MariaDB 10.2 or higher
- Tested with AWS RDS MySQL
- Works with local MySQL installations

## Roadmap

- [ ] PDF export functionality
- [ ] Excel export with formatting
- [ ] CSV export
- [ ] Report scheduling and automation
- [ ] Report sharing and permissions
- [ ] Advanced filtering and aggregation
- [ ] Custom SQL queries
- [ ] Report templates
- [ ] Data refresh scheduling

## Troubleshooting

### Connection Issues

- Ensure your MySQL server is running and accessible
- Check firewall rules if using remote database
- Verify username, password, and database name are correct
- For cloud databases (AWS RDS), ensure security groups allow your IP

### Data Not Loading

- Verify the table has data
- Check that you've selected valid columns for charts/tables
- Ensure columns exist in the selected table

### Performance

- Large tables (>100k rows) may take time to load
- Limit the number of rows displayed in table widgets
- Use column selection to reduce data transfer

## Security Notes

⚠️ **Important**: 
- Database credentials are sent only to your local server
- Never share your database connection details
- This application is designed for trusted internal use
- Consider using read-only database users for safety

## Support

For issues or feature requests, please open an issue in the project repository.

## License

MIT License - feel free to use this project for personal or commercial purposes.
