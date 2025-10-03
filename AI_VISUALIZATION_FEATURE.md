# AI-Powered Custom Data Visualization Feature 📊

## Overview
A complete AI-powered data visualization system that allows users to create custom statistics, tables, and graphs using natural language queries. The system intelligently processes requests and generates appropriate visualizations automatically.

---

## ✅ What Was Built

### 1. **Frontend Components**

#### Dynamic Chart Component (`DynamicChart.tsx`)
- **Supported Chart Types:**
  - Bar Chart - For comparisons
  - Line Chart - For trends over time
  - Pie Chart - For proportions/percentages
  - Area Chart - For cumulative trends
- **Features:**
  - Responsive design using recharts
  - Custom colors
  - Configurable X/Y keys
  - Titles and labels
  - Tooltips and legends

#### Dynamic Table Component (`DynamicTable.tsx`)
- **Features:**
  - Auto-detects columns from data
  - Sortable columns (click headers)
  - Export to CSV functionality
  - Responsive design
  - Row count display
  - Hover effects

#### Statistics Card Component (`StatCard.tsx`)
- **Features:**
  - Display key metrics (totals, averages, percentages)
  - Icon support (Users, BookOpen, Calendar, Award, Clock, TrendingUp)
  - Trend indicators (up/down with percentage)
  - Color themes (blue, green, yellow, red, purple, pink)
  - Subtitle support

### 2. **Main Visualization Page** (`AIVisualizationPage.tsx`)

#### Key Features:
1. **Natural Language Input**
   - Text input for queries
   - Example queries for inspiration
   - Auto-completion from AI chat navigation

2. **Visualization Type Selector**
   - Auto-detect (let AI choose)
   - Statistics Cards
   - Charts (bar, line, pie, area)
   - Tables

3. **Real-time Generation**
   - Loading states
   - Error handling
   - Multiple visualizations per session

4. **Visualization History**
   - Shows all generated visualizations
   - Query and timestamp tracking
   - Clear all option

5. **Empty State**
   - Helpful onboarding
   - Example queries
   - Visual guidance

---

## 📋 How It Works

### User Flow:
```
1. User enters natural language query
   "Show student attendance trends for the last 30 days"

2. System sends to n8n AI Agent
   - Includes query, visualization type preference, page context

3. AI Agent processes request
   - Uses Database Agent (MCP) to query data
   - Determines best visualization type
   - Formats data appropriately

4. Returns structured JSON
   {
     "action": "visualize",
     "type": "chart",
     "visualType": "line",
     "data": [...attendance data...],
     "config": {
       "title": "30-Day Attendance Trends",
       "xKey": "date",
       "yKey": "attendance_rate"
     }
   }

5. Frontend renders visualization
   - Chart, table, or stats cards
   - With export/download options
```

### Integration with AI Chat:
- Users can request visualizations from AI chat
- AI detects visualization intent
- Navigates user to visualization page
- Auto-fills query and generates

---

## 🎨 Visualization Types

### 1. Statistics Cards
**When to Use:**
- Totals, counts, averages, percentages
- Key metrics or KPIs
- Comparing 2-4 summary values

**Example Queries:**
- "Total students in the school"
- "Average attendance rate this month"
- "Number of teachers by department"

**Response Format:**
```json
{
  "action": "visualize",
  "type": "stats",
  "config": {
    "stats": [
      {
        "title": "Total Students",
        "value": "1,234",
        "icon": "users",
        "trend": { "value": 12, "direction": "up" },
        "subtitle": "Across all grades",
        "color": "blue"
      }
    ]
  }
}
```

### 2. Charts
**When to Use:**
- Trends, patterns, comparisons
- Data over time
- Category comparisons

**Chart Types:**
- **Bar Chart** - Compare values across categories
- **Line Chart** - Show trends over time
- **Pie Chart** - Show proportions/percentages
- **Area Chart** - Show cumulative trends

**Example Queries:**
- "Student attendance trends last 30 days" → Line Chart
- "Students by grade level" → Bar Chart
- "Class distribution" → Pie Chart
- "Cumulative admissions 2025" → Area Chart

**Response Format:**
```json
{
  "action": "visualize",
  "type": "chart",
  "visualType": "bar",
  "data": [
    { "name": "Grade 9", "value": 245 },
    { "name": "Grade 10", "value": 312 }
  ],
  "config": {
    "title": "Students by Grade Level",
    "xKey": "name",
    "yKey": "value"
  }
}
```

### 3. Tables
**When to Use:**
- Detailed data listings
- Multiple data points per item
- Individual records

**Example Queries:**
- "List top 10 students by marks"
- "Teacher schedule for this week"
- "Detailed attendance report for Class 10A"

**Response Format:**
```json
{
  "action": "visualize",
  "type": "table",
  "data": [
    { "name": "John Doe", "class": "10A", "marks": 85, "attendance": "92%" }
  ],
  "config": {
    "title": "Student Performance Report",
    "columns": ["name", "class", "marks", "attendance"]
  }
}
```

---

## 🔧 Technical Implementation

### Files Created/Modified:

1. **`frontend/ERP/src/components/charts/DynamicChart.tsx`** ✅ NEW
   - Reusable chart component with 4 chart types

2. **`frontend/ERP/src/components/charts/DynamicTable.tsx`** ✅ NEW
   - Dynamic table with sorting and CSV export

3. **`frontend/ERP/src/components/charts/StatCard.tsx`** ✅ NEW
   - Statistics cards with icons and trends

4. **`frontend/ERP/src/pages/ai/AIVisualizationPage.tsx`** ✅ NEW
   - Main visualization page

5. **`frontend/ERP/src/router.tsx`** ✅ MODIFIED
   - Added `/ai/visualizations` route

