# SamBring — Endpoints & Data Points Map
_Version: 0.1.0_

This document maps every endpoint to its parameters, request body fields, and response fields (data points).

---

## `/api/auth/change-password/`
### POST
**Tags:** Auth
**Summary:** Change current user's password

**Parameters**

_No parameters_

**Request Body**

_Required:_ **True**
| Field | Type | Details |
|---|---|---|
| `old_password` | `string` | required |
| `new_password1` | `string` | required |
| `new_password2` | `string` | required |

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `detail` | `string` |  |

---

## `/api/auth/login/`
### POST
**Tags:** Auth
**Summary:** Log in with email and password

**Parameters**

_No parameters_

**Request Body**

_Required:_ **True**
| Field | Type | Details |
|---|---|---|
| `email` | `string` | format=email; required |
| `password` | `string` | required |

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `id` | `integer` | required |
    | `email` | `string` | format=email |
    | `username` | `string` | required |
    | `first_name` | `string` |  |
    | `last_name` | `string` |  |

---

## `/api/auth/logout/`
### POST
**Tags:** Auth
**Summary:** Log out current user

**Parameters**

_No parameters_

**Request Body**

_None_

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `detail` | `string` |  |

---

## `/api/auth/signup/`
### POST
**Tags:** Auth
**Summary:** Create a new user (optional: attach UserRole)

**Parameters**

_No parameters_

**Request Body**

_Required:_ **True**
| Field | Type | Details |
|---|---|---|
| `email` | `string` | format=email; required |
| `password1` | `string` | required |
| `password2` | `string` | required |
| `first_name` | `string` |  |
| `last_name` | `string` |  |
| `actor_id` | `integer` |  |
| `role_id` | `integer` |  |

**Responses**

- **Status 201:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `id` | `integer` | required |
    | `email` | `string` | format=email |
    | `username` | `string` | required |
    | `first_name` | `string` |  |
    | `last_name` | `string` |  |

---

## `/api/confirm_delivery/`
### POST
**Tags:** Deliveries
**Summary:** Confirm a quoted delivery and create Delivery/Package records

**Parameters**

_No parameters_

**Request Body**

_Required:_ **True**
| Field | Type | Details |
|---|---|---|
| `uuid` | `string` | format=uuid; required |
| `packages` | `array` | items=object; required |
| `packages[].description` | `string` |  |
| `packages[].weight` | `string` | format=decimal; required |
| `packages[].height` | `string` | format=decimal; required |
| `packages[].width` | `string` | format=decimal; required |
| `packages[].length` | `string` | format=decimal; required |
| `packages[].fragile` | `boolean` |  |
| `packages[].temperature` | `string` |  |
| `sender` | `integer` |  |
| `pickup_location` | `string` |  |
| `receiver` | `string` | required |
| `receiver_phone` | `string` | required |
| `delivery_location` | `string` | required |
| `delivery_notes` | `string` |  |
| `service` | `string` | required |
| `price` | `integer` | required |

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `uuid` | `string` | format=uuid; required |
    | `status` | `string` | required |

---

## `/api/driver/deliveries/`
### GET
**Tags:** Driver Deliveries
**Summary:** Get driver deliveries

Retrieve all deliveries assigned to the authenticated driver with filtering options


**Parameters**

| Name | In | Type | Details | Description |
|---|---|---|---|---|
| `filter` | `query` | `string` | enum=['future', 'past'] | Filter deliveries by time: 'future' (default) or 'past' |

**Request Body**

