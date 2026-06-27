# GameHub API Documentation

This document summarizes the live backend routes exposed by Swagger.

Base URL: `/api`

## Authentication

All protected endpoints use JWT auth with the access token read from the `accessToken` cookie during local development.

## How to use in Swagger

1. Start the API.
2. Open `https://localhost:7023/swagger`.
3. Click `Authorize`.
4. Paste a valid bearer token when testing protected routes.

## Example Payloads

### Auth

`POST /api/Auth/register`

```json
{
	"firstName": "Naheel",
	"lastName": "Muhammad",
	"phone": "1234567890",
	"email": "naheel@example.com",
	"password": "Password123!",
	"confirmPassword": "Password123!"
}
```

`POST /api/Auth/login`

```json
{
	"email": "naheel@example.com",
	"password": "Password123!"
}
```

### Cart

`POST /api/Cart`

```json
{
	"gameId": 12,
	"quantity": 1
}
```

`PUT /api/Cart/{gameId}`

```json
{
	"quantity": 2
}
```

### Addresses

`POST /api/Addresses`

```json
{
	"fullName": "Naheel Muhammad",
	"addressLine1": "123 Main Street",
	"addressLine2": "Apt 4B",
	"city": "Malappuram",
	"state": "Kerala",
	"zipCode": "676505",
	"country": "India",
	"phone": "1234567890",
	"isDefault": true
}
```

`PUT /api/Addresses/{addressId}`

```json
{
	"fullName": "Naheel Muhammad",
	"addressLine1": "123 Main Street",
	"addressLine2": "Apt 4B",
	"city": "Malappuram",
	"state": "Kerala",
	"zipCode": "676505",
	"country": "India",
	"phone": "1234567890",
	"isDefault": false
}
```

### Orders

`POST /api/Orders`

```json
{
	"addressId": "2b5c9ed5-5f0b-4d62-8f9d-1c5a6f1c3d11",
	"paymentMethod": "Razorpay"
}
```

`POST /api/Orders/buy-now` (Buy Now from product page)

```json
{
	"gameId": 12,
	"quantity": 1,
	"addressId": "2b5c9ed5-5f0b-4d62-8f9d-1c5a6f1c3d11"
}
```

### Payments

`POST /api/Payments/verify`

```json
{
	"razorpayOrderId": "order_O123456789",
	"razorpayPaymentId": "pay_O123456789",
	"razorpaySignature": "signature-value"
}
```

`POST /api/Payments/confirm-link`

```json
{
	"purchaseId": 101,
	"razorpayPaymentLinkId": "plink_O123456789",
	"razorpayPaymentId": "pay_O123456789"
}
```

### Admin

`PUT /api/admin/AdminOrders/{orderId}/status`

```json
{
	"status": "Shipped"
}
```

`PUT /api/admin/AdminUsers/{id}/role`

```json
{
	"role": "Admin"
}
```

## Public Endpoints

### Games

| Method | Route | Purpose | Notes |
|---|---|---|---|
| `GET` | `/api/Games` | List games | Supports query pagination, search, sorting, and returns `X-Total-Count`. |
| `GET` | `/api/Games/{id}` | Get game by ID | Returns `404` when the game is missing. |

### Auth

| Method | Route | Purpose | Notes |
|---|---|---|---|
| `POST` | `/api/Auth/register` | Register a new user | Sets the refresh-token cookie on success. |
| `POST` | `/api/Auth/login` | Sign in | Sets the refresh-token cookie on success. |
| `POST` | `/api/Auth/refresh` | Refresh access token | Reads the refresh token from cookies. |
| `POST` | `/api/Auth/logout` | Log out | Protected route. Clears refresh-token cookie. |
| `GET` | `/api/Auth/profile` | Get current profile | Protected route. |

## Protected User Endpoints

### Cart

| Method | Route | Purpose | Notes |
|---|---|---|---|
| `GET` | `/api/Cart` | Get the current cart | Protected route. |
| `POST` | `/api/Cart` | Add item to cart | Request body includes `gameId` and `quantity`. |
| `PUT` | `/api/Cart/{gameId}` | Update cart quantity | Request body includes `quantity`. |
| `DELETE` | `/api/Cart/{gameId}` | Remove an item | Protected route. |
| `DELETE` | `/api/Cart` | Clear the cart | Protected route. |

### Wishlist

