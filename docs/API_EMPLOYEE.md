# Employee API Request JSON Documentation

Complete API documentation for Employee routes with request JSON examples.

Base URL: `/api/v1`

---

## Table of Contents
0. [Restaurant Dashboard (Admin)](./API_RESTAURANT_DASHBOARD.md)
1. [Employee Dashboard](#1-employee-dashboard)
2. [Employee Settings](#2-employee-settings)
3. [Quick Orders](#3-quick-orders)
4. [Table Booking](#4-table-booking)
5. [Order History](#5-order-history)
6. [Employee Management](#6-employee-management)

---

## 1. Employee Dashboard

### Get Complete Dashboard

**GET** `/employee/dashboard/dashboard`

Retrieves complete dashboard data for the logged-in employee including subscriptions, heat map, support tickets, and renewal alerts.

**Authentication Required:** Yes

**Request Body:** No request body required

---

### Get Subscriptions Purchased

**GET** `/employee/dashboard/subscriptions?page=1&limit=10`

Retrieves paginated list of subscriptions purchased by the restaurant.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Request Body:** No request body required

---

### Get Heat Map Data

**GET** `/employee/dashboard/heatmap`

Retrieves city-wise heat map data showing restaurant distribution and revenue.

**Authentication Required:** Yes

**Request Body:** No request body required

---

### Get Support Tickets

**GET** `/employee/dashboard/support-tickets?page=1&limit=5&status=Open`

Retrieves paginated list of support tickets for the restaurant.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 5)
- `status` (string, optional) - Filter by ticket status

**Request Body:** No request body required

---

### Get Renewal Alerts

**GET** `/employee/dashboard/renewal-alerts?page=1&limit=10`

Retrieves subscription renewal alerts (expiring within 30 days).

**Authentication Required:** Yes

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Request Body:** No request body required

---

## 2. Employee Settings

### Get Employee Profile

**GET** `/employee/profile`

Retrieves the profile information of the authenticated employee.

**Authentication Required:** Yes

**Request Body:** No request body required

**Response:**
```json
{
  "success": true,
  "message": "Employee profile retrieved successfully",
  "data": {
    "user_id": 123,
    "Name": "John Doe",
    "email": "john.doe@restaurant.com",
    "phone": "+1234567890",
    "Role_id": {
      "Role_id": 2,
      "role_name": "Waiter"
    },
    "restaurant_id": 456,
    "Status": true,
    "CreateAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Employee Profile

**PUT** `/employee/profile`

Updates the profile information of the authenticated employee.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "Name": "John Smith",
  "phone": "+1234567891",
  "email": "john.smith@restaurant.com"
}
```

**Optional Fields:**
- `Name` (string)
- `phone` (string)
- `email` (string, must be unique)

**Response:**
```json
{
  "success": true,
  "message": "Employee profile updated successfully",
  "data": {
    "user_id": 123,
    "Name": "John Smith",
    "email": "john.smith@restaurant.com",
    "phone": "+1234567891",
    "UpdatedAt": "2024-02-03T10:30:00.000Z"
  }
}
```

---

### Change Employee Password

**PUT** `/employee/profile/change-password`

Changes the password of the authenticated employee.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "current_password": "currentpassword123",
  "new_password": "newpassword456",
  "confirm_password": "newpassword456"
}
```

**Required Fields:**
- `current_password` (string)
- `new_password` (string)
- `confirm_password` (string, must match new_password)

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Get Employee Preferences

**GET** `/employee/preferences`

Retrieves the preferences/settings of the authenticated employee.

**Authentication Required:** Yes

**Request Body:** No request body required

**Response:**
```json
{
  "success": true,
  "message": "Employee preferences retrieved successfully",
  "data": {
    "user_id": 123,
    "language": "en",
    "theme": "light",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "dashboard_layout": "compact",
    "quick_actions": ["new_order", "table_booking", "customer_search"]
  }
}
```

---

### Update Employee Preferences

**PUT** `/employee/preferences`

Updates the preferences/settings of the authenticated employee.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "language": "fr",
  "theme": "dark",
  "notifications": {
    "email": true,
    "push": false,
    "sms": true
  },
  "dashboard_layout": "detailed",
  "quick_actions": ["new_order", "table_booking", "order_history"]
}
```

**Optional Fields:**
- `language` (string) - Language preference
- `theme` (string) - UI theme preference
- `notifications` (object) - Notification preferences
- `dashboard_layout` (string) - Dashboard layout preference
- `quick_actions` (array) - Quick action buttons

**Response:**
```json
{
  "success": true,
  "message": "Employee preferences updated successfully",
  "data": {
    "user_id": 123,
    "language": "fr",
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false,
      "sms": true
    },
    "dashboard_layout": "detailed",
    "quick_actions": ["new_order", "table_booking", "order_history"],
    "UpdatedAt": "2024-02-03T10:30:00.000Z"
  }
}
```

---

### Get Employee Notifications

**GET** `/employee/notifications?page=1&limit=10&read=false`

Retrieves notifications for the authenticated employee.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `read` (boolean, optional) - Filter by read status

**Request Body:** No request body required

**Response:**
```json
{
  "success": true,
  "message": "Employee notifications retrieved successfully",
  "data": [
    {
      "notification_id": 1,
      "title": "New Order Assigned",
      "message": "You have been assigned a new order #12345",
      "type": "order",
      "is_read": false,
      "created_at": "2024-02-03T09:00:00.000Z"
    },
    {
      "notification_id": 2,
      "title": "Shift Reminder",
      "message": "Your shift starts in 30 minutes",
      "type": "reminder",
      "is_read": true,
      "created_at": "2024-02-03T08:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

### Mark Notification as Read

**PUT** `/employee/notifications/:notification_id/read`

Marks a specific notification as read.

**Authentication Required:** Yes

**Path Parameters:**
- `notification_id` (number, required)

**Request Body:** No request body required

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### Mark All Notifications as Read

**PUT** `/employee/notifications/mark-all-read`

Marks all notifications as read for the authenticated employee.

**Authentication Required:** Yes

**Request Body:** No request body required

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "marked_count": 5
  }
}
```

---

## 3. Quick Orders

### Create Quick Order

**POST** `/employee/quick_order/create`

Creates a new quick order for walk-in customers or table orders.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "client_mobile_no": "+1234567890",
  "get_order_Employee_id": 100,
  "item_ids": [
    {
      "item_id": 1,
      "quantity": 2
    },
    {
      "item_id": 5,
      "quantity": 1
    }
  ],
  "Floor_id": 1,
  "Table_id": 5,
  "AddOnTable_id": 6,
  "Persons_Count": 4,
  "Table_Booking_Status_id": 2,
  "Wating_Time": 15
}
```

**Required Fields:**
- `client_mobile_no` (string)
- `get_order_Employee_id` (number)
- `item_ids` (array of objects with item_id and quantity)
- `Floor_id` (number)
- `Table_id` (number)
- `Table_Booking_Status_id` (number)

---

### Update Quick Order

**PUT** `/employee/quick_order/update`

Updates an existing quick order.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "id": 1,
  "Order_Status": "Served",
  "item_ids": [
    {
      "item_id": 1,
      "quantity": 3
    }
  ],
  "Persons_Count": 5,
  "Status": true
}
```

**Required Fields:**
- `id` (number) - Quick_Order_id

**Optional Fields:**
- All fields from create order can be updated

---

### Get Quick Order by ID

**GET** `/employee/quick_order/get/:id`

Retrieves a specific quick order with full details.

**Authentication Required:** Yes

**Request Body:** No request body required

---

### Get All Quick Orders

**GET** `/employee/quick_order/getall?page=1&limit=10&search=keyword`

Retrieves all quick orders with pagination and search.

**Authentication Required:** No

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `search` (string, optional)

**Request Body:** No request body required

---

### Get Quick Orders by Auth

**GET** `/employee/quick_order/getbyauth`

Retrieves quick orders for the authenticated employee.

**Authentication Required:** Yes

**Request Body:** No request body required

---

## 4. Table Booking

### Get All Tables

**GET** `/employee/table_booking/getall`

Retrieves all tables for the authenticated restaurant.

**Authentication Required:** Yes

**Request Body:** No request body required

---

### Get Tables by Auth

**GET** `/employee/table_booking/getbyauth`

Retrieves tables created by the authenticated user.

**Authentication Required:** Yes

**Request Body:** No request body required

---

### Get Table Booking States

**GET** `/employee/table_booking/getTablebookingstates`

Retrieves all table booking status options.

**Authentication Required:** Yes

**Request Body:** No request body required

---

### Get Table Booking States by Auth

**GET** `/employee/table_booking/getTablebookingstatesbyauth`

Retrieves table booking status options for the authenticated user.

**Authentication Required:** Yes

**Request Body:** No request body required

---

### Create Table Booking

**POST** `/employee/table_booking/create`

Creates a new table booking for customers.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_mobile": "+1234567890",
  "customer_email": "john.doe@example.com",
  "table_id": 1,
  "floor_id": 1,
  "booking_date": "2024-01-15",
  "booking_time": "19:00",
  "duration_hours": 2,
  "number_of_guests": 4,
  "special_requests": "Window seat preferred",
  "booking_status_id": 1
}
```

**Required Fields:**
- `customer_name` (string)
- `customer_mobile` (string)
- `table_id` (number)
- `floor_id` (number)
- `booking_date` (string) - Format: YYYY-MM-DD
- `booking_time` (string) - Format: HH:MM
- `number_of_guests` (number)
- `booking_status_id` (number)

---

### Update Table Booking

**PUT** `/employee/table_booking/update`

Updates an existing table booking.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "booking_id": 1,
  "customer_name": "John Doe",
  "customer_mobile": "+1234567890",
  "customer_email": "john.doe@example.com",
  "table_id": 2,
  "floor_id": 1,
  "booking_date": "2024-01-15",
  "booking_time": "20:00",
  "duration_hours": 3,
  "number_of_guests": 6,
  "special_requests": "Birthday celebration",
  "booking_status_id": 2
}
```

**Required Fields:**
- `booking_id` (number)

**Optional Fields:**
- All fields from create booking can be updated

---

### Get Table Bookings

**GET** `/employee/table_booking/bookings?page=1&limit=10&date=2024-01-15&status=confirmed`

Retrieves table bookings with filtering options.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `date` (string, optional) - Filter by booking date (YYYY-MM-DD)
- `status` (string, optional) - Filter by booking status

**Request Body:** No request body required

---

## 5. Order History

### Get All Order History

**GET** `/employee/order_history/getall?page=1&limit=10&search=keyword`

Retrieves paginated order history with optional search.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `search` (string, optional)

**Request Body:** No request body required

---

### Get Order History by Date Range

**GET** `/employee/order_history/getbydaterange?start_date=2024-01-01&end_date=2024-01-31&page=1&limit=10`

Retrieves order history within a specific date range.

**Authentication Required:** Yes

**Query Parameters:**
- `start_date` (string, required) - Start date in YYYY-MM-DD format
- `end_date` (string, required) - End date in YYYY-MM-DD format
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Request Body:** No request body required

---

### Get Order History by Status

**GET** `/employee/order_history/getbystatus/:order_status?page=1&limit=10`

Retrieves order history filtered by order status.

**Authentication Required:** Yes

**Path Parameters:**
- `order_status` (string, required) - Order status to filter by

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Request Body:** No request body required

---

### Get Order History by Table

**GET** `/employee/order_history/getbytable/:table_id?page=1&limit=10`

Retrieves order history for a specific table.

**Authentication Required:** Yes

**Path Parameters:**
- `table_id` (number, required) - Table ID to filter by

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Request Body:** No request body required

---

### Get Order History by Client Mobile

**GET** `/employee/order_history/getbyclientmobile/:mobile_no?page=1&limit=10`

Retrieves order history for a specific client mobile number.

**Authentication Required:** Yes

**Path Parameters:**
- `mobile_no` (string, required) - Client mobile number

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Request Body:** No request body required

---

### Get Order History by Employee

**GET** `/employee/order_history/getbyemployeeid/:employee_id?page=1&limit=10`

Retrieves order history for a specific employee.

**Authentication Required:** Yes

**Path Parameters:**
- `employee_id` (number, required) - Employee ID to filter by

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Request Body:** No request body required

**Example:**
```
GET /api/v1/employee/order_history/getbyemployeeid/1?page=1&limit=10
```

---

### Get Order History by Auth

**GET** `/employee/order_history/getbyauth`

Retrieves order history for the authenticated user.

**Authentication Required:** Yes

**Request Body:** No request body required

---

### Get Weekly Orders Summary

**GET** `/employee/order_history/weeklysummary?employee_id=123`

Retrieves weekly order summary with statistics.

**Authentication Required:** Yes

**Query Parameters:**
- `employee_id` (number, optional) - Filter by specific employee

**Request Body:** No request body required

---

## 6. Employee Management

### Get Employees by Role ID

**GET** `/employee/employee/role/:roleId`

Retrieves employees filtered by role ID for the authenticated restaurant.

**Authentication Required:** Yes

**Path Parameters:**
- `roleId` (number, required) - Role ID to filter by

**Request Body:** No request body required

---

### Get Employees by Restaurant and Role

**GET** `/employee/restaurant/:restaurantId/role/:roleId`

Retrieves employees for a specific restaurant and role.

**Authentication Required:** Yes

**Path Parameters:**
- `restaurantId` (number, required) - Restaurant ID
- `roleId` (number, required) - Role ID

**Request Body:** No request body required

---
---

### Get Employee Work Summary Report

**GET** `/employee/work-summary/:employeeId`

Retrieves a comprehensive work summary report for a specific employee including attendance, performance metrics, order handling statistics, and recent activity.

**Authentication Required:** Yes

**Path Parameters:**
- `employeeId` (number, required) - Employee ID to generate report for

**Query Parameters:**
- `startDate` (string, optional) - Start date in YYYY-MM-DD format (defaults to start of current month)
- `endDate` (string, optional) - End date in YYYY-MM-DD format (defaults to today)

**Response:**
```json
{
  "success": true,
  "message": "Employee work summary report generated successfully",
  "data": {
    "employee_info": {
      "user_id": 123,
      "name": "John Doe",
      "email": "john.doe@restaurant.com",
      "phone": "+1234567890",
      "employee_id": "EMP001",
      "role": {
        "Role_id": 2,
        "role_name": "Waiter"
      },
      "responsibility": {
        "Responsibility_id": 1,
        "Responsibility_name": "Customer Service"
      },
      "location": {
        "country": {
          "Country_id": 1,
          "Country_name": "United States"
        },
        "state": {
          "State_id": 1,
          "state_name": "California"
        },
        "city": {
          "City_id": 1,
          "City_name": "Los Angeles"
        }
      },
      "onboarding_date": "2023-01-15T00:00:00.000Z",
      "status": true
    },
    "report_period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "today_progress": {
      "work_time": "05:45",
      "hrs_left": "03:15",
      "percentage": 65
    },
    "weekly_summary": {
      "total_amount": 9600,
      "currency": "XOF",
      "chart_data": [
        { "day": "S", "amount": 1200 },
        { "day": "M", "amount": 1500 },
        { "day": "T", "amount": 1100 },
        { "day": "W", "amount": 1800 },
        { "day": "T", "amount": 1400 },
        { "day": "F", "amount": 1600 },
        { "day": "S", "amount": 1000 }
      ]
    },
    "total_customer": {
      "count": 322,
      "growth": "+12.40%",
      "distribution": {
        "total": 322,
        "morning": 80,
        "noon": 100,
        "evening": 90,
        "night": 52
      }
    },
    "total_order_served": {
      "count": 322,
      "growth": "+12.40%"
    },
    "attendance_summary": {
      "total_working_days": 22,
      "average_in_time": "09:15",
      "average_out_time": "18:30",
      "average_working_hours": 8.5,
      "total_working_hours": 187
    },
    "performance_metrics": {
      "total_reviews": 15,
      "average_rating": 4.2,
      "rating_distribution": {
        "excellent": 8,
        "good": 4,
        "average": 2,
        "poor": 1,
        "terrible": 0
      }
    },
    "order_metrics": {
      "total_orders": 45,
      "completed_orders": 42,
      "pending_orders": 2,
      "cancelled_orders": 1,
      "total_revenue": 1250.50
    },
    "recent_activity": {
      "recent_clock_records": [
        {
          "date": "2024-01-31T00:00:00.000Z",
          "in_time": "2024-01-31T09:00:00.000Z",
          "out_time": "2024-01-31T18:00:00.000Z",
          "status": true
        }
      ],
      "recent_reviews": [
        {
          "review_id": 123,
          "rating": 5,
          "review_type": "Customer Service",
          "created_at": "2024-01-30T20:00:00.000Z"
        }
      ],
      "recent_orders": [
        {
          "order_id": 456,
          "order_status": "Completed",
          "total_amount": 75.50,
          "created_at": "2024-01-31T14:30:00.000Z"
        }
      ]
    }
  }
}
```

---

## API Registration Note

**Note:** Employee registration APIs are documented in the main authentication section (API_AUTH.md) under restaurant registration endpoints. Employee creation is typically handled through the restaurant admin interface after restaurant registration.