_None_

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `[array items]` | `object` |  |
    | `[].type` | `string` | required |
    | `[].delivery` | `object` | required |
    | `[].delivery.id` | `integer` | required |
    | `[].delivery.sender` | `object` | required |
    | `[].delivery.receiver` | `object` | required |
    | `[].delivery.pickup_date` | `string` | format=date; nullable |
    | `[].delivery.pickup_time` | `string` | format=time; nullable |
    | `[].delivery.delivery_date` | `string` | format=date; nullable |
    | `[].delivery.delivery_time` | `string` | format=time; nullable |
    | `[].delivery.pickup_location` | `string` | nullable |
    | `[].delivery.delivery_location` | `string` | required |
    | `[].delivery.created_at` | `string` | format=date-time; required |
    | `[].delivery.updated_at` | `string` | format=date-time; required |
    | `[].packages` | `array` | items=object; required |
    | `[].packages[].id` | `integer` | required |
    | `[].packages[].description` | `string` |  |
    | `[].packages[].weight` | `string` | format=decimal; required |
    | `[].packages[].weight_unit` | `string` | enum=['kg', 'g', 'lb', 'oz'] |
    | `[].packages[].length` | `string` | format=decimal; required |
    | `[].packages[].width` | `string` | format=decimal; required |
    | `[].packages[].height` | `string` | format=decimal; required |
    | `[].packages[].dimension_unit` | `string` | enum=['cm', 'm', 'in', 'ft'] |
    | `[].packages[].temperature_range` | `string` |  |
    | `[].packages[].temperature_unit` | `string` | enum=['C', 'F'] |
    | `[].packages[].volume` | `string` | format=decimal; nullable |
    | `[].packages[].fragile` | `boolean` |  |
    | `[].packages[].hazardous` | `boolean` |  |
    | `[].packages[].delivery_status` | `object` |  |
    | `[].packages[].picked_up_at` | `string` | format=date-time; nullable |
    | `[].packages[].delivered_at` | `string` | format=date-time; nullable |
    | `[].packages[].delivered_to` | `string` | nullable |
    | `[].packages[].delivery_notes` | `string` | nullable |
    | `[].packages[].created_at` | `string` | format=date-time; required |
    | `[].packages[].updated_at` | `string` | format=date-time; required |
    | `[].location` | `string` | required |
    | `[].date` | `string` | format=date; required |
    | `[].time` | `string` | format=time; nullable; required |
    | `[].actor` | `object` | required |
    | `[].actor.id` | `integer` | required |
    | `[].actor.name` | `string` | required |
    | `[].actor.address_line1` | `string` |  |
    | `[].actor.address_line2` | `string` |  |
    | `[].actor.zip_code` | `string` |  |
    | `[].actor.city` | `string` |  |
    | `[].actor.address_country` | `integer` | nullable |
    | `[].actor.phone` | `string` |  |
    | `[].actor.email` | `string` | format=email |
    | `[].actor_type` | `string` | required |
    | `[].is_delivered` | `boolean` |  |
    | `[].pickup_location` | `string` | nullable |
    | `[].pickup_date` | `string` | format=date; nullable |
    | `[].pickup_time` | `string` | format=time; nullable |
    | `[].pickup_actor` | `object` |  |

---

## `/api/driver/profile/`
### GET
**Tags:** Driver
**Summary:** Get the authenticated user's driver profile

**Parameters**

_No parameters_

**Request Body**

_None_

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `id` | `integer` | required |
    | `user` | `object` | required |
    | `vehicle` | `object` | required |
    | `license_number` | `string` | nullable |
    | `phone` | `string` | nullable |
    | `address` | `string` | required |
    | `is_active` | `boolean` |  |
    | `start_date` | `string` | format=date; nullable |
    | `end_date` | `string` | format=date; nullable |
    | `status` | `string` | nullable |
    | `created_at` | `string` | format=date-time; required |
    | `updated_at` | `string` | format=date-time; required |

---

## `/api/packages/{package_id}/deliver/`
### POST
**Tags:** Package Status
**Summary:** Mark package as delivered

Mark a package as delivered by the authenticated driver


**Parameters**

| Name | In | Type | Details | Description |
|---|---|---|---|---|
| `package_id` | `path` | `integer` | required |  |

**Request Body**

_Required:_ **False**
| Field | Type | Details |
|---|---|---|
| `delivered_to` | `string` |  |
| `delivery_notes` | `string` |  |
| `success` | `boolean` |  |
| `message` | `string` |  |
| `new_status` | `string` |  |
| `new_status_display` | `string` |  |
| `delivered_at` | `string` |  |

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `delivered_to` | `string` |  |
    | `delivery_notes` | `string` |  |
    | `success` | `boolean` |  |
    | `message` | `string` |  |
    | `new_status` | `string` |  |
    | `new_status_display` | `string` |  |
    | `delivered_at` | `string` |  |