| Method | Route | Purpose | Notes |
|---|---|---|---|
| `GET` | `/api/Wishlist` | Get wishlist items | Protected route. |
| `POST` | `/api/Wishlist/{gameId}` | Add game to wishlist | Protected route. |
| `DELETE` | `/api/Wishlist/{gameId}` | Remove game from wishlist | Protected route. |
| `POST` | `/api/Wishlist/{gameId}/move-to-cart` | Move wishlist item to cart | Protected route. |

### Addresses

| Method | Route | Purpose | Notes |
|---|---|---|---|
| `GET` | `/api/Addresses` | List saved addresses | Protected route. |
| `POST` | `/api/Addresses` | Add address | Protected route. |
| `PUT` | `/api/Addresses/{addressId}` | Update address | Protected route. |
| `DELETE` | `/api/Addresses/{addressId}` | Delete address | Protected route. |
| `PUT` | `/api/Addresses/{addressId}/default` | Set default address | Protected route. |

### Orders

| Method | Route | Purpose | Notes |
|---|---|---|---|
| `POST` | `/api/Orders` | Place an order | Protected route. |
| `POST` | `/api/Orders/buy-now` | Place an instant order | Protected route. Creates order directly from product ID without cart. |
| `GET` | `/api/Orders` | Get order history | Protected route. |
| `GET` | `/api/Orders/{orderId}` | Get order by ID | Protected route. |

### Payments

| Method | Route | Purpose | Notes |
|---|---|---|---|
| `POST` | `/api/Payments/create-link/{purchaseId}` | Create Razorpay payment link | Protected route. Handles errors for not found, unauthorized, and business-rule failures. |
| `POST` | `/api/Payments/verify` | Verify payment | Protected route. Validates Razorpay signature. |
| `POST` | `/api/Payments/confirm-link` | Confirm payment link | Protected route. |
| `POST` | `/api/Payments/restore/{purchaseId}` | Restore cart from purchase | Protected route. |

## Admin Endpoints

All admin routes require the `Admin` role.

### Admin Dashboard

| Method | Route | Purpose | Notes |
|---|---|---|---|
| `GET` | `/api/Admin/dashboard` | Get dashboard stats | Admin only. |

### Admin Games

| Method | Route | Purpose | Notes |
|---|---|---|---|
| `POST` | `/api/admin/games` | Create game | Accepts `multipart/form-data` for images and trailer uploads. |
| `PUT` | `/api/admin/games/{id}` | Update game | Accepts `multipart/form-data`. |
| `GET` | `/api/admin/games/{id}` | Get game | Admin only. |
| `DELETE` | `/api/admin/games/{id}` | Delete game | Returns `204 No Content` on success. |

### Admin Orders

| Method | Route | Purpose | Notes |
|---|---|---|---|
| `GET` | `/api/admin/AdminOrders` | List orders | Returns results plus `X-Total-Count`. |
| `GET` | `/api/admin/AdminOrders/{orderId}` | Get order detail | Admin only. |
| `PUT` | `/api/admin/AdminOrders/{orderId}/status` | Update order status | Body includes order status. |
| `DELETE` | `/api/admin/AdminOrders/{orderId}` | Delete order | Admin only. |

### Admin Users

| Method | Route | Purpose | Notes |
|---|---|---|---|
| `GET` | `/api/admin/AdminUsers` | List users | Returns results plus `X-Total-Count`. |
| `GET` | `/api/admin/AdminUsers/{id}` | Get user detail | Validates that the id is numeric. |
| `PUT` | `/api/admin/AdminUsers/{id}/block` | Block a user | Admin only. |
| `PUT` | `/api/admin/AdminUsers/{id}/activate` | Activate a user | Admin only. |
| `PUT` | `/api/admin/AdminUsers/{id}/role` | Update user role | Body includes role. |
| `DELETE` | `/api/admin/AdminUsers/{id}` | Delete a user | Admin only. |

## Example Responses

### Login success

```json
{
	"success": true,
	"message": "Login successful",
	"data": {
		"accessToken": "jwt-token-here",
		"refreshToken": null,
		"user": {
			"id": 1,
			"email": "naheel@example.com"
		}
	}
}
```

### Cart update success

```json
{
	"message": "Quantity update"
}
```

### Payment confirmation

```json
{
	"success": true,
	"message": "Payment confirmed"
}
```

## Common Response Headers

- `X-Total-Count`: returned by paginated list endpoints such as games, admin users, and admin orders.

## Notes

- Swagger is the easiest place to test the backend manually.
- Protected endpoints require authentication before they will work.
- Some request/response shapes are generated from DTOs and service results, so check Swagger schemas for the exact payloads.
- The API follows REST-style routes, but a few admin routes use controller-based names such as `AdminOrders` and `AdminUsers`.
