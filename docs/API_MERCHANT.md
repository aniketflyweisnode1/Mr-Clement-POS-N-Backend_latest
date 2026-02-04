# Merchant (Client) Services API Documentation

Base URL: `/api/v1/admin/clients`

All endpoints require authentication via Bearer token in Authorization header.

---

## Table of Contents
0. [Merchant Overview](#0-merchant-overview)
1. [Create Merchant](#1-create-merchant)
2. [Get Merchant by ID](#2-get-merchant-by-id)
3. [Get All Merchants](#3-get-all-merchants)
4. [Get Merchants by Auth](#4-get-merchants-by-auth)
5. [Update Merchant](#5-update-merchant)
6. [Activate/Deactivate Merchant](#6-activatedeactivate-merchant)
7. [Merchant Relations](#7-merchant-relations)

---

## 0. Merchant Overview

Merchants (Clients) represent businesses that use the POS system. Each merchant has relationships with:

- **Employees**: Users working for the merchant
- **Payments**: Hardware sales, subscriptions, add-ons, professional services
- **Plans**: Subscription plans purchased by the merchant
- **Orders**: POS orders and quick orders processed by the merchant
- **Settings**: Business settings, languages, currencies

### Merchant Model Structure
```json
{
  "Clients_id": 123,
  "Business_Name": "Mr. Clement Restaurant",
  "Business_logo": "https://example.com/logo.png",
  "Email": "contact@mrclement.com",
  "language": [
    {
      "Language_id": 1,
      "Language_name": "English"
    }
  ],
  "currency": [
    {
      "currency_id": 1,
      "name": "XOF",
      "icon": "CFA"
    }
  ],
  "type": "Restaurant",
  "Status": true,
  "CreateBy": {
    "user_id": 456,
    "Name": "Admin User",
    "email": "admin@example.com"
  },
  "CreateAt": "2023-10-01T10:00:00.000Z",
  "UpdatedBy": null,
  "UpdatedAt": "2023-10-01T10:00:00.000Z"
}
```

---

## 1. Create Merchant

**POST** `/create`

Creates a new merchant account.

**Request Body:**
```json
{
  "Business_Name": "Mr. Clement Restaurant",
  "Business_logo": "https://example.com/logo.png",
  "Email": "contact@mrclement.com",
  "password": "securepassword123",
  "language": [1, 2],
  "currency": [1],
  "type": "Restaurant",
  "Status": true
}
```

**Required Fields:**
- `Business_Name` (string)
- `Email` (string, unique)
- `password` (string)
- `type` (string)

**Optional Fields:**
- `Business_logo` (string)
- `language` (array of numbers - Language IDs)
- `currency` (array of numbers - Currency IDs)
- `Status` (boolean, default: true)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "Clients_id": 123,
    "Business_Name": "Mr. Clement Restaurant",
    "Business_logo": "https://example.com/logo.png",
    "Email": "contact@mrclement.com",
    "language": [
      {
        "Language_id": 1,
        "Language_name": "English"
      },
      {
        "Language_id": 2,
        "Language_name": "French"
      }
    ],
    "currency": [
      {
        "currency_id": 1,
        "name": "XOF",
        "icon": "CFA"
      }
    ],
    "type": "Restaurant",
    "Status": true,
    "CreateBy": {
      "user_id": 456,
      "Name": "Admin User",
      "email": "admin@example.com"
    },
    "CreateAt": "2023-10-01T10:00:00.000Z",
    "UpdatedBy": null,
    "UpdatedAt": "2023-10-01T10:00:00.000Z"
  }
}
```

---

## 2. Get Merchant by ID

**GET** `/getbyid/:id`

Retrieves detailed information about a specific merchant including all related data.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "Clients_id": 123,
    "Business_Name": "Mr. Clement Restaurant",
    "Business_logo": "https://example.com/logo.png",
    "Email": "contact@mrclement.com",
    "language": [
      {
        "Language_id": 1,
        "Language_name": "English"
      }
    ],
    "currency": [
      {
        "currency_id": 1,
        "name": "XOF",
        "icon": "CFA"
      }
    ],
    "type": "Restaurant",
    "Status": true,
    "CreateBy": {
      "user_id": 456,
      "Name": "Admin User",
      "email": "admin@example.com"
    },
    "CreateAt": "2023-10-01T10:00:00.000Z",
    "UpdatedBy": null,
    "UpdatedAt": "2023-10-01T10:00:00.000Z",
    "Employee": [
      {
        "user_id": 789,
        "Name": "John Manager",
        "email": "manager@mrclement.com",
        "Role_id": {
          "Role_id": 2,
          "role_name": "Manager"
        },
        "Responsibility_id": {
          "Responsibility_id": 1,
          "Responsibility_name": "Full Access"
        },
        "Status": true
      }
    ],
    "EmployeeCountByRole": [
      {
        "Role_id": 2,
        "role_name": "Manager",
        "count": 1
      },
      {
        "Role_id": 3,
        "role_name": "Waiter",
        "count": 5
      }
    ]
  }
}
```

---

## 3. Get All Merchants

**GET** `/getall?filter=all&page=1&limit=10`

Retrieves all merchants with optional filtering and pagination.

**Query Parameters:**
- `filter` (string, optional): `all`, `active`, `inactive`, `repeat`
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Filter Options:**
- `all`: All merchants (default)
- `active`: Merchants with active subscription plans
- `inactive`: Merchants with expired or no active plans
- `repeat`: Merchants who have purchased multiple plans

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "Clients_id": 123,
      "Business_Name": "Mr. Clement Restaurant",
      "Email": "contact@mrclement.com",
      "type": "Restaurant",
      "Status": true,
      "language": [
        {
          "Language_id": 1,
          "Language_name": "English"
        }
      ],
      "currency": [
        {
          "currency_id": 1,
          "name": "XOF",
          "icon": "CFA"
        }
      ],
      "CreateBy": {
        "user_id": 456,
        "Name": "Restaurant Owner",
        "email": "owner@mrclement.com"
      },
      "PlanDetails": {
        "PlanName": "Professional",
        "Description": "Full-featured POS system",
        "Price": 500000,
        "RenewalDate": "2024-10-01T00:00:00.000Z"
      },
      "lastYearSales": 2500000.00,
      "TotalOrdersLastYear": 1250,
      "CreateAt": "2023-10-01T10:00:00.000Z"
    }
  ]
}
```

---

## 4. Get Merchants by Auth

**GET** `/getbyauth`

Retrieves merchants created by the authenticated user.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "Clients_id": 123,
      "Business_Name": "Mr. Clement Restaurant",
      "Email": "contact@mrclement.com",
      "type": "Restaurant",
      "Status": true,
      "language": [
        {
          "Language_id": 1,
          "Language_name": "English"
        }
      ],
      "currency": [
        {
          "currency_id": 1,
          "name": "XOF",
          "icon": "CFA"
        }
      ],
      "CreateBy": {
        "user_id": 456,
        "Name": "Restaurant Owner",
        "email": "owner@mrclement.com"
      },
      "CreateAt": "2023-10-01T10:00:00.000Z",
      "UpdatedBy": null,
      "UpdatedAt": "2023-10-01T10:00:00.000Z"
    }
  ]
}
```

---

## 5. Update Merchant

**PUT** `/update`

Updates merchant information.

**Request Body:**
```json
{
  "id": 123,
  "Business_Name": "Mr. Clement Restaurant - Updated",
  "Business_logo": "https://example.com/new-logo.png",
  "language": [1, 3],
  "currency": [1, 2],
  "type": "Restaurant",
  "Status": true
}
```

**Required Fields:**
- `id` (number) - Merchant ID to update

**Optional Fields:**
- `Business_Name` (string)
- `Business_logo` (string)
- `language` (array of numbers)
- `currency` (array of numbers)
- `type` (string)
- `Status` (boolean)
- `password` (string) - Only if changing password

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "Clients_id": 123,
    "Business_Name": "Mr. Clement Restaurant - Updated",
    "Business_logo": "https://example.com/new-logo.png",
    "Email": "contact@mrclement.com",
    "language": [
      {
        "Language_id": 1,
        "Language_name": "English"
      },
      {
        "Language_id": 3,
        "Language_name": "Spanish"
      }
    ],
    "currency": [
      {
        "currency_id": 1,
        "name": "XOF",
        "icon": "CFA"
      },
      {
        "currency_id": 2,
        "name": "EUR",
        "icon": "€"
      }
    ],
    "type": "Restaurant",
    "Status": true,
    "CreateBy": {
      "user_id": 456,
      "Name": "Restaurant Owner",
      "email": "owner@mrclement.com"
    },
    "CreateAt": "2023-10-01T10:00:00.000Z",
    "UpdatedBy": {
      "user_id": 456,
      "Name": "Restaurant Owner",
      "email": "owner@mrclement.com"
    },
    "UpdatedAt": "2023-10-15T14:30:00.000Z"
  }
}
```

---

## 6. Activate/Deactivate Merchant

**PUT** `/activeinactive`

Activates or deactivates a merchant account.

**Request Body:**
```json
{
  "id": 123,
  "Status": false
}
```

**Required Fields:**
- `id` (number) - Merchant ID
- `Status` (boolean) - true for activate, false for deactivate

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Client deactivated successfully",
  "data": {
    "Clients_id": 123,
    "Business_Name": "Mr. Clement Restaurant",
    "Email": "contact@mrclement.com",
    "Status": false
  }
}
```

---

## 7. Merchant Relations

### 7.1 Payment Relations

Merchants have multiple payment-related relationships:

#### Hardware Sales
**GET** `/api/v1/payments/hardware-sales?page=1&limit=10&merchant_id=123`

#### Software Subscriptions
**GET** `/api/v1/payments/subscriptions?page=1&limit=10&merchant_id=123`

#### Add-On Modules
**GET** `/api/v1/payments/addons?page=1&limit=10&merchant_id=123`

#### Professional Services
**GET** `/api/v1/payments/services?page=1&limit=10&merchant_id=123`

#### Customer Transactions
**GET** `/api/v1/payments/transactions/merchant/123?page=1&limit=10`

### 7.2 Employee Relations

Merchants can have multiple employees with different roles:

```json
{
  "Employee": [
    {
      "user_id": 789,
      "Name": "John Manager",
      "email": "manager@mrclement.com",
      "Role_id": {
        "Role_id": 2,
        "role_name": "Manager"
      },
      "Status": true
    }
  ],
  "EmployeeCountByRole": [
    {
      "Role_id": 2,
      "role_name": "Manager",
      "count": 1
    },
    {
      "Role_id": 3,
      "role_name": "Waiter",
      "count": 5
    }
  ]
}
```

### 7.3 Plan Relations

Merchants have subscription plans:

```json
{
  "PlanDetails": {
    "PlanName": "Professional",
    "Description": "Full-featured POS system",
    "Price": 500000,
    "RenewalDate": "2024-10-01T00:00:00.000Z"
  }
}
```

### 7.4 Order Relations

Merchants process orders which contribute to their revenue:

```json
{
  "lastYearSales": 2500000.00,
  "TotalOrdersLastYear": 1250
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: Business_Name, Email"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Client not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating client",
  "error": "Detailed error message"
}
```

---

## Authentication

All endpoints require Bearer token authentication:

```http
Authorization: Bearer <your_jwt_token>
```

The token should contain:
- `user_id` - Used for tracking CreateBy/UpdatedBy fields
- Valid expiration time

---

## Notes

1. Passwords are never returned in API responses
2. Soft delete is used - merchants are marked as `Status: false` instead of being removed
3. All create/update operations track `CreateBy` and `UpdatedBy` using the authenticated user's ID
4. Merchants can have multiple languages and currencies configured
5. Employee counts are automatically calculated and grouped by role
6. Plan details include current active subscription information
7. Sales and order statistics are calculated for the last 12 months

---

## Change Log

### 2026-02-03
- Initial creation of Merchant API documentation
- Added comprehensive CRUD operations
- Documented all merchant relations (payments, employees, plans, orders)
- Included request/response examples with populated relations