- **Status 400:**
  - Content-Type: `application/json`
    _No structured fields described_
- **Status 403:**
  - Content-Type: `application/json`
    _No structured fields described_
- **Status 404:**
  - Content-Type: `application/json`
    _No structured fields described_
- **Status 500:**
  - Content-Type: `application/json`
    _No structured fields described_

---

## `/api/packages/{package_id}/pickup/`
### POST
**Tags:** Package Status
**Summary:** Mark package as picked up

Mark a package as picked up by the authenticated driver


**Parameters**

| Name | In | Type | Details | Description |
|---|---|---|---|---|
| `package_id` | `path` | `integer` | required |  |

**Request Body**

_Required:_ **True**
| Field | Type | Details |
|---|---|---|
| `success` | `boolean` | required |
| `message` | `string` | required |
| `new_status` | `string` | required |
| `new_status_display` | `string` | required |
| `picked_up_at` | `string` |  |

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `success` | `boolean` | required |
    | `message` | `string` | required |
    | `new_status` | `string` | required |
    | `new_status_display` | `string` | required |
    | `picked_up_at` | `string` |  |
- **Status 400:**
  - Content-Type: `application/json`
    _No structured fields described_
- **Status 403:**
  - Content-Type: `application/json`
    _No structured fields described_
- **Status 404:**
  - Content-Type: `application/json`
    _No structured fields described_
- **Status 500:**
  - Content-Type: `application/json`
    _No structured fields described_

---

## `/api/packages/assign_package/`
### POST
**Tags:** Deliveries
**Summary:** Assign a package to the authenticated driver's account

**Parameters**

_No parameters_

**Request Body**

_Required:_ **True**
| Field | Type | Details |
|---|---|---|
| `package_id` | `integer` | required |

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `detail` | `string` |  |

---

## `/api/packages/available_packages/`
### GET
**Tags:** Deliveries
**Summary:** List available (unassigned) packages grouped by delivery

Return all packages without an assigned driver, grouped by delivery.


**Parameters**

_No parameters_

**Request Body**

_None_

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `[array items]` | `object` |  |
    | `[].delivery_id` | `integer` | required |
    | `[].uuid` | `string` | format=uuid; nullable; required |
    | `[].receiver_name` | `string` |  |
    | `[].receiver_phone` | `string` |  |
    | `[].pickup_location` | `string` |  |
    | `[].delivery_location` | `string` | required |
    | `[].service` | `string` |  |
    | `[].price` | `string` | format=decimal |
    | `[].packages` | `array` | items=object; required |
    | `[].packages[].id` | `integer` | required |
    | `[].packages[].description` | `string` |  |
    | `[].packages[].weight` | `string` | format=decimal; required |
    | `[].packages[].weight_unit` | `string` | enum=['kg', 'g', 'lb', 'oz'] |
    | `[].packages[].length` | `string` | format=decimal; required |
    | `[].packages[].width` | `string` | format=decimal; required |
    | `[].packages[].height` | `string` | format=decimal; required |
    | `[].packages[].dimension_unit` | `string` | enum=['cm', 'm', 'in', 'ft'] |
    | `[].packages[].temperature_range` | `string` |  |
    | `[].packages[].temperature_unit` | `string` | enum=['C', 'F'] |
    | `[].packages[].volume` | `string` | format=decimal; nullable |
    | `[].packages[].fragile` | `boolean` |  |
    | `[].packages[].hazardous` | `boolean` |  |
    | `[].packages[].delivery_status` | `object` |  |
    | `[].packages[].picked_up_at` | `string` | format=date-time; nullable |
    | `[].packages[].delivered_at` | `string` | format=date-time; nullable |
    | `[].packages[].delivered_to` | `string` | nullable |
    | `[].packages[].delivery_notes` | `string` | nullable |
    | `[].packages[].created_at` | `string` | format=date-time; required |
    | `[].packages[].updated_at` | `string` | format=date-time; required |

---

## `/api/request_delivery/`
### POST
**Tags:** Deliveries
**Summary:** Request delivery price options

**Parameters**

_No parameters_

**Request Body**

