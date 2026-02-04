# API Restaurant Setup

This document outlines the APIs for restaurant management and configuration.

## Base URL
All endpoints are prefixed with `/api/restaurant`

## Categories

### Store Management

#### Store Details Management
- **Method:** POST
- **Path:** `/store_details/create`
- **Auth Required:** Yes
- **Description:** Create store details.

- **Method:** PUT
- **Path:** `/store_details/update`
- **Auth Required:** Yes
- **Description:** Update store details.

- **Method:** GET
- **Path:** `/store_details/getbyid/:id`
- **Auth Required:** Yes
- **Description:** Get store details by ID.

- **Method:** GET
- **Path:** `/store_details/getall`
- **Auth Required:** Yes
- **Description:** Get all store details.

- **Method:** GET
- **Path:** `/store_details/getbyauth`
- **Auth Required:** Yes
- **Description:** Get store details by authenticated user.

- **Method:** DELETE
- **Path:** `/store_details/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete store details.

#### Store Menu Management
- **Method:** POST
- **Path:** `/store_menu/create`
- **Auth Required:** Yes
- **Description:** Create store menu.

- **Method:** PUT
- **Path:** `/store_menu/update`
- **Auth Required:** Yes
- **Description:** Update store menu.

- **Method:** GET
- **Path:** `/store_menu/get/:id`
- **Auth Required:** Yes
- **Description:** Get store menu by ID.

- **Method:** GET
- **Path:** `/store_menu/getall`
- **Auth Required:** No
- **Description:** Get all store menus.

- **Method:** GET
- **Path:** `/store_menu/getbyauth`
- **Auth Required:** Yes
- **Description:** Get store menus by authenticated user.

- **Method:** DELETE
- **Path:** `/store_menu/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete store menu.

#### Menu Map Items Management
- **Method:** POST
- **Path:** `/menu_map_items/create`
- **Auth Required:** Yes
- **Description:** Create menu map item.

- **Method:** PUT
- **Path:** `/menu_map_items/update`
- **Auth Required:** Yes
- **Description:** Update menu map item.

- **Method:** GET
- **Path:** `/menu_map_items/get/:id`
- **Auth Required:** Yes
- **Description:** Get menu map item by ID.

- **Method:** GET
- **Path:** `/menu_map_items/getall`
- **Auth Required:** No
- **Description:** Get all menu map items.

- **Method:** GET
- **Path:** `/menu_map_items/getbyauth`
- **Auth Required:** Yes
- **Description:** Get menu map items by authenticated user.

- **Method:** DELETE
- **Path:** `/menu_map_items/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete menu map item.

### Kitchen Management

#### Kitchen Type Management
- **Method:** POST
- **Path:** `/kitchen_type/create`
- **Auth Required:** Yes
- **Description:** Create kitchen type.

- **Method:** PUT
- **Path:** `/kitchen_type/update`
- **Auth Required:** Yes
- **Description:** Update kitchen type.

- **Method:** GET
- **Path:** `/kitchen_type/get/:id`
- **Auth Required:** Yes
- **Description:** Get kitchen type by ID.

- **Method:** GET
- **Path:** `/kitchen_type/getall`
- **Auth Required:** No
- **Description:** Get all kitchen types.

- **Method:** GET
- **Path:** `/kitchen_type/getbyauth`
- **Auth Required:** Yes
- **Description:** Get kitchen types by authenticated user.

- **Method:** DELETE
- **Path:** `/kitchen_type/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete kitchen type.

#### Kitchen Management
- **Method:** POST
- **Path:** `/kitchen/create`
- **Auth Required:** Yes
- **Description:** Create kitchen.

- **Method:** PUT
- **Path:** `/kitchen/update`
- **Auth Required:** Yes
- **Description:** Update kitchen.

- **Method:** GET
- **Path:** `/kitchen/get/:id`
- **Auth Required:** Yes
- **Description:** Get kitchen by ID.

- **Method:** GET
- **Path:** `/kitchen/getall`
- **Auth Required:** No
- **Description:** Get all kitchens.