6. **`frontend/ERP/src/components/ai/AIChat.tsx`** ✅ MODIFIED
   - Added visualization navigation support
   - Handle `visualize` action responses

7. **`n8n/workflows/prompts/system/mainagent`** ✅ MODIFIED
   - Added comprehensive visualization instructions
   - Response formats and examples
   - When to use each visualization type

---

## 📊 Example Queries

### Statistics Queries:
- "Total students in the school"
- "Average attendance rate this month"
- "Number of teachers by subject"
- "Pass percentage for last exam"

### Chart Queries:
- "Show student attendance trends for the last 30 days"
- "Students by grade level"
- "Teacher workload distribution"
- "Monthly admission statistics for 2025"
- "Class-wise average marks comparison"

### Table Queries:
- "Top 10 performing students this semester"
- "List all teachers with their subjects"
- "Attendance report for Class 10A"
- "Students with attendance below 75%"

---

## 🎯 AI Workflow

### In n8n Prompt (mainagent):

#### When User Asks for Visualization:
1. **Identify request type** (stats, chart, or table)
2. **Use Database Agent (MCP)** to query data
3. **Format data** into visualization structure
4. **Return JSON** with action: "visualize"

#### Example Flow:
```
User: "Show attendance trends for class 10A"

1. AI uses Database Agent Tool
2. Queries: SELECT date, attendance_rate FROM attendance WHERE class='10A' ORDER BY date DESC LIMIT 30
3. Gets results: [{date: "2025-10-01", attendance_rate: 92}, ...]
4. Formats as visualization:
   {
     "action": "visualize",
     "type": "chart",
     "visualType": "line",
     "data": [...results...],
     "config": {
       "title": "Class 10A Attendance Trends",
       "xKey": "date",
       "yKey": "attendance_rate"
     }
   }
5. Frontend renders line chart
```

---

## 🚀 How to Use

### From AI Chat:
1. Ask AI to create a visualization
   - "Show me attendance trends"
   - "Create a chart of students by grade"
   - "Generate a report of top performers"

2. AI navigates you to `/ai/visualizations`
3. Query auto-fills
4. Visualization generates automatically

### Directly on Visualization Page:
1. Navigate to AI → Visualizations
2. Enter natural language query
3. (Optional) Select visualization type or leave as "Auto-detect"
4. Click "Generate"
5. View visualization
6. Export if needed (CSV for tables)

---

## 📱 UI Features

### Query Input Section:
- Large text input for queries
- Example queries as clickable buttons
- Visualization type selector (Auto, Stats, Charts, Tables)
- Generate button with loading state

### Visualization Display:
- Multiple visualizations per session
- Query label with timestamp
- Clear all button
- Responsive grid layout

### Empty State:
- Helpful onboarding message
- Example queries to try
- Visual icon

---

## 🎨 Design

### Color Palette:
- **Blue** - Default, general stats
- **Green** - Positive metrics, success
- **Yellow** - Warnings, attention
- **Red** - Alerts, critical metrics
- **Purple** - Special features
- **Pink** - Highlights

### Icons Available:
- `users` - Student/user counts
- `bookopen` - Academic metrics
- `calendar` - Date/schedule related
- `award` - Performance/achievements
- `clock` - Time-based metrics
- `trendingup` - Growth/trends

---

## 📈 Future Enhancements

1. **More Chart Types**
   - Scatter plots
   - Heatmaps
   - Gantt charts
   - Multi-line charts

2. **Advanced Exports**
   - Export charts as PNG/SVG
   - PDF reports
   - Excel export for tables

3. **Customization**
   - Color picker for charts
   - Custom chart titles
   - Font size controls
   - Theme switching

4. **Interactivity**
   - Drill-down charts
   - Filter data in tables
   - Date range pickers
   - Real-time updates

5. **Saved Visualizations**
   - Save favorite queries
   - Dashboard builder
   - Share visualizations
   - Schedule reports

6. **AI Insights**
   - Automatic insights from data
   - Anomaly detection
   - Trend predictions
   - Recommendations

---

## 🧪 Testing

### Test Scenarios:

1. **Statistics Cards**
   - Query: "Total students"
   - Expected: Stats card with count, icon, trend

2. **Bar Chart**
   - Query: "Students by grade"
   - Expected: Bar chart with grades on X-axis

3. **Line Chart**
   - Query: "Attendance trends last month"
   - Expected: Line chart showing daily attendance

4. **Pie Chart**
   - Query: "Class distribution"
   - Expected: Pie chart showing percentage per class

5. **Table**
   - Query: "List top 10 students"
   - Expected: Sortable table with student details

6. **CSV Export**
   - Generate table → Click Export CSV → File downloads

7. **AI Chat Integration**
   - From chat: "create a visualization of attendance"
   - Should navigate to visualization page

---

## 📝 Configuration

### Environment Variables:
```env
VITE_N8N_CHAT_URL=<your-n8n-webhook-url>
VITE_N8N_CHAT_TOKEN=<optional-auth-token>
```

### Route:
- Path: `/ai/visualizations`
- Access: Admin, Teacher roles
- Component: `AIVisualizationPage`

---

## 🎓 Summary

This feature provides a complete AI-powered data visualization system that:

✅ Accepts natural language queries  
✅ Automatically determines best visualization type  
✅ Queries database through AI agent  
✅ Generates beautiful, interactive visualizations  
✅ Supports stats cards, charts (4 types), and tables  
✅ Exports data as CSV  
✅ Integrates with AI chat for seamless UX  
✅ Responsive and accessible design  

**Status**: ✅ **Fully Implemented and Ready to Use**

**Next Steps**:
1. Test with real database queries
2. Gather user feedback
3. Add more visualization types as needed
4. Implement advanced export options