_Required:_ **True**
| Field | Type | Details |
|---|---|---|
| `sender_zip_code` | `string` | required |
| `receiver_zip_code` | `string` | required |
| `packages` | `array` | items=object; required |
| `packages[].weight` | `string` | format=decimal; required |
| `packages[].height` | `string` | format=decimal; required |
| `packages[].width` | `string` | format=decimal; required |
| `packages[].length` | `string` | format=decimal; required |
| `packages[].fragile` | `boolean` |  |
| `packages[].temperature` | `string` |  |

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `uuid` | `string` | format=uuid; required |
    | `services` | `array` | items=object; required |
    | `services[].service` | `string` | required |
    | `services[].price` | `integer` | required |

---

## `/api/status_delivery/`
### GET
**Tags:** Deliveries
**Summary:** Get delivery status by UUID

Get delivery status and packages by UUID.


**Parameters**

| Name | In | Type | Details | Description |
|---|---|---|---|---|
| `uuid` | `query` | `string` | required | UUID of the delivery to check status |

**Request Body**

_None_

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `id` | `integer` | required |
    | `uuid` | `string` | format=uuid; nullable; required |
    | `sender_name` | `string` | required |
    | `receiver_name` | `string` | nullable |
    | `receiver_phone` | `string` | nullable |
    | `pickup_location` | `string` | nullable |
    | `pickup_date` | `string` | format=date; nullable |
    | `pickup_time` | `string` | format=time; nullable |
    | `delivery_location` | `string` | required |
    | `delivery_date` | `string` | format=date; nullable |
    | `delivery_time` | `string` | format=time; nullable |
    | `delivery_status` | `string` | nullable |
    | `delivery_notes` | `string` | nullable |
    | `service` | `string` | nullable |
    | `price` | `string` | format=decimal; nullable |
    | `created_at` | `string` | format=date-time; required |
    | `updated_at` | `string` | format=date-time; required |
    | `packages` | `array` | items=object; required |
    | `packages[].id` | `integer` | required |
    | `packages[].description` | `string` |  |
    | `packages[].weight` | `string` | format=decimal; required |
    | `packages[].weight_unit` | `string` | enum=['kg', 'g', 'lb', 'oz'] |
    | `packages[].length` | `string` | format=decimal; required |
    | `packages[].width` | `string` | format=decimal; required |
    | `packages[].height` | `string` | format=decimal; required |
    | `packages[].dimension_unit` | `string` | enum=['cm', 'm', 'in', 'ft'] |
    | `packages[].temperature_range` | `string` |  |
    | `packages[].temperature_unit` | `string` | enum=['C', 'F'] |
    | `packages[].volume` | `string` | format=decimal; nullable |
    | `packages[].fragile` | `boolean` |  |
    | `packages[].hazardous` | `boolean` |  |
    | `packages[].delivery_status` | `object` |  |
    | `packages[].picked_up_at` | `string` | format=date-time; nullable |
    | `packages[].delivered_at` | `string` | format=date-time; nullable |
    | `packages[].delivered_to` | `string` | nullable |
    | `packages[].delivery_notes` | `string` | nullable |
    | `packages[].created_at` | `string` | format=date-time; required |
    | `packages[].updated_at` | `string` | format=date-time; required |
- **Status 404:**
  - Content-Type: `application/json`
    _No structured fields described_

---

## `/dashboard/api/user-signups/`
### GET
**Tags:** dashboard

**Parameters**

_No parameters_

**Request Body**

_None_

**Responses**

- **Status 200:**
  - Content-Type: `application/json`
    | Field | Type | Details |
    |---|---|---|
    | `[array items]` | `object` |  |
    | `[].date` | `string` | format=date; required |
    | `[].count` | `integer` | required |

---

# Components: Schemas Overview

## `Actor`
| Field | Type | Details |
|---|---|---|
| `id` | `integer` | required |
| `name` | `string` | required |
| `address_line1` | `string` |  |
| `address_line2` | `string` |  |
| `zip_code` | `string` |  |
| `city` | `string` |  |
| `address_country` | `integer` | nullable |
| `phone` | `string` |  |
| `email` | `string` | format=email |


## `AssignPackageRequest`
| Field | Type | Details |
|---|---|---|
| `package_id` | `integer` | required |