- **Method:** GET
- **Path:** `/kitchen/getbyauth`
- **Auth Required:** Yes
- **Description:** Get kitchens by authenticated user.

- **Method:** DELETE
- **Path:** `/kitchen/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete kitchen.

### Items Management

#### Item Variants Management
- **Method:** POST
- **Path:** `/item_variants/create`
- **Auth Required:** Yes
- **Description:** Create item variant.

- **Method:** PUT
- **Path:** `/item_variants/update`
- **Auth Required:** Yes
- **Description:** Update item variant.

- **Method:** GET
- **Path:** `/item_variants/get/:id`
- **Auth Required:** Yes
- **Description:** Get item variant by ID.

- **Method:** GET
- **Path:** `/item_variants/getall`
- **Auth Required:** No
- **Description:** Get all item variants.

- **Method:** GET
- **Path:** `/item_variants/getbyauth`
- **Auth Required:** Yes
- **Description:** Get item variants by authenticated user.

- **Method:** DELETE
- **Path:** `/item_variants/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete item variant.

#### Item Addons Management
- **Method:** POST
- **Path:** `/item_addons/create`
- **Auth Required:** Yes
- **Description:** Create item addon.

- **Method:** PUT
- **Path:** `/item_addons/update`
- **Auth Required:** Yes
- **Description:** Update item addon.

- **Method:** GET
- **Path:** `/item_addons/get/:id`
- **Auth Required:** Yes
- **Description:** Get item addon by ID.

- **Method:** GET
- **Path:** `/item_addons/getall`
- **Auth Required:** No
- **Description:** Get all item addons.

- **Method:** GET
- **Path:** `/item_addons/getbyauth`
- **Auth Required:** Yes
- **Description:** Get item addons by authenticated user.

- **Method:** DELETE
- **Path:** `/item_addons/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete item addon.

#### Item Map Variants Management
- **Method:** POST
- **Path:** `/item_map_variants/create`
- **Auth Required:** Yes
- **Description:** Create item map variant.

- **Method:** PUT
- **Path:** `/item_map_variants/update`
- **Auth Required:** Yes
- **Description:** Update item map variant.

- **Method:** GET
- **Path:** `/item_map_variants/get/:id`
- **Auth Required:** Yes
- **Description:** Get item map variant by ID.

- **Method:** GET
- **Path:** `/item_map_variants/getall`
- **Auth Required:** No
- **Description:** Get all item map variants.

- **Method:** GET
- **Path:** `/item_map_variants/getbyauth`
- **Auth Required:** Yes
- **Description:** Get item map variants by authenticated user.

- **Method:** DELETE
- **Path:** `/item_map_variants/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete item map variant.

#### Item Map Addons Management
- **Method:** POST
- **Path:** `/item_map_addons/create`
- **Auth Required:** Yes
- **Description:** Create item map addon.

- **Method:** PUT
- **Path:** `/item_map_addons/update`
- **Auth Required:** Yes
- **Description:** Update item map addon.

- **Method:** GET
- **Path:** `/item_map_addons/get/:id`
- **Auth Required:** Yes
- **Description:** Get item map addon by ID.

- **Method:** GET
- **Path:** `/item_map_addons/getall`
- **Auth Required:** No
- **Description:** Get all item map addons.

- **Method:** GET
- **Path:** `/item_map_addons/getbyauth`
- **Auth Required:** Yes
- **Description:** Get item map addons by authenticated user.

- **Method:** DELETE
- **Path:** `/item_map_addons/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete item map addon.

### Customer Management

#### Customer Management
- **Method:** POST
- **Path:** `/customer/create`
- **Auth Required:** Yes
- **Description:** Create customer.

- **Method:** PUT
- **Path:** `/customer/update`
- **Auth Required:** Yes
- **Description:** Update customer.

- **Method:** GET
- **Path:** `/customer/get/:id`
- **Auth Required:** Yes
- **Description:** Get customer by ID.

- **Method:** GET
- **Path:** `/customer/getall`
- **Auth Required:** No
- **Description:** Get all customers.

- **Method:** GET
- **Path:** `/customer/getbyauth`
- **Auth Required:** Yes
- **Description:** Get customers by authenticated user.

- **Method:** DELETE
- **Path:** `/customer/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete customer.

