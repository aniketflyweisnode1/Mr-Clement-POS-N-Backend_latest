# Employee API Request JSON Documentation

Complete API documentation for Employee routes with request JSON examples.

Base URL: `/api/v1`

---

## Table of Contents
1. [Employee Dashboard](#1-employee-dashboard)
2. [Quick Orders](#2-quick-orders)
3. [Table Booking](#3-table-booking)
4. [Order History](#4-order-history)
5. [Employee Management](#5-employee-management)

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

## 2. Quick Orders

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

## 3. Table Booking

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

## 4. Order History

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

## 5. Employee Management

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

## API Registration Note

**Note:** Employee registration APIs are documented in the main authentication section (API_AUTH.md) under restaurant registration endpoints. Employee creation is typically handled through the restaurant admin interface after restaurant registration.