## `BlankEnum`
_No structured fields described_


## `ChangePassword`
| Field | Type | Details |
|---|---|---|
| `old_password` | `string` | required |
| `new_password1` | `string` | required |
| `new_password2` | `string` | required |


## `ConfirmDeliveryRequest`
| Field | Type | Details |
|---|---|---|
| `uuid` | `string` | format=uuid; required |
| `packages` | `array` | items=object; required |
| `packages[].description` | `string` |  |
| `packages[].weight` | `string` | format=decimal; required |
| `packages[].height` | `string` | format=decimal; required |
| `packages[].width` | `string` | format=decimal; required |
| `packages[].length` | `string` | format=decimal; required |
| `packages[].fragile` | `boolean` |  |
| `packages[].temperature` | `string` |  |
| `sender` | `integer` |  |
| `pickup_location` | `string` |  |
| `receiver` | `string` | required |
| `receiver_phone` | `string` | required |
| `delivery_location` | `string` | required |
| `delivery_notes` | `string` |  |
| `service` | `string` | required |
| `price` | `integer` | required |


## `ConfirmDeliveryResponse`
| Field | Type | Details |
|---|---|---|
| `uuid` | `string` | format=uuid; required |
| `status` | `string` | required |


## `ConfirmPackage`
| Field | Type | Details |
|---|---|---|
| `description` | `string` |  |
| `weight` | `string` | format=decimal; required |
| `height` | `string` | format=decimal; required |
| `width` | `string` | format=decimal; required |
| `length` | `string` | format=decimal; required |
| `fragile` | `boolean` |  |
| `temperature` | `string` |  |


## `Delivery`
| Field | Type | Details |
|---|---|---|
| `id` | `integer` | required |
| `sender` | `object` | required |
| `receiver` | `object` | required |
| `pickup_date` | `string` | format=date; nullable |
| `pickup_time` | `string` | format=time; nullable |
| `delivery_date` | `string` | format=date; nullable |
| `delivery_time` | `string` | format=time; nullable |
| `pickup_location` | `string` | nullable |
| `delivery_location` | `string` | required |
| `created_at` | `string` | format=date-time; required |
| `updated_at` | `string` | format=date-time; required |


## `DeliveryQuoteResponse`
| Field | Type | Details |
|---|---|---|
| `uuid` | `string` | format=uuid; required |
| `services` | `array` | items=object; required |
| `services[].service` | `string` | required |
| `services[].price` | `integer` | required |


## `DeliveryRequest`
| Field | Type | Details |
|---|---|---|
| `sender_zip_code` | `string` | required |
| `receiver_zip_code` | `string` | required |
| `packages` | `array` | items=object; required |
| `packages[].weight` | `string` | format=decimal; required |
| `packages[].height` | `string` | format=decimal; required |
| `packages[].width` | `string` | format=decimal; required |
| `packages[].length` | `string` | format=decimal; required |
| `packages[].fragile` | `boolean` |  |
| `packages[].temperature` | `string` |  |


## `DeliveryRequestPackage`
| Field | Type | Details |
|---|---|---|
| `weight` | `string` | format=decimal; required |
| `height` | `string` | format=decimal; required |
| `width` | `string` | format=decimal; required |
| `length` | `string` | format=decimal; required |
| `fragile` | `boolean` |  |
| `temperature` | `string` |  |