### Permissions and Roles

#### Permissions Type Management
- **Method:** POST
- **Path:** `/permissions_type/create`
- **Auth Required:** Yes
- **Description:** Create permissions type.

- **Method:** PUT
- **Path:** `/permissions_type/update`
- **Auth Required:** Yes
- **Description:** Update permissions type.

- **Method:** GET
- **Path:** `/permissions_type/get/:id`
- **Auth Required:** Yes
- **Description:** Get permissions type by ID.

- **Method:** GET
- **Path:** `/permissions_type/getall`
- **Auth Required:** No
- **Description:** Get all permissions types.

- **Method:** GET
- **Path:** `/permissions_type/getbyauth`
- **Auth Required:** Yes
- **Description:** Get permissions types by authenticated user.

- **Method:** DELETE
- **Path:** `/permissions_type/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete permissions type.

#### Permissions Type Map with Employee Management
- **Method:** POST
- **Path:** `/permissions_type_map_with_employee/create`
- **Auth Required:** Yes
- **Description:** Create permissions type map with employee.

- **Method:** PUT
- **Path:** `/permissions_type_map_with_employee/update`
- **Auth Required:** Yes
- **Description:** Update permissions type map with employee.

- **Method:** GET
- **Path:** `/permissions_type_map_with_employee/get/:id`
- **Auth Required:** Yes
- **Description:** Get permissions type map with employee by ID.

- **Method:** GET
- **Path:** `/permissions_type_map_with_employee/getall`
- **Auth Required:** No
- **Description:** Get all permissions type maps with employee.

- **Method:** GET
- **Path:** `/permissions_type_map_with_employee/getbyauth`
- **Auth Required:** Yes
- **Description:** Get permissions type maps with employee by authenticated user.

- **Method:** DELETE
- **Path:** `/permissions_type_map_with_employee/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete permissions type map with employee.

### Payment and Tax Management

#### Payment Type Management
- **Method:** POST
- **Path:** `/payment_type/create`
- **Auth Required:** Yes
- **Description:** Create payment type.

- **Method:** PUT
- **Path:** `/payment_type/update`
- **Auth Required:** Yes
- **Description:** Update payment type.

- **Method:** GET
- **Path:** `/payment_type/get/:id`
- **Auth Required:** Yes
- **Description:** Get payment type by ID.

- **Method:** GET
- **Path:** `/payment_type/getall`
- **Auth Required:** No
- **Description:** Get all payment types.

- **Method:** GET
- **Path:** `/payment_type/getbyauth`
- **Auth Required:** Yes
- **Description:** Get payment types by authenticated user.

- **Method:** DELETE
- **Path:** `/payment_type/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete payment type.

#### Payment Options Management
- **Method:** POST
- **Path:** `/payment_options/create`
- **Auth Required:** Yes
- **Description:** Create payment option.

- **Method:** PUT
- **Path:** `/payment_options/update`
- **Auth Required:** Yes
- **Description:** Update payment option.

- **Method:** GET
- **Path:** `/payment_options/get/:id`
- **Auth Required:** Yes
- **Description:** Get payment option by ID.

- **Method:** GET
- **Path:** `/payment_options/getall`
- **Auth Required:** No
- **Description:** Get all payment options.

- **Method:** GET
- **Path:** `/payment_options/getbyauth`
- **Auth Required:** Yes
- **Description:** Get payment options by authenticated user.

- **Method:** DELETE
- **Path:** `/payment_options/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete payment option.

#### Payment by Restaurant Management
- **Method:** POST
- **Path:** `/payment_by_restaurant/create`
- **Auth Required:** Yes
- **Description:** Create payment by restaurant.

- **Method:** PUT
- **Path:** `/payment_by_restaurant/update`
- **Auth Required:** Yes
- **Description:** Update payment by restaurant.

- **Method:** GET
- **Path:** `/payment_by_restaurant/get/:id`
- **Auth Required:** Yes
- **Description:** Get payment by restaurant by ID.

