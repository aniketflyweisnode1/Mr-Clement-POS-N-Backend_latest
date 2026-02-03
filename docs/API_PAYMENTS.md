# Payment Services API Documentation

Base URL: `/api/v1/payments`

All endpoints require authentication via Bearer token in Authorization header.

---

## Table of Contents
1. [Hardware Sales](#1-hardware-sales)
2. [Software Subscriptions](#2-software-subscriptions)
3. [Add-On Modules](#3-add-on-modules)
4. [Professional Services](#4-professional-services)
5. [Customer Transactions](#5-customer-transactions)
6. [Revenue Summary](#6-revenue-summary)

---

## 1. Hardware Sales

### Create Hardware Sale
**POST** `/hardware-sales/create`

Creates a new hardware sale record.

**Request Body:**
```json
{
  "merchant_id": 123,
  "reseller_id": 456,
  "hardware_type": "POS Terminal",
  "hardware_model": "XT-500",
  "quantity": 2,
  "unit_price": 150000,
  "discount_percentage": 10,
  "payment_method": "Bank_Transfer",
  "invoice_number": "INV-2024-001",
  "warranty_months": 12,
  "notes": "Installation included"
}
```

**Required Fields:**
- `merchant_id` (number)
- `hardware_type` (string)
- `quantity` (number)
- `unit_price` (number)
- `payment_method` (enum: 'Bank_Transfer', 'Card', 'Cash', 'Mobile_Money')

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Hardware sale recorded successfully",
  "data": {
    "HardwareSale_id": 1,
    "merchant_id": 123,
    "hardware_type": "POS Terminal",
    "total_amount": 300000,
    "discount_amount": 30000,
    "final_amount": 270000,
    "warranty_expiry": "2027-02-03T10:30:00.000Z",
    "payment_status": "Pending",
    "CreateAt": "2026-02-03T10:30:00.000Z"
  }
}
```

---

### Get All Hardware Sales
**GET** `/hardware-sales?page=1&limit=10`

Retrieves paginated list of hardware sales.

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Hardware sales retrieved successfully",
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

### Get Specific Hardware Sale
**GET** `/hardware-sales/:HardwareSale_id`

Retrieves details of a specific hardware sale.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Hardware sale retrieved successfully",
  "data": { ... }
}
```

---

### Update Hardware Sale
**PUT** `/hardware-sales/:HardwareSale_id`

Updates hardware sale status and details.

**Request Body:**
```json
{
  "payment_status": "Completed",
  "delivery_date": "2026-02-10",
  "notes": "Delivered successfully"
}
```

**Response:** `200 OK`

---

### Delete Hardware Sale
**DELETE** `/hardware-sales/:HardwareSale_id`

Deletes a hardware sale record.

**Response:** `200 OK`

---

## 2. Software Subscriptions

### Create Subscription
**POST** `/subscriptions/create`

Creates a new software subscription.

**Request Body:**
```json
{
  "merchant_id": 123,
  "plan_tier": "Professional",
  "billing_cycle": "Annual",
  "monthly_price": 50000,
  "quarterly_price": 135000,
  "annual_price": 500000,
  "discount_percentage": 15,
  "payment_method": "Bank_Transfer",
  "auto_renew": true
}
```

**Required Fields:**
- `merchant_id` (number)
- `plan_tier` (enum: 'Basic', 'Standard', 'Professional', 'Enterprise')
- `billing_cycle` (enum: 'Monthly', 'Quarterly', 'Annual')
- `payment_method` (enum: 'Bank_Transfer', 'Card', 'Cash', 'Mobile_Money')
- Price field matching billing cycle (monthly_price, quarterly_price, or annual_price)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Software subscription created successfully",
  "data": {
    "SoftwareSubscription_id": 1,
    "merchant_id": 123,
    "plan_tier": "Professional",
    "billing_cycle": "Annual",
    "billing_price": 500000,
    "discount_amount": 75000,
    "final_billing_amount": 425000,
    "subscription_start_date": "2026-02-03T10:30:00.000Z",
    "subscription_end_date": "2027-02-03T10:30:00.000Z",
    "subscription_status": "Active",
    "payment_status": "Pending"
  }
}
```

---

### Get All Subscriptions
**GET** `/subscriptions?page=1&limit=10&status=Active`

Retrieves paginated list of subscriptions.

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `status` (string, optional, default: 'Active')

**Response:** `200 OK`

---

### Get Specific Subscription
**GET** `/subscriptions/:SoftwareSubscription_id`

Retrieves details of a specific subscription.

**Response:** `200 OK`

---

### Update Subscription
**PUT** `/subscriptions/:SoftwareSubscription_id`

Updates subscription details.

**Request Body:**
```json
{
  "plan_tier": "Enterprise",
  "billing_cycle": "Annual",
  "annual_price": 800000,
  "discount_percentage": 20,
  "auto_renew": true,
  "subscription_status": "Active"
}
```

**Response:** `200 OK`

---

### Cancel Subscription
**POST** `/subscriptions/:SoftwareSubscription_id/cancel`

Cancels an active subscription.

**Request Body:**
```json
{
  "cancellation_reason": "Customer request - switching provider"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "subscription_status": "Cancelled",
    "cancellation_date": "2026-02-03T10:30:00.000Z",
    "cancellation_reason": "Customer request - switching provider"
  }
}
```

---

### Renew Subscription
**POST** `/subscriptions/:SoftwareSubscription_id/renew`

Renews a subscription for another billing cycle.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Subscription renewed successfully",
  "data": {
    "renewal_info": {
      "previous_period_end": "2027-02-03T10:30:00.000Z",
      "new_period_start": "2027-02-04T10:30:00.000Z",
      "new_period_end": "2028-02-04T10:30:00.000Z",
      "billing_cycle": "Annual",
      "billing_amount": 500000,
      "discount_amount": 75000,
      "final_amount": 425000
    },
    "updated_subscription": { ... }
  }
}
```

---

### Pause Subscription
**POST** `/subscriptions/:SoftwareSubscription_id/pause`

Temporarily pauses a subscription.

**Request Body:**
```json
{
  "pause_reason": "Seasonal business closure",
  "pause_duration_days": 60
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Subscription paused successfully",
  "data": {
    "pause_info": {
      "pause_start_date": "2026-02-03T10:30:00.000Z",
      "pause_end_date": "2026-04-04T10:30:00.000Z",
      "pause_duration_days": 60,
      "pause_reason": "Seasonal business closure",
      "resumption_date": "2026-04-04T10:30:00.000Z"
    },
    "subscription_status": "Paused"
  }
}
```

---

### Delete Subscription
**DELETE** `/subscriptions/:SoftwareSubscription_id`

Permanently deletes a subscription record.

**Response:** `200 OK`

---

## 3. Add-On Modules

### Create Add-On Module
**POST** `/addons/create`

Activates a new add-on module for a merchant.

**Request Body:**
```json
{
  "merchant_id": 123,
  "module_name": "Inventory Management",
  "billing_cycle": "Monthly",
  "monthly_price": 15000,
  "annual_price": 150000,
  "discount_percentage": 10,
  "payment_method": "Bank_Transfer",
  "auto_renew": true
}
```

**Required Fields:**
- `merchant_id` (number)
- `module_name` (enum: 'Inventory Management', 'Online Ordering', 'Kitchen Display', 'Customer Loyalty', 'Analytics Dashboard', 'Multi-Location')
- `billing_cycle` (enum: 'Monthly', 'Annual')
- `payment_method` (enum: 'Bank_Transfer', 'Card', 'Cash', 'Mobile_Money')
- Price field matching billing cycle

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Add-on module activated successfully",
  "data": {
    "AddOnModule_id": 1,
    "merchant_id": 123,
    "module_name": "Inventory Management",
    "billing_price": 15000,
    "final_billing_amount": 13500,
    "addon_status": "Active",
    "subscription_start_date": "2026-02-03T10:30:00.000Z",
    "subscription_end_date": "2026-03-03T10:30:00.000Z"
  }
}
```

---

### Get All Add-Ons
**GET** `/addons?page=1&limit=10&merchant_id=123`

Retrieves paginated list of add-on modules.

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `merchant_id` (number, optional)

**Response:** `200 OK`

---

### Get Specific Add-On Module
**GET** `/addons/:AddOnModule_id`

Retrieves details of a specific add-on module.

**Response:** `200 OK`

---

### Update Add-On Module
**PUT** `/addons/:AddOnModule_id`

Updates add-on module details.

**Request Body:**
```json
{
  "billing_cycle": "Annual",
  "annual_price": 150000,
  "discount_percentage": 15,
  "auto_renew": false,
  "addon_status": "Active"
}
```

**Response:** `200 OK`

---

### Delete Add-On Module
**DELETE** `/addons/:AddOnModule_id`

Deletes an add-on module record.

**Response:** `200 OK`

---

## 4. Professional Services

### Create Professional Service
**POST** `/services/create`

Schedules a new professional service appointment.

**Request Body:**
```json
{
  "merchant_id": 123,
  "service_type": "Installation",
  "service_description": "POS system installation and training",
  "estimated_hours": 4,
  "hourly_rate": 25000,
  "materials_cost": 50000,
  "travel_cost": 10000,
  "discount_percentage": 5,
  "payment_method": "Bank_Transfer",
  "service_date": "2026-02-10T09:00:00Z",
  "assigned_technician_id": 789
}
```

**Required Fields:**
- `merchant_id` (number)
- `service_type` (enum: 'Installation', 'Training', 'Maintenance', 'Repair', 'Consultation', 'Upgrade')
- `estimated_hours` (number)
- `hourly_rate` (number)
- `payment_method` (enum: 'Bank_Transfer', 'Card', 'Cash', 'Mobile_Money')
- `assigned_technician_id` (number)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Professional service scheduled successfully",
  "data": {
    "ProfessionalService_id": 1,
    "merchant_id": 123,
    "service_type": "Installation",
    "service_cost": 100000,
    "total_cost": 160000,
    "discount_amount": 8000,
    "final_amount": 152000,
    "payment_status": "Pending",
    "service_status": "Scheduled",
    "service_date": "2026-02-10T09:00:00.000Z"
  }
}
```

---

### Get All Services
**GET** `/services?page=1&limit=10`

Retrieves paginated list of professional services.

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Response:** `200 OK`

---

### Get Specific Service
**GET** `/services/:ProfessionalService_id`

Retrieves details of a specific professional service.

**Response:** `200 OK`

---

### Update Professional Service
**PUT** `/services/:ProfessionalService_id`

Updates service details and status.

**Request Body:**
```json
{
  "service_status": "In_Progress",
  "service_date": "2026-02-11T09:00:00Z",
  "estimated_hours": 5,
  "materials_cost": 60000
}
```

**Allowed service_status values:**
- `Scheduled`
- `In_Progress`
- `Completed`
- `Cancelled`

**Response:** `200 OK`

---

### Mark Service as Complete
**POST** `/services/:ProfessionalService_id/complete`

Marks a professional service as completed and payment as completed.

**Request Body:**
```json
{
  "completion_notes": "Installation completed successfully. Client trained on all features."
}
```

**Optional Fields:**
- `completion_notes` (string)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Professional service marked as complete",
  "data": {
    "ProfessionalService_id": 1,
    "service_status": "Completed",
    "payment_status": "Completed",
    "completion_date": "2026-02-10T14:30:00.000Z",
    "notes": "Installation completed successfully. Client trained on all features."
  }
}
```

---

### Record Partial Payment
**POST** `/services/:ProfessionalService_id/partial-payment`

Records a partial payment for a professional service.

**Request Body:**
```json
{
  "partial_amount": 75000,
  "payment_notes": "First installment received via bank transfer"
}
```

**Required Fields:**
- `partial_amount` (number, must be > 0 and <= final_amount)

**Optional Fields:**
- `payment_notes` (string)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Partial payment recorded successfully",
  "data": {
    "service": {
      "ProfessionalService_id": 1,
      "payment_status": "Partial",
      "final_amount": 152000
    },
    "payment_info": {
      "partial_amount_paid": 75000,
      "remaining_amount": 77000,
      "total_amount": 152000
    }
  }
}
```

**Error Cases:**
- `400` - If partial_amount exceeds final_amount
- `400` - If partial_amount is not provided or <= 0
- `404` - If service not found

---

### Delete Professional Service
**DELETE** `/services/:ProfessionalService_id`

Deletes a professional service record.

**Response:** `200 OK`

---

## 5. Customer Transactions

### Record Customer Transaction
**POST** `/transactions/record`

Records a customer transaction (payment processing).

**Request Body:**
```json
{
  "merchant_id": 123,
  "order_id": 456,
  "customer_id": 789,
  "transaction_amount": 50000,
  "payment_method_used": "Mobile_Money",
  "payment_provider": "MTN Mobile Money",
  "merchant_reference": "MER-2024-001",
  "provider_reference": "MTN-TXN-12345",
  "currency": "XOF"
}
```

**Required Fields:**
- `merchant_id` (number)
- `customer_id` (number)
- `transaction_amount` (number)
- `payment_method_used` (enum: 'Bank_Transfer', 'Card', 'Cash', 'Mobile_Money', 'Digital_Wallet')

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Customer transaction recorded successfully",
  "data": {
    "CustomerTransaction_id": 1,
    "transaction_amount": 50000,
    "transaction_status": "Pending",
    "settlement_status": "Not_Settled",
    "currency": "XOF",
    "transaction_date": "2026-02-03T10:30:00.000Z"
  }
}
```

---

### Get Transactions by Merchant
**GET** `/transactions/merchant/:merchant_id?page=1&limit=10`

Retrieves all transactions for a specific merchant.

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Response:** `200 OK`

---

### Get Specific Transaction
**GET** `/transactions/:CustomerTransaction_id`

Retrieves details of a specific transaction.

**Response:** `200 OK`

---

### Update Customer Transaction
**PUT** `/transactions/:CustomerTransaction_id`

Updates transaction status.

**Request Body:**
```json
{
  "transaction_status": "Completed",
  "settlement_status": "Settled"
}
```

**Transaction Status Options:**
- `Pending`
- `Completed`
- `Failed`

**Settlement Status Options:**
- `Not_Settled`
- `Settled`
- `Disputed`

**Response:** `200 OK`

---

### Delete Customer Transaction
**DELETE** `/transactions/:CustomerTransaction_id`

Deletes a transaction record.

**Response:** `200 OK`

---

## 6. Revenue Summary

### Generate Revenue Summary
**POST** `/revenue-summary/generate`

Generates a revenue summary report for a specific period.

**Request Body:**
```json
{
  "summary_period": "Monthly",
  "period_start_date": "2026-02-01",
  "period_end_date": "2026-02-28"
}
```

**Required Fields:**
- `period_start_date` (date string)
- `period_end_date` (date string)

**Optional Fields:**
- `summary_period` (enum: 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual', default: 'Monthly')

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Revenue summary generated successfully",
  "data": {
    "RevenueSummary_id": 1,
    "summary_period": "Monthly",
    "period_start_date": "2026-02-01T00:00:00.000Z",
    "period_end_date": "2026-02-28T23:59:59.000Z",
    "hardware_sales_count": 15,
    "hardware_sales_revenue": 4500000,
    "active_subscriptions": 50,
    "subscription_revenue": 2500000,
    "addon_modules_active": 30,
    "addon_modules_revenue": 450000,
    "professional_services_count": 8,
    "professional_services_revenue": 1200000,
    "total_revenue": 8650000,
    "CreateAt": "2026-02-03T10:30:00.000Z"
  }
}
```

---

### Get Revenue Summaries
**GET** `/revenue-summary?page=1&limit=10`

Retrieves paginated list of revenue summaries.

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

**Response:** `200 OK`

---

### Get Specific Revenue Summary
**GET** `/revenue-summary/:RevenueSummary_id`

Retrieves details of a specific revenue summary.

**Response:** `200 OK`

---

### Delete Revenue Summary
**DELETE** `/revenue-summary/:RevenueSummary_id`

Deletes a revenue summary record.

**Response:** `200 OK`

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: merchant_id, hardware_type"
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
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating resource",
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

1. All monetary values are in the merchant's local currency (default: XOF - West African CFA Franc)
2. All dates are in ISO 8601 format
3. Pagination is available on list endpoints
4. Soft delete is used - records are marked as `Status: false` instead of being removed
5. All create/update operations track `CreateBy` and `UpdatedBy` using the authenticated user's ID

---

## Change Log

### 2026-02-03
- Added `/services/:id/complete` endpoint for marking services as complete
- Added `/services/:id/partial-payment` endpoint for recording partial payments
- Updated documentation with new endpoints