## `DeliveryStatus`
| Field | Type | Details |
|---|---|---|
| `id` | `integer` | required |
| `uuid` | `string` | format=uuid; nullable; required |
| `sender_name` | `string` | required |
| `receiver_name` | `string` | nullable |
| `receiver_phone` | `string` | nullable |
| `pickup_location` | `string` | nullable |
| `pickup_date` | `string` | format=date; nullable |
| `pickup_time` | `string` | format=time; nullable |
| `delivery_location` | `string` | required |
| `delivery_date` | `string` | format=date; nullable |
| `delivery_time` | `string` | format=time; nullable |
| `delivery_status` | `string` | nullable |
| `delivery_notes` | `string` | nullable |
| `service` | `string` | nullable |
| `price` | `string` | format=decimal; nullable |
| `created_at` | `string` | format=date-time; required |
| `updated_at` | `string` | format=date-time; required |
| `packages` | `array` | items=object; required |
| `packages[].id` | `integer` | required |
| `packages[].description` | `string` |  |
| `packages[].weight` | `string` | format=decimal; required |
| `packages[].weight_unit` | `string` | enum=['kg', 'g', 'lb', 'oz'] |
| `packages[].length` | `string` | format=decimal; required |
| `packages[].width` | `string` | format=decimal; required |
| `packages[].height` | `string` | format=decimal; required |
| `packages[].dimension_unit` | `string` | enum=['cm', 'm', 'in', 'ft'] |
| `packages[].temperature_range` | `string` |  |
| `packages[].temperature_unit` | `string` | enum=['C', 'F'] |
| `packages[].volume` | `string` | format=decimal; nullable |
| `packages[].fragile` | `boolean` |  |
| `packages[].hazardous` | `boolean` |  |
| `packages[].delivery_status` | `object` |  |
| `packages[].picked_up_at` | `string` | format=date-time; nullable |
| `packages[].delivered_at` | `string` | format=date-time; nullable |
| `packages[].delivered_to` | `string` | nullable |
| `packages[].delivery_notes` | `string` | nullable |
| `packages[].created_at` | `string` | format=date-time; required |
| `packages[].updated_at` | `string` | format=date-time; required |


## `DeliveryStatusEnum`
| Field | Type | Details |
|---|---|---|
| `` | `string` |  |


## `DeliveryStatusPackage`
| Field | Type | Details |
|---|---|---|
| `id` | `integer` | required |
| `description` | `string` |  |
| `weight` | `string` | format=decimal; required |
| `weight_unit` | `string` | enum=['kg', 'g', 'lb', 'oz'] |
| `length` | `string` | format=decimal; required |
| `width` | `string` | format=decimal; required |
| `height` | `string` | format=decimal; required |
| `dimension_unit` | `string` | enum=['cm', 'm', 'in', 'ft'] |
| `temperature_range` | `string` |  |
| `temperature_unit` | `string` | enum=['C', 'F'] |
| `volume` | `string` | format=decimal; nullable |
| `fragile` | `boolean` |  |
| `hazardous` | `boolean` |  |
| `delivery_status` | `object` |  |
| `picked_up_at` | `string` | format=date-time; nullable |
| `delivered_at` | `string` | format=date-time; nullable |
| `delivered_to` | `string` | nullable |
| `delivery_notes` | `string` | nullable |
| `created_at` | `string` | format=date-time; required |
| `updated_at` | `string` | format=date-time; required |


## `DimensionUnitEnum`
| Field | Type | Details |
|---|---|---|
| `` | `string` |  |


## `Driver`
| Field | Type | Details |
|---|---|---|
| `id` | `integer` | required |
| `user` | `object` | required |
| `vehicle` | `object` | required |
| `license_number` | `string` | nullable |
| `phone` | `string` | nullable |
| `address` | `string` | required |
| `is_active` | `boolean` |  |
| `start_date` | `string` | format=date; nullable |
| `end_date` | `string` | format=date; nullable |
| `status` | `string` | nullable |
| `created_at` | `string` | format=date-time; required |
| `updated_at` | `string` | format=date-time; required |


## `DriverDeliveryItem`
| Field | Type | Details |
|---|---|---|
| `type` | `string` | required |
| `delivery` | `object` | required |
| `delivery.id` | `integer` | required |
| `delivery.sender` | `object` | required |
| `delivery.receiver` | `object` | required |
| `delivery.pickup_date` | `string` | format=date; nullable |
| `delivery.pickup_time` | `string` | format=time; nullable |
| `delivery.delivery_date` | `string` | format=date; nullable |
| `delivery.delivery_time` | `string` | format=time; nullable |
| `delivery.pickup_location` | `string` | nullable |
| `delivery.delivery_location` | `string` | required |
| `delivery.created_at` | `string` | format=date-time; required |
| `delivery.updated_at` | `string` | format=date-time; required |
| `packages` | `array` | items=object; required |
| `packages[].id` | `integer` | required |
| `packages[].description` | `string` |  |
| `packages[].weight` | `string` | format=decimal; required |
| `packages[].weight_unit` | `string` | enum=['kg', 'g', 'lb', 'oz'] |
| `packages[].length` | `string` | format=decimal; required |
| `packages[].width` | `string` | format=decimal; required |
| `packages[].height` | `string` | format=decimal; required |
| `packages[].dimension_unit` | `string` | enum=['cm', 'm', 'in', 'ft'] |
| `packages[].temperature_range` | `string` |  |
| `packages[].temperature_unit` | `string` | enum=['C', 'F'] |
| `packages[].volume` | `string` | format=decimal; nullable |
| `packages[].fragile` | `boolean` |  |
| `packages[].hazardous` | `boolean` |  |
| `packages[].delivery_status` | `object` |  |
| `packages[].picked_up_at` | `string` | format=date-time; nullable |
| `packages[].delivered_at` | `string` | format=date-time; nullable |
| `packages[].delivered_to` | `string` | nullable |
| `packages[].delivery_notes` | `string` | nullable |
| `packages[].created_at` | `string` | format=date-time; required |
| `packages[].updated_at` | `string` | format=date-time; required |
| `location` | `string` | required |
| `date` | `string` | format=date; required |
| `time` | `string` | format=time; nullable; required |
| `actor` | `object` | required |
| `actor.id` | `integer` | required |
| `actor.name` | `string` | required |
| `actor.address_line1` | `string` |  |
| `actor.address_line2` | `string` |  |
| `actor.zip_code` | `string` |  |
| `actor.city` | `string` |  |
| `actor.address_country` | `integer` | nullable |
| `actor.phone` | `string` |  |
| `actor.email` | `string` | format=email |
| `actor_type` | `string` | required |
| `is_delivered` | `boolean` |  |
| `pickup_location` | `string` | nullable |
| `pickup_date` | `string` | format=date; nullable |
| `pickup_time` | `string` | format=time; nullable |
| `pickup_actor` | `object` |  |


## `EngineTypeEnum`
| Field | Type | Details |
|---|---|---|
| `` | `string` |  |


## `Login`
| Field | Type | Details |
|---|---|---|
| `email` | `string` | format=email; required |
| `password` | `string` | required |


## `NullEnum`
_No structured fields described_


## `Package`
| Field | Type | Details |
|---|---|---|
| `id` | `integer` | required |
| `description` | `string` |  |
| `weight` | `string` | format=decimal; required |
| `weight_unit` | `string` | enum=['kg', 'g', 'lb', 'oz'] |
| `length` | `string` | format=decimal; required |
| `width` | `string` | format=decimal; required |
| `height` | `string` | format=decimal; required |
| `dimension_unit` | `string` | enum=['cm', 'm', 'in', 'ft'] |
| `temperature_range` | `string` |  |
| `temperature_unit` | `string` | enum=['C', 'F'] |
| `volume` | `string` | format=decimal; nullable |
| `fragile` | `boolean` |  |
| `hazardous` | `boolean` |  |
| `delivery_status` | `object` |  |
| `picked_up_at` | `string` | format=date-time; nullable |
| `delivered_at` | `string` | format=date-time; nullable |
| `delivered_to` | `string` | nullable |
| `delivery_notes` | `string` | nullable |
| `created_at` | `string` | format=date-time; required |
| `updated_at` | `string` | format=date-time; required |


## `PackageDelivery`
| Field | Type | Details |
|---|---|---|
| `delivered_to` | `string` |  |
| `delivery_notes` | `string` |  |
| `success` | `boolean` |  |
| `message` | `string` |  |
| `new_status` | `string` |  |
| `new_status_display` | `string` |  |
| `delivered_at` | `string` |  |


## `PackageStatusUpdate`
| Field | Type | Details |
|---|---|---|
| `success` | `boolean` | required |
| `message` | `string` | required |
| `new_status` | `string` | required |
| `new_status_display` | `string` | required |
| `picked_up_at` | `string` |  |


## `ServiceQuote`
| Field | Type | Details |
|---|---|---|
| `service` | `string` | required |
| `price` | `integer` | required |