- **Method:** GET
- **Path:** `/payment_by_restaurant/getall`
- **Auth Required:** No
- **Description:** Get all payments by restaurant.

- **Method:** GET
- **Path:** `/payment_by_restaurant/getbyauth`
- **Auth Required:** Yes
- **Description:** Get payments by restaurant by authenticated user.

- **Method:** DELETE
- **Path:** `/payment_by_restaurant/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete payment by restaurant.

#### Tax Setup Management
- **Method:** POST
- **Path:** `/tax_setup/create`
- **Auth Required:** Yes
- **Description:** Create tax setup.

- **Method:** PUT
- **Path:** `/tax_setup/update`
- **Auth Required:** Yes
- **Description:** Update tax setup.

- **Method:** GET
- **Path:** `/tax_setup/get/:id`
- **Auth Required:** Yes
- **Description:** Get tax setup by ID.

- **Method:** GET
- **Path:** `/tax_setup/getall`
- **Auth Required:** No
- **Description:** Get all tax setups.

- **Method:** GET
- **Path:** `/tax_setup/getbyauth`
- **Auth Required:** Yes
- **Description:** Get tax setups by authenticated user.

- **Method:** DELETE
- **Path:** `/tax_setup/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete tax setup.

### Other Restaurant Setup

#### Delivery Type Management
- **Method:** POST
- **Path:** `/delivery_type/create`
- **Auth Required:** Yes
- **Description:** Create delivery type.

- **Method:** PUT
- **Path:** `/delivery_type/update`
- **Auth Required:** Yes
- **Description:** Update delivery type.

- **Method:** GET
- **Path:** `/delivery_type/get/:id`
- **Auth Required:** Yes
- **Description:** Get delivery type by ID.

- **Method:** GET
- **Path:** `/delivery_type/getall`
- **Auth Required:** No
- **Description:** Get all delivery types.

- **Method:** GET
- **Path:** `/delivery_type/getbyauth`
- **Auth Required:** Yes
- **Description:** Get delivery types by authenticated user.

- **Method:** DELETE
- **Path:** `/delivery_type/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete delivery type.

#### Tokens Management
- **Method:** POST
- **Path:** `/tokens/create`
- **Auth Required:** Yes
- **Description:** Create token.

- **Method:** PUT
- **Path:** `/tokens/update`
- **Auth Required:** Yes
- **Description:** Update token.

- **Method:** GET
- **Path:** `/tokens/get/:id`
- **Auth Required:** Yes
- **Description:** Get token by ID.

- **Method:** GET
- **Path:** `/tokens/getall`
- **Auth Required:** No
- **Description:** Get all tokens.

- **Method:** GET
- **Path:** `/tokens/getbyauth`
- **Auth Required:** Yes
- **Description:** Get tokens by authenticated user.

- **Method:** DELETE
- **Path:** `/tokens/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete token.

#### Print Settings Management
- **Method:** POST
- **Path:** `/print_settings/create`
- **Auth Required:** Yes
- **Description:** Create print settings.

- **Method:** PUT
- **Path:** `/print_settings/update`
- **Auth Required:** Yes
- **Description:** Update print settings.

- **Method:** GET
- **Path:** `/print_settings/get/:id`
- **Auth Required:** Yes
- **Description:** Get print settings by ID.

- **Method:** GET
- **Path:** `/print_settings/getall`
- **Auth Required:** No
- **Description:** Get all print settings.

- **Method:** GET
- **Path:** `/print_settings/getbyauth`
- **Auth Required:** Yes
- **Description:** Get print settings by authenticated user.

- **Method:** DELETE
- **Path:** `/print_settings/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete print settings.

#### Restaurant Slot Management
- **Method:** POST
- **Path:** `/restaurant_slot/create`
- **Auth Required:** Yes
- **Description:** Create restaurant slot.

- **Method:** PUT
- **Path:** `/restaurant_slot/update`
- **Auth Required:** Yes
- **Description:** Update restaurant slot.

- **Method:** GET
- **Path:** `/restaurant_slot/get/:id`
- **Auth Required:** Yes
- **Description:** Get restaurant slot by ID.

- **Method:** GET
- **Path:** `/restaurant_slot/getall`
- **Auth Required:** No
- **Description:** Get all restaurant slots.

- **Method:** GET
- **Path:** `/restaurant_slot/getbyauth`
- **Auth Required:** Yes
- **Description:** Get restaurant slots by authenticated user.

- **Method:** DELETE
- **Path:** `/restaurant_slot/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete restaurant slot.

