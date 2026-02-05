# Restaurant Dashboard API Documentation

Detailed documentation for Restaurant Dashboard and Performance Reporting APIs.

**Base URL:** `/api/v1/admin/restaurant-reports` (Note: In `src/routes/index.js`, this module is mapped to `/admin/restaurant-reports`)

---

## 1. Simple Dashboard Statistics

Returns high-level overview metrics for the authenticated restaurant.

**GET** `/dashboard`

**Authentication Required:** Yes (Restaurant Role)

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "TotalOrders": 156,
    "TotalSales": 4850.75,
    "TopSellers": [
      {
        "Items_id": 1,
        "item_name": "Margherita Pizza",
        "item_code": "PIZ-001",
        "total_quantity_sold": 45,
        "item_price": 12.99,
        "item_stock_quantity": 85
      }
    ],
    "StockAlerts": [
      {
        "Items_id": 12,
        "item_name": "Coke 330ml",
        "item_code": "BEV-005",
        "item_stock_quantity": 4,
        "item_price": 1.50,
        "alert_level": "Critical"
      }
    ]
  }
}
```

---

## 2. Restaurant Performance

Retrieves performance metrics and chart data based on time filters.

**GET** `/getRestaurantPerformance`

**Authentication Required:** Yes

**Query Parameters:**
- `filter` (string, optional) - Options: `24H`, `1 week`, `1 Month`, `6 Month` (Default: `24H`)

**Response:**
```json
{
  "success": true,
  "message": "Restaurant performance data retrieved successfully",
  "data": {
    "summary": {
      "TotalRevenue": 12500.50,
      "TotalOrders": 450,
      "AverageOrderValue": 27.78,
      "NewCustomers": 125
    },
    "chartData": [
      { "label": "Mon", "value": 1200 },
      { "label": "Tue", "value": 1500 }
    ]
  }
}
```

---

## 3. Today's Reports

Quick summary of today's activities.

**GET** `/reports_today`

**Authentication Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "today_sales": 850.00,
    "today_orders": 24,
    "active_tables": 5
  }
}
```

---

## 4. Comprehensive Statistics

Full statistics including revenue, orders, and customer trends.

**GET** `/ReportsStats`

**Authentication Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue_stats": {
      "daily": 850.00,
      "weekly": 5400.00,
      "monthly": 22000.00
    },
    "order_stats": {
      "completed": 420,
      "pending": 15,
      "cancelled": 5
    }
  }
}
```

---

## 5. Employee Performance

Performance metrics for a specific employee.

**GET** `/employee-performance/:employeeId`

**Authentication Required:** Yes

**Path Parameters:**
- `employeeId` (number, required)

**Response:**
```json
{
  "success": true,
  "data": {
    "employee_name": "John Doe",
    "total_orders_handled": 125,
    "total_revenue_generated": 3200.50,
    "average_rating": 4.8
  }
}
```