# API Authentication and User Management

This document outlines the APIs for user authentication, registration, and management.

## Base URL
All endpoints are prefixed with `/api/user`

## Endpoints

### Authentication

#### Login User
- **Method:** POST
- **Path:** `/login`
- **Auth Required:** No
- **Description:** Authenticate a user and return a token.

#### Login Restaurant
- **Method:** POST
- **Path:** `/login-restaurant`
- **Auth Required:** No
- **Description:** Authenticate a restaurant admin.

#### Login Employee
- **Method:** POST
- **Path:** `/login-employee`
- **Auth Required:** No
- **Description:** Authenticate an employee.

#### Login Admin
- **Method:** POST
- **Path:** `/login-admin`
- **Auth Required:** No
- **Description:** Authenticate an admin user.

#### Logout
- **Method:** POST
- **Path:** `/logout`
- **Auth Required:** Yes
- **Description:** Logout the current user.

### Password Management

#### Change Password
- **Method:** PUT
- **Path:** `/change-password`
- **Auth Required:** Yes
- **Description:** Change the password for the authenticated user.

#### Send Forget Password OTP
- **Method:** POST
- **Path:** `/forget-password/send-otp`
- **Auth Required:** No
- **Description:** Send OTP for password reset.

#### Verify OTP
- **Method:** POST
- **Path:** `/forget-password/verify-otp`
- **Auth Required:** No
- **Description:** Verify the OTP for password reset.

#### Resend OTP
- **Method:** POST
- **Path:** `/forget-password/resend-otp`
- **Auth Required:** No
- **Description:** Resend OTP for password reset.

### User Management

#### Create User
- **Method:** POST
- **Path:** `/create`
- **Auth Required:** No (for registration)
- **Description:** Create a new user account.

#### Register Restaurant
- **Method:** POST
- **Path:** `/register-restaurant`
- **Auth Required:** No
- **Description:** Register a new restaurant.

#### Get All Users
- **Method:** GET
- **Path:** `/getall`
- **Auth Required:** Yes
- **Description:** Get all users with pagination and search.

#### Get User by ID
- **Method:** GET
- **Path:** `/getbyid/:id`
- **Auth Required:** Yes
- **Description:** Get a specific user by ID.

#### Get User by Auth
- **Method:** GET
- **Path:** `/getbyauth`
- **Auth Required:** Yes
- **Description:** Get the current authenticated user.

#### Get Users by Role ID
- **Method:** GET
- **Path:** `/getbyroleid/:roleId`
- **Auth Required:** No
- **Description:** Get users by their role ID.

#### Update User
- **Method:** PUT
- **Path:** `/update`
- **Auth Required:** Yes
- **Description:** Update user information.

#### Delete User
- **Method:** DELETE
- **Path:** `/delete/:id`
- **Auth Required:** Yes
- **Description:** Permanently delete a user.

#### Deactivate User
- **Method:** PATCH
- **Path:** `/deactivate/:id`
- **Auth Required:** Yes
- **Description:** Soft delete (deactivate) a user.

#### Activate User
- **Method:** PATCH
- **Path:** `/activate/:id`
- **Auth Required:** Yes
- **Description:** Activate a deactivated user.

### Employee Management

#### Create Employee
- **Method:** POST
- **Path:** `/createEmployee`
- **Auth Required:** Yes
- **Description:** Create a new employee.

#### Get Employees by Restaurant ID
- **Method:** GET
- **Path:** `/employees/:restaurantId`
- **Auth Required:** Yes
- **Description:** Get all employees for a specific restaurant.

#### Get Employees by Client ID
- **Method:** GET
- **Path:** `/employees/client/:clientId`
- **Auth Required:** Yes
- **Description:** Get employees by client ID, categorized by role with details, timing, and performance.

#### Get Employee Details by ID
- **Method:** GET
- **Path:** `/employeedetailsbyid/:id`
- **Auth Required:** Yes
- **Description:** Get detailed employee information including responsibilities and work details.

#### Change Password Restaurant by Admin
- **Method:** PUT
- **Path:** `/changePasswordRestaurantByAdmin`
- **Auth Required:** Yes
- **Description:** Admin changes password for a restaurant user.