#### Admin Plan Buy Restaurant Management
- **Method:** POST
- **Path:** `/admin_plan_buy_restaurant/create`
- **Auth Required:** Yes
- **Description:** Create admin plan buy restaurant.

- **Method:** PUT
- **Path:** `/admin_plan_buy_restaurant/update`
- **Auth Required:** Yes
- **Description:** Update admin plan buy restaurant.

- **Method:** GET
- **Path:** `/admin_plan_buy_restaurant/get/:id`
- **Auth Required:** Yes
- **Description:** Get admin plan buy restaurant by ID.

- **Method:** GET
- **Path:** `/admin_plan_buy_restaurant/getall`
- **Auth Required:** No
- **Description:** Get all admin plan buy restaurants.

- **Method:** GET
- **Path:** `/admin_plan_buy_restaurant/getbyauth`
- **Auth Required:** Yes
- **Description:** Get admin plan buy restaurants by authenticated user.

- **Method:** DELETE
- **Path:** `/admin_plan_buy_restaurant/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete admin plan buy restaurant.

#### Admin Message Management
- **Method:** POST
- **Path:** `/admin_message/create`
- **Auth Required:** Yes
- **Description:** Create admin message.

- **Method:** PUT
- **Path:** `/admin_message/update`
- **Auth Required:** Yes
- **Description:** Update admin message.

- **Method:** GET
- **Path:** `/admin_message/get/:id`
- **Auth Required:** Yes
- **Description:** Get admin message by ID.

- **Method:** GET
- **Path:** `/admin_message/getall`
- **Auth Required:** No
- **Description:** Get all admin messages.

- **Method:** GET
- **Path:** `/admin_message/getbyauth`
- **Auth Required:** Yes
- **Description:** Get admin messages by authenticated user.

- **Method:** DELETE
- **Path:** `/admin_message/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete admin message.

#### Admin Message with Client Management
- **Method:** POST
- **Path:** `/admin_message_with_client/create`
- **Auth Required:** Yes
- **Description:** Create admin message with client.

- **Method:** PUT
- **Path:** `/admin_message_with_client/update`
- **Auth Required:** Yes
- **Description:** Update admin message with client.

- **Method:** GET
- **Path:** `/admin_message_with_client/get/:id`
- **Auth Required:** Yes
- **Description:** Get admin message with client by ID.

- **Method:** GET
- **Path:** `/admin_message_with_client/getall`
- **Auth Required:** No
- **Description:** Get all admin messages with client.

- **Method:** GET
- **Path:** `/admin_message_with_client/getbyauth`
- **Auth Required:** Yes
- **Description:** Get admin messages with client by authenticated user.

- **Method:** DELETE
- **Path:** `/admin_message_with_client/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete admin message with client.

#### Employee Feedback Management
- **Method:** POST
- **Path:** `/employee_feedback/create`
- **Auth Required:** Yes
- **Description:** Create employee feedback.

- **Method:** PUT
- **Path:** `/employee_feedback/update`
- **Auth Required:** Yes
- **Description:** Update employee feedback.

- **Method:** GET
- **Path:** `/employee_feedback/get/:id`
- **Auth Required:** Yes
- **Description:** Get employee feedback by ID.

- **Method:** GET
- **Path:** `/employee_feedback/getall`
- **Auth Required:** No
- **Description:** Get all employee feedbacks.

- **Method:** GET
- **Path:** `/employee_feedback/getbyauth`
- **Auth Required:** Yes
- **Description:** Get employee feedbacks by authenticated user.

- **Method:** DELETE
- **Path:** `/employee_feedback/delete/:id`
- **Auth Required:** Yes
- **Description:** Delete employee feedback.
