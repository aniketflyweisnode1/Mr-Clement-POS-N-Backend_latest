# Employee API Documentation

Complete API documentation for Employee registration, authentication, and all employee-related operations.

Base URL: `/api/v1`

---

## Table of Contents
1. [Authentication](#1-authentication)
   - [Employee Registration](#employee-registration)
   - [Employee Login](#employee-login)
   - [Change Password](#change-password)
   - [Logout](#logout)
   - [Forget Password](#forget-password)
2. [Employee Dashboard](#2-employee-dashboard)
3. [Quick Orders](#3-quick-orders)
4. [Table Booking](#4-table-booking)
5. [Order History](#5-order-history)
6. [Employee Management](#6-employee-management)

---

## 1. Authentication

### Employee Registration

**POST** `/user/createEmployee`

Creates a new employee account under a restaurant.

**Authentication Required:** Yes (Restaurant Owner/Admin)

**Request Body:**
```json
{
  "Name": "John Doe",
  "email": "john.doe@restaurant.com",
  "Password": "SecurePass123!",
  "Phone": "+1234567890",
  "Role_id": 3,
  "Restaurant_id": 123,
  "City_id": 456,
  "State_id": 789,
  "Country_id": 1,
  "Address": "123 Main Street",
  "Zipcode": "12345",
  "Profile_Picture": "https://example.com/profile.jpg"
}
```

**Required Fields:**
- `Name` (string, min 2 characters)
- `email` (valid email format)
- `Password` (string, min 6 characters)
- `Phone` (string)
- `Role_id` (number)
- `Restaurant_id` (number)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "Employee_id": 1,
    "user_id": 100,
    "Name": "John Doe",
    "email": "john.doe@restaurant.com",
    "Phone": "+1234567890",
    "Role_id": 3,
    "Restaurant_id": 123,
    "Status": true,
    "CreateAt": "2026-02-03T10:30:00.000Z"
  }
}
```

---

### Employee Login

**POST** `/user/login-employee`

Authenticates an employee and returns JWT token.

**Authentication Required:** No

**Request Body:**
```json
{
  "email": "john.doe@restaurant.com",
  "Password": "SecurePass123!"
}
```

**Required Fields:**
- `email` (valid email format)
- `Password` (string)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 100,
      "Employee_id": 1,
      "Name": "John Doe",
      "email": "john.doe@restaurant.com",
      "Phone": "+1234567890",
      "Role_id": 3,
      "Role_Name": "Waiter",
      "Restaurant_id": 123,
      "Restaurant_Name": "My Restaurant",
      "Status": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Invalid credentials
- `401` - Account not active
- `404` - User not found

---

### Change Password

**PUT** `/user/change-password`

Changes the password for the logged-in employee.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Required Fields:**
- `currentPassword` (string)
- `newPassword` (string, min 6 characters)
- `confirmPassword` (must match newPassword)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Logout

**POST** `/user/logout`

Logs out the current employee session.

**Authentication Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Forget Password

#### Send OTP

**POST** `/user/forget-password/send-otp`

Sends OTP to employee's registered email for password reset.

**Authentication Required:** No

**Request Body:**
```json
{
  "email": "john.doe@restaurant.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent to your email successfully",
  "data": {
    "email": "john.doe@restaurant.com",
    "otp_expires_in": 600
  }
}
```

---

#### Verify OTP

**POST** `/user/forget-password/verify-otp`

Verifies the OTP sent to employee's email.

**Authentication Required:** No

**Request Body:**
```json
{
  "email": "john.doe@restaurant.com",
  "otp": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "reset_token": "temporary_reset_token_here"
  }
}
```

---

#### Resend OTP

**POST** `/user/forget-password/resend-otp`

Resends OTP if the previous one expired or wasn't received.

**Authentication Required:** No

**Request Body:**
```json
{
  "email": "john.doe@restaurant.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

---

## 2. Employee Dashboard

### Get Complete Dashboard

**GET** `/employee/dashboard/dashboard`

Retrieves complete dashboard data for the logged-in employee including subscriptions, heat map, support tickets, and renewal alerts.

**Authentication Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Employee dashboard data retrieved successfully",
  "data": {
    "employee": {
      "user_id": 100,
      "name": "John Doe",
      "email": "john.doe@restaurant.com"
    },
    "subscriptionsPurchased": [
      {
        "Admin_Plan_Buy_Restaurant_id": 1,
        "Admin_Plan_id": 5,
        "Plan_Name": "Professional Plan",
        "Price": 500000,
        "PurchasedDate": "2026-01-01T00:00:00.000Z",
        "ExpiryDate": "2027-01-01T00:00:00.000Z",
        "paymentStatus": "Paid",
        "isActive": true,
        "Business_Name": "My Restaurant",
        "email": "owner@restaurant.com"
      }
    ],
    "heatMap": {
      "title": "Heat Map (Cities)",
      "data": [
        {
          "City_id": 1,
          "city": "New York",
          "restaurant_count": 15,
          "total_revenue": 7500000
        }
      ]
    },
    "supportTickets": {
      "title": "Support Tickets",
      "count": 3,
      "data": [
        {
          "Support_Ticket_id": 1,
          "TicketNumber": "TKT-2026-001",
          "Subject": "POS System Issue",
          "Description": "POS not printing receipts",
          "Status": "Open",
          "Priority": "High",
          "CreatedDate": "2026-02-01T10:00:00.000Z",
          "UpdatedDate": "2026-02-01T10:00:00.000Z",
          "CreatedBy": "John Doe"
        }
      ]
    },
    "renewalAlerts": {
      "title": "Subscription Renewal Alert",
      "count": 2,
      "data": [
        {
          "Admin_Plan_Buy_Restaurant_id": 1,
          "Business_Name": "My Restaurant",
          "email": "owner@restaurant.com",
          "Plan_Name": "Professional Plan",
          "ExpiryDate": "2026-02-15T00:00:00.000Z",
          "days_remaining": 12,
          "paymentStatus": "Paid",
          "alert_status": "Warning"
        }
      ]
    }
  }
}
```

---

### Get Subscriptions Purchased

**GET** `/employee/dashboard/subscriptions?page=1&limit=10`

Retrieves paginated list of subscriptions purchased by the restaurant.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Subscriptions purchased retrieved successfully",
  "data": [
    {
      "Admin_Plan_Buy_Restaurant_id": 1,
      "Admin_Plan_id": 5,
      "Plan_Name": "Professional Plan",
      "Price": 500000,
      "PurchasedDate": "2026-01-01T00:00:00.000Z",
      "ExpiryDate": "2027-01-01T00:00:00.000Z",
      "paymentStatus": "Paid",
      "isActive": true,
      "Business_Name": "My Restaurant",
      "email": "owner@restaurant.com",
      "Phone": "+1234567890"
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

### Get Heat Map Data

**GET** `/employee/dashboard/heatmap`

Retrieves city-wise heat map data showing restaurant distribution and revenue.

**Authentication Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Heat map data retrieved successfully",
  "data": {
    "title": "Heat Map (Cities)",
    "subtitle": "Distribution of restaurants by city",
    "data": [
      {
        "City_id": 1,
        "city": "New York",
        "restaurant_count": 15,
        "total_revenue": 7500000,
        "subscription_count": 20
      },
      {
        "City_id": 2,
        "city": "Los Angeles",
        "restaurant_count": 12,
        "total_revenue": 6000000,
        "subscription_count": 15
      }
    ]
  }
}
```

---

### Get Support Tickets

**GET** `/employee/dashboard/support-tickets?page=1&limit=5&status=Open`

Retrieves paginated list of support tickets for the restaurant.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 5)
- `status` (string, optional) - Filter by ticket status

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Support tickets retrieved successfully",
  "data": [
    {
      "Support_Ticket_id": 1,
      "TicketNumber": "TKT-2026-001",
      "Subject": "POS System Issue",
      "Description": "POS not printing receipts properly",
      "Status": "Open",
      "Priority": "High",
      "CreatedDate": "2026-02-01T10:00:00.000Z",
      "UpdatedDate": "2026-02-01T10:00:00.000Z",
      "CreatedBy": "John Doe",
      "email": "john.doe@restaurant.com"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 5,
    "pages": 3
  }
}
```

---

### Get Renewal Alerts

**GET** `/employee/dashboard/renewal-alerts?page=1&limit=10`

Retrieves subscription renewal alerts (expiring within 30 days).

**Authentication Required:** Yes

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Renewal alerts retrieved successfully",
  "data": [
    {
      "Admin_Plan_Buy_Restaurant_id": 1,
      "Business_Name": "My Restaurant",
      "email": "owner@restaurant.com",
      "Plan_Name": "Professional Plan",
      "ExpiryDate": "2026-02-15T00:00:00.000Z",
      "days_remaining": 12,
      "paymentStatus": "Paid",
      "alert_status": "Warning"
    },
    {
      "Admin_Plan_Buy_Restaurant_id": 2,
      "Business_Name": "My Restaurant",
      "email": "owner@restaurant.com",
      "Plan_Name": "Basic Plan",
      "ExpiryDate": "2026-02-05T00:00:00.000Z",
      "days_remaining": 2,
      "paymentStatus": "Paid",
      "alert_status": "Critical"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Alert Status Levels:**
- `Expired` - Days remaining <= 0
- `Critical` - Days remaining <= 7
- `Warning` - Days remaining <= 30
- `Active` - Days remaining > 30

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

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Quick order created successfully",
  "data": {
    "Quick_Order_id": 1,
    "client_mobile_no": "+1234567890",
    "get_order_Employee_id": 100,
    "item_ids": [
      {
        "item_id": 1,
        "itemName": "Burger",
        "quantity": 2
      },
      {
        "item_id": 5,
        "itemName": "Fries",
        "quantity": 1
      }
    ],
    "Floor_id": 1,
    "Table_id": 5,
    "Persons_Count": 4,
    "Tax": 6,
    "SubTotal": 850,
    "Total": 901,
    "Order_Status": "Preparing",
    "Status": true,
    "CreateAt": "2026-02-03T10:30:00.000Z"
  }
}
```

**Notes:**
- SubTotal is auto-calculated from item prices and quantities
- Tax is calculated as 6% of SubTotal
- Total = SubTotal + Tax
- Order_Status defaults to "Preparing"
- Table booking status is automatically updated

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

**Order Status Options:**
- `Preparing`
- `Served`
- `Cancelled`
- `Completed`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Quick order updated successfully",
  "data": {
    "Quick_Order_id": 1,
    "Order_Status": "Served",
    "UpdatedAt": "2026-02-03T11:00:00.000Z"
  }
}
```

---

### Get Quick Order by ID

**GET** `/employee/quick_order/get/:id`

Retrieves a specific quick order with full details.

**Authentication Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Quick order retrieved successfully",
  "data": {
    "Quick_Order_id": 1,
    "client_mobile_no": "+1234567890",
    "employee": {
      "Employee_id": 1,
      "Name": "John Doe"
    },
    "items": [
      {
        "item_id": 1,
        "itemName": "Burger",
        "quantity": 2,
        "price": 350,
        "total": 700
      }
    ],
    "floor": {
      "Floor_id": 1,
      "Floor_Name": "Ground Floor"
    },
    "table": {
      "Table_id": 5,
      "Table_Name": "T-5"
    },
    "SubTotal": 850,
    "Tax": 51,
    "Total": 901,
    "Order_Status": "Preparing",
    "CreateAt": "2026-02-03T10:30:00.000Z"
  }
}
```

---

### Get All Quick Orders

**GET** `/employee/quick_order/getall?page=1&limit=10&search=keyword`

Retrieves all quick orders with pagination and search.

**Authentication Required:** No

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `search` (string, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Quick orders retrieved successfully",
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

---

### Get Quick Orders by Auth

**GET** `/employee/quick_order/getbyauth`

Retrieves quick orders for the logged-in employee's restaurant.

**Authentication Required:** Yes

**Response:** `200 OK`

---

### Get Quick Orders by Status

**GET** `/employee/quick_order/getbystatus/:order_status`

Retrieves quick orders filtered by order status.

**Authentication Required:** Yes

**Path Parameters:**
- `order_status` (string) - One of: Preparing, Served, Cancelled, Completed

**Response:** `200 OK`

---

### Get Quick Orders by Table Booking Status

**GET** `/employee/quick_order/getbytablebookingstatus/:table_booking_status_id`

Retrieves quick orders filtered by table booking status.

**Authentication Required:** No

**Path Parameters:**
- `table_booking_status_id` (number)

**Response:** `200 OK`

---

## 4. Table Booking

### Get All Tables

**GET** `/employee/table_booking/getall`

Retrieves all tables with their current booking status.

**Authentication Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Tables retrieved successfully",
  "data": [
    {
      "Table_id": 1,
      "Table-name": "Table 1",
      "Table-code": "T-01",
      "Floor_id": 1,
      "Floor_Name": "Ground Floor",
      "Table-Type_id": 1,
      "Table-Type_Name": "4-Seater",
      "Table-Capacity": 4,
      "Table-Booking-Status_id": 1,
      "Booking_Status": "Available",
      "Status": true
    }
  ]
}
```

---

### Get Tables by Auth

**GET** `/employee/table_booking/getbyauth`

Retrieves tables for the logged-in employee's restaurant.

**Authentication Required:** Yes

**Response:** `200 OK`

---

### Get All Table Booking Status

**GET** `/employee/table_booking/getTablebookingstates`

Retrieves all possible table booking statuses.

**Authentication Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Table booking statuses retrieved successfully",
  "data": [
    {
      "Table_Booking_Status_id": 1,
      "Status_Name": "Available",
      "Status_Color": "#28a745"
    },
    {
      "Table_Booking_Status_id": 2,
      "Status_Name": "Reserved",
      "Status_Color": "#ffc107"
    },
    {
      "Table_Booking_Status_id": 3,
      "Status_Name": "Occupied",
      "Status_Color": "#dc3545"
    }
  ]
}
```

---

### Get Table Booking Status by Auth for Booking

**GET** `/employee/table_booking/getTablebookingstatesbyauth`

Retrieves table booking statuses applicable for the logged-in employee's restaurant.

**Authentication Required:** Yes

**Response:** `200 OK`

---

## 5. Order History

### Get Order History

**GET** `/employee/order_history/getall?page=1&limit=10&search=keyword`

Retrieves complete order history with detailed information.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `search` (string, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order history retrieved successfully",
  "data": {
    "orders": [
      {
        "order": {
          "order_id": 1,
          "order_status": "Completed",
          "persons_count": 4,
          "late_time": 25,
          "waiting_time": 15,
          "created_at": "2026-02-03T10:30:00.000Z"
        },
        "client": {
          "mobile_no": "+1234567890"
        },
        "table": {
          "table_id": 5,
          "table_name": "Table 5",
          "table_code": "T-05"
        },
        "floor": {
          "floor_id": 1,
          "floor_name": "Ground Floor"
        },
        "products": {
          "total_items_in_order": 3,
          "items": [
            {
              "item_id": 1,
              "name": "Burger",
              "quantity": 2,
              "price": 350,
              "total_item_price": 700
            },
            {
              "item_id": 5,
              "name": "Fries",
              "quantity": 1,
              "price": 150,
              "total_item_price": 150
            }
          ]
        },
        "tax": {
          "tax_percentage": 6,
          "tax_amount": 51
        },
        "subtotal": 850,
        "total": 901,
        "employee": {
          "employee_id": 1,
          "name": "John Doe"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_orders": 100,
      "orders_per_page": 10
    }
  }
}
```

---

### Get Order History by Date Range

**GET** `/employee/order_history/getbydaterange?start_date=2026-02-01&end_date=2026-02-28&page=1&limit=10`

Retrieves order history filtered by date range.

**Authentication Required:** Yes

**Query Parameters:**
- `start_date` (date, required) - Format: YYYY-MM-DD
- `end_date` (date, required) - Format: YYYY-MM-DD
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order history by date range retrieved successfully",
  "data": {
    "orders": [...],
    "date_range": {
      "start_date": "2026-02-01T00:00:00.000Z",
      "end_date": "2026-02-28T23:59:59.999Z"
    },
    "pagination": {...}
  }
}
```

---

### Get Order History by Status

**GET** `/employee/order_history/getbystatus/:order_status`

Retrieves order history filtered by order status.

**Authentication Required:** Yes

**Path Parameters:**
- `order_status` (string) - One of: Preparing, Served, Cancelled, Completed

**Response:** `200 OK`

---

### Get Order History by Table

**GET** `/employee/order_history/getbytable/:table_id`

Retrieves order history for a specific table.

**Authentication Required:** Yes

**Path Parameters:**
- `table_id` (number)

**Response:** `200 OK`

---

### Get Order History by Client Mobile Number

**GET** `/employee/order_history/getbyclientmobile/:mobile_no`

Retrieves order history for a specific customer.

**Authentication Required:** Yes

**Path Parameters:**
- `mobile_no` (string) - Customer mobile number

**Response:** `200 OK`

---

### Get Order History by Employee ID

**GET** `/employee/order_history/getbyemployeeid/:employee_id`

Retrieves order history handled by a specific employee.

**Authentication Required:** Yes

**Path Parameters:**
- `employee_id` (number)

**Response:** `200 OK`

---

### Get Order History by Auth

**GET** `/employee/order_history/getbyauth`

Retrieves order history for the logged-in employee.

**Authentication Required:** Yes

**Response:** `200 OK`

---

### Get Weekly Orders Summary

**GET** `/employee/order_history/weeklysummary`

Retrieves weekly summary of orders with statistics.

**Authentication Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Weekly orders summary retrieved successfully",
  "data": {
    "week_start": "2026-02-01T00:00:00.000Z",
    "week_end": "2026-02-07T23:59:59.999Z",
    "total_orders": 45,
    "total_revenue": 45000,
    "average_order_value": 1000,
    "order_status_breakdown": {
      "Preparing": 5,
      "Served": 30,
      "Completed": 8,
      "Cancelled": 2
    },
    "daily_breakdown": [
      {
        "date": "2026-02-01",
        "orders": 8,
        "revenue": 8000
      },
      {
        "date": "2026-02-02",
        "orders": 10,
        "revenue": 10500
      }
    ]
  }
}
```

---

## 6. Employee Management

### Get Employees by Role

**GET** `/employee/role/:roleId`

Retrieves employees filtered by role for the authenticated restaurant.

**Authentication Required:** Yes

**Path Parameters:**
- `roleId` (number) - Role ID to filter

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": [
    {
      "Employee_id": 1,
      "user_id": 100,
      "Name": "John Doe",
      "email": "john.doe@restaurant.com",
      "Phone": "+1234567890",
      "Role_id": 3,
      "Role_Name": "Waiter",
      "Restaurant_id": 123,
      "Status": true
    }
  ]
}
```

---

### Get Employees by Restaurant and Role

**GET** `/employee/restaurant/:restaurantId/role/:roleId`

Retrieves employees for a specific restaurant and role.

**Authentication Required:** Yes

**Path Parameters:**
- `restaurantId` (number)
- `roleId` (number)

**Response:** `200 OK`

---

### Get Employee by ID

**GET** `/employee/:id`

Retrieves detailed information about a specific employee.

**Authentication Required:** Yes

**Path Parameters:**
- `id` (number) - Employee ID

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "Employee_id": 1,
    "user_id": 100,
    "Name": "John Doe",
    "email": "john.doe@restaurant.com",
    "Phone": "+1234567890",
    "Role_id": 3,
    "Role_Name": "Waiter",
    "Restaurant_id": 123,
    "Restaurant_Name": "My Restaurant",
    "City_id": 456,
    "City_Name": "New York",
    "State_id": 789,
    "State_Name": "New York",
    "Country_id": 1,
    "Country_Name": "USA",
    "Address": "123 Main Street",
    "Zipcode": "12345",
    "Profile_Picture": "https://example.com/profile.jpg",
    "Status": true,
    "CreateAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied - Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

---

## Authentication

Most endpoints require Bearer token authentication:

```http
Authorization: Bearer <your_jwt_token>
```

The token is obtained from the login endpoint and should be included in all authenticated requests.

### Token Structure:
```json
{
  "user_id": 100,
  "Employee_id": 1,
  "email": "john.doe@restaurant.com",
  "Role_id": 3,
  "Restaurant_id": 123,
  "exp": 1706961234
}
```

---

## Common Fields

### Order Status Values:
- `Preparing` - Order is being prepared
- `Served` - Order has been served to customer
- `Completed` - Order is completed and paid
- `Cancelled` - Order has been cancelled

### Table Booking Status Values:
- `Available` - Table is free
- `Reserved` - Table is reserved
- `Occupied` - Table is currently occupied
- `Cleaning` - Table is being cleaned

### Renewal Alert Status:
- `Expired` - Subscription has expired
- `Critical` - Less than 7 days remaining
- `Warning` - Less than 30 days remaining
- `Active` - More than 30 days remaining

---

## Best Practices

1. **Always validate input** - Use the validation middleware for all create/update operations
2. **Handle pagination** - For list endpoints, always use pagination to avoid performance issues
3. **Filter by restaurant** - Most employee operations are scoped to the employee's restaurant
4. **Update table status** - When creating/updating orders, ensure table booking status is updated
5. **Calculate totals** - Tax and totals are auto-calculated based on items and quantities
6. **Search functionality** - Use the search parameter to filter results by keywords
7. **Date ranges** - When querying historical data, use date range filters for better performance

---

## Rate Limiting

- Login endpoints: 5 requests per minute
- OTP endpoints: 3 requests per 10 minutes
- Other endpoints: 100 requests per minute

---

## Change Log

### 2026-02-03
- Created comprehensive employee API documentation
- Included all authentication endpoints
- Added dashboard APIs documentation
- Documented quick order management
- Added table booking APIs
- Included order history endpoints
- Added employee management APIs
