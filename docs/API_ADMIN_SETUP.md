# API Admin Setup

This document outlines the APIs for administrative setup and configuration.

## Base URL
All endpoints are prefixed with `/api/admin`

## Categories

### Roles and Responsibilities

#### Role Management
- **Method:** POST
- **Path:** `/role/create`
- **Auth Required:** Yes
- **Description:** Create a new role.

- **Method:** PUT
- **Path:** `/role/update`
- **Auth Required:** Yes
- **Description:** Update an existing role.

- **Method:** GET
- **Path:** `/role/get/:id`
- **Auth Required:** Yes
- **Description:** Get role by ID.

- **Method:** GET
- **Path:** `/role/getall`
- **Auth Required:** No
- **Description:** Get all roles.

- **Method:** GET
- **Path:** `/role/getbyauth`
- **Auth Required:** Yes
- **Description:** Get roles by authenticated user.

- **Method:** DELETE
- **Path:** `/role/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete a role.

#### Responsibility Management
- **Method:** POST
- **Path:** `/responsibility/create`
- **Auth Required:** Yes
- **Description:** Create a new responsibility.

- **Method:** PUT
- **Path:** `/responsibility/update`
- **Auth Required:** Yes
- **Description:** Update an existing responsibility.

- **Method:** GET
- **Path:** `/responsibility/get/:id`
- **Auth Required:** Yes
- **Description:** Get responsibility by ID.

- **Method:** GET
- **Path:** `/responsibility/getall`
- **Auth Required:** No
- **Description:** Get all responsibilities.

- **Method:** GET
- **Path:** `/responsibility/getbyauth`
- **Auth Required:** Yes
- **Description:** Get responsibilities by authenticated user.

- **Method:** DELETE
- **Path:** `/responsibility/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete a responsibility.

### Geographic Data

#### Country Management
- **Method:** POST
- **Path:** `/country/create`
- **Auth Required:** Yes
- **Description:** Create a new country.

- **Method:** PUT
- **Path:** `/country/update`
- **Auth Required:** Yes
- **Description:** Update an existing country.

- **Method:** GET
- **Path:** `/country/get/:id`
- **Auth Required:** Yes
- **Description:** Get country by ID.

- **Method:** GET
- **Path:** `/country/getall`
- **Auth Required:** No
- **Description:** Get all countries.

- **Method:** GET
- **Path:** `/country/getbyauth`
- **Auth Required:** Yes
- **Description:** Get countries by authenticated user.

- **Method:** DELETE
- **Path:** `/country/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete a country.

#### State Management
- **Method:** POST
- **Path:** `/state/create`
- **Auth Required:** Yes
- **Description:** Create a new state.

- **Method:** PUT
- **Path:** `/state/update`
- **Auth Required:** Yes
- **Description:** Update an existing state.

- **Method:** GET
- **Path:** `/state/get/:id`
- **Auth Required:** Yes
- **Description:** Get state by ID.

- **Method:** GET
- **Path:** `/state/getall`
- **Auth Required:** No
- **Description:** Get all states.

- **Method:** GET
- **Path:** `/state/getbyauth`
- **Auth Required:** Yes
- **Description:** Get states by authenticated user.

- **Method:** DELETE
- **Path:** `/state/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete a state.

#### City Management
- **Method:** POST
- **Path:** `/city/create`
- **Auth Required:** Yes
- **Description:** Create a new city.

- **Method:** PUT
- **Path:** `/city/update`
- **Auth Required:** Yes
- **Description:** Update an existing city.

- **Method:** GET
- **Path:** `/city/get/:id`
- **Auth Required:** Yes
- **Description:** Get city by ID.

- **Method:** GET
- **Path:** `/city/getall`
- **Auth Required:** No
- **Description:** Get all cities.

- **Method:** GET
- **Path:** `/city/getbyauth`
- **Auth Required:** Yes
- **Description:** Get cities by authenticated user.

- **Method:** DELETE
- **Path:** `/city/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete a city.

### Items and Types

#### Items Types Management
- **Method:** POST
- **Path:** `/items_types/create`
- **Auth Required:** Yes
- **Description:** Create a new item type.