## `Signup`
| Field | Type | Details |
|---|---|---|
| `email` | `string` | format=email; required |
| `password1` | `string` | required |
| `password2` | `string` | required |
| `first_name` | `string` |  |
| `last_name` | `string` |  |
| `actor_id` | `integer` |  |
| `role_id` | `integer` |  |


## `TemperatureUnitEnum`
| Field | Type | Details |
|---|---|---|
| `` | `string` |  |


## `UnassignedPackage`
| Field | Type | Details |
|---|---|---|
| `id` | `integer` | required |
| `description` | `string` |  |
| `weight` | `string` | format=decimal; required |
| `weight_unit` | `string` | enum=['kg', 'g', 'lb', 'oz'] |
| `length` | `string` | format=decimal; required |
| `width` | `string` | format=decimal; required |
| `height` | `string` | format=decimal; required |
| `dimension_unit` | `string` | enum=['cm', 'm', 'in', 'ft'] |
| `temperature_range` | `string` |  |
| `temperature_unit` | `string` | enum=['C', 'F'] |
| `volume` | `string` | format=decimal; nullable |
| `fragile` | `boolean` |  |
| `hazardous` | `boolean` |  |
| `delivery_status` | `object` |  |
| `picked_up_at` | `string` | format=date-time; nullable |
| `delivered_at` | `string` | format=date-time; nullable |
| `delivered_to` | `string` | nullable |
| `delivery_notes` | `string` | nullable |
| `created_at` | `string` | format=date-time; required |
| `updated_at` | `string` | format=date-time; required |


## `UnassignedPackagesByDelivery`
| Field | Type | Details |
|---|---|---|
| `delivery_id` | `integer` | required |
| `uuid` | `string` | format=uuid; nullable; required |
| `receiver_name` | `string` |  |
| `receiver_phone` | `string` |  |
| `pickup_location` | `string` |  |
| `delivery_location` | `string` | required |
| `service` | `string` |  |
| `price` | `string` | format=decimal |
| `packages` | `array` | items=object; required |
| `packages[].id` | `integer` | required |
| `packages[].description` | `string` |  |
| `packages[].weight` | `string` | format=decimal; required |
| `packages[].weight_unit` | `string` | enum=['kg', 'g', 'lb', 'oz'] |
| `packages[].length` | `string` | format=decimal; required |
| `packages[].width` | `string` | format=decimal; required |
| `packages[].height` | `string` | format=decimal; required |
| `packages[].dimension_unit` | `string` | enum=['cm', 'm', 'in', 'ft'] |
| `packages[].temperature_range` | `string` |  |
| `packages[].temperature_unit` | `string` | enum=['C', 'F'] |
| `packages[].volume` | `string` | format=decimal; nullable |
| `packages[].fragile` | `boolean` |  |
| `packages[].hazardous` | `boolean` |  |
| `packages[].delivery_status` | `object` |  |
| `packages[].picked_up_at` | `string` | format=date-time; nullable |
| `packages[].delivered_at` | `string` | format=date-time; nullable |
| `packages[].delivered_to` | `string` | nullable |
| `packages[].delivery_notes` | `string` | nullable |
| `packages[].created_at` | `string` | format=date-time; required |
| `packages[].updated_at` | `string` | format=date-time; required |


## `User`
| Field | Type | Details |
|---|---|---|
| `id` | `integer` | required |
| `email` | `string` | format=email |
| `username` | `string` | required |
| `first_name` | `string` |  |
| `last_name` | `string` |  |


## `UserSignupStats`
| Field | Type | Details |
|---|---|---|
| `date` | `string` | format=date; required |
| `count` | `integer` | required |


## `Vehicle`
| Field | Type | Details |
|---|---|---|
| `id` | `integer` | required |
| `make` | `string` | required |
| `model` | `string` | required |
| `color` | `string` |  |
| `license_plate` | `string` |  |
| `type` | `string` | required |
| `capacity` | `integer` | nullable |
| `maximum_total_weight_kg` | `integer` | nullable |
| `registration_year` | `integer` | nullable |
| `maximum_load_kg` | `integer` | nullable |
| `next_eu_control_date` | `string` | format=date; nullable |
| `engine_type` | `object` | nullable |


## `WeightUnitEnum`
| Field | Type | Details |
|---|---|---|
| `` | `string` |  |

