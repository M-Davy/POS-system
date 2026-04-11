# Backend Exception Handling Guide

## Overview

The POS backend implements a comprehensive exception handling system that provides consistent, structured error responses. All exceptions are caught by the `GlobalExceptionHandler` and converted to a standardized API response format that the frontend can easily consume.

## Standard API Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "status": "ERROR_CODE",
  "fieldErrors": {
    "email": "Email already exists",
    "quantity": "Quantity must be greater than 0"
  },
  "data": null,
  "timestamp": "2026-04-11T10:30:45.123456"
}
```

### Response Fields
- **success**: `boolean` - Whether the operation was successful
- **message**: `string` - Human-readable error or success message
- **status**: `string` - Machine-readable error code for programmatic handling
- **fieldErrors**: `object` (optional) - Field-level validation errors, only present on validation failures
- **data**: `object` (optional) - Response payload for successful operations
- **timestamp**: `string` - ISO 8601 timestamp when response was generated

## Exception Hierarchy

### 1. InsufficientStockException (HTTP 409 Conflict)
**When**: When trying to process more items than available stock

**Error Code**: `INSUFFICIENT_STOCK`

**Example Response**:
```json
{
  "success": false,
  "message": "Insufficient stock available for Product XYZ. Required: 10, Available: 5",
  "status": "INSUFFICIENT_STOCK",
  "timestamp": "2026-04-11T10:30:45.123456"
}
```

**Service Usage**:
```java
// In your service class
if (product.getQuantity() < requestedQuantity) {
    throw new InsufficientStockException(
        String.format("Insufficient stock for %s. Required: %d, Available: %d",
            product.getName(), requestedQuantity, product.getQuantity()),
        product.getName(),
        requestedQuantity,
        product.getQuantity()
    );
}
```

**Frontend Handling**:
```typescript
try {
  const order = await createOrder(orderData);
} catch (error) {
  if (error.response?.data?.status === 'INSUFFICIENT_STOCK') {
    showError('Not enough stock available for this product');
    // Update inventory UI
  }
}
```

---

### 2. ResourceNotFoundException (HTTP 404 Not Found)
**When**: When a requested resource (product, order, user) doesn't exist

**Error Code**: `NOT_FOUND`

**Example Response**:
```json
{
  "success": false,
  "message": "Product with ID 123 not found",
  "status": "NOT_FOUND",
  "timestamp": "2026-04-11T10:30:45.123456"
}
```

**Service Usage**:
```java
Product product = productRepository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException("Product with ID " + id + " not found"));
```

---

### 3. ValidationException (HTTP 400 Bad Request)
**When**: When input validation fails at the business logic level

**Error Code**: `VALIDATION_FAILED`

**Example Response**:
```json
{
  "success": false,
  "message": "Validation failed",
  "status": "VALIDATION_FAILED",
  "fieldErrors": {
    "email": "Email must be valid",
    "quantity": "Quantity must be greater than 0",
    "price": "Price must be positive"
  },
  "timestamp": "2026-04-11T10:30:45.123456"
}
```

**Service Usage**:
```java
ValidationException ex = new ValidationException("Validation failed");
if (!isValidEmail(user.getEmail())) {
    ex.addFieldError("email", "Email format is invalid");
}
if (product.getPrice() <= 0) {
    ex.addFieldError("price", "Price must be positive");
}
if (!ex.getFieldErrors().isEmpty()) {
    throw ex;
}
```

**Frontend Handling** - Display field-level errors:
```typescript
try {
  await createProduct(productData);
} catch (error) {
  if (error.response?.data?.status === 'VALIDATION_FAILED') {
    const fieldErrors = error.response.data.fieldErrors;
    Object.entries(fieldErrors).forEach(([field, message]) => {
      showFieldError(field, message);
    });
  }
}
```

---

### 4. InvalidOperationException (HTTP 400 Bad Request)
**When**: When an operation cannot be performed due to invalid state/conditions

**Common Scenarios**:
- Trying to cancel an already completed order
- Trying to refund a pending payment
- Invalid state transitions

**Error Code**: `INVALID_OPERATION` (or custom code)

**Example Response**:
```json
{
  "success": false,
  "message": "Cannot cancel order in COMPLETED status",
  "status": "INVALID_OPERATION",
  "timestamp": "2026-04-11T10:30:45.123456"
}
```

**Service Usage**:
```java
if (!order.getStatus().equals(OrderStatus.PENDING)) {
    throw new InvalidOperationException(
        "Cannot cancel order in " + order.getStatus() + " status",
        "INVALID_ORDER_STATE"
    );
}
```

---

### 5. PaymentFailedException (HTTP 402 Payment Required)
**When**: Payment processing fails

**Error Code**: `PAYMENT_FAILED` (or method-specific code)

**Example Response**:
```json
{
  "success": false,
  "message": "M-Pesa payment failed: Invalid phone number",
  "status": "PAYMENT_FAILED",
  "timestamp": "2026-04-11T10:30:45.123456"
}
```

**Service Usage**:
```java
// When M-Pesa API returns error
if (!mpesaResponse.isSuccessful()) {
    throw new PaymentFailedException(
        "M-Pesa payment failed: " + mpesaResponse.getError(),
        "MPESA_PAYMENT_ERROR",
        "MPESA"
    );
}
```

**Frontend Handling**:
```typescript
try {
  await processPayment(paymentData);
} catch (error) {
  if (error.response?.data?.status === 'PAYMENT_FAILED') {
    showError('Payment processing failed. Please try again.');
    // Retry UI
  }
}
```

---

### 6. UnauthorizedException (HTTP 401 Unauthorized)
**When**: User lacks authorization for an operation

**Error Code**: `UNAUTHORIZED` (or specific code)

**Example Response**:
```json
{
  "success": false,
  "message": "Invalid or expired JWT token",
  "status": "INVALID_TOKEN",
  "timestamp": "2026-04-11T10:30:45.123456"
}
```

**Service Usage**:
```java
if (!jwtValidator.isValid(token)) {
    throw new UnauthorizedException(
        "Invalid or expired JWT token",
        "INVALID_TOKEN"
    );
}
```

---

### 7. DuplicateResourceException (HTTP 409 Conflict)
**When**: Attempting to create a resource that already exists

**Error Code**: `DUPLICATE_RESOURCE`

**Example Response**:
```json
{
  "success": false,
  "message": "User with email john@example.com already exists",
  "status": "DUPLICATE_RESOURCE",
  "timestamp": "2026-04-11T10:30:45.123456"
}
```

**Service Usage**:
```java
if (userRepository.existsByEmail(user.getEmail())) {
    throw new DuplicateResourceException(
        "User with email " + user.getEmail() + " already exists",
        "User",
        "email"
    );
}
```

**Frontend Handling**:
```typescript
try {
  await registerUser(userData);
} catch (error) {
  if (error.response?.data?.status === 'DUPLICATE_RESOURCE') {
    showFieldError('email', 'This email is already registered');
  }
}
```

---

### 8. UserException (HTTP 400 Bad Request)
**When**: User-related errors (deprecated - consider using other exceptions)

**Error Code**: `USER_ERROR`

---

## Frontend Implementation Pattern

### Global Error Handler
```typescript
// lib/api-service.ts or similar
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    
    if (errorData?.status) {
      // Handle specific error codes
      handleError(errorData.status, errorData);
    }
    
    return Promise.reject(error);
  }
);

function handleError(status: string, data: any) {
  switch (status) {
    case 'INSUFFICIENT_STOCK':
      console.error('Stock unavailable:', data.message);
      // Trigger inventory update
      break;
    
    case 'NOT_FOUND':
      console.error('Resource not found:', data.message);
      // Redirect or show 404
      break;
    
    case 'VALIDATION_FAILED':
      console.error('Validation errors:', data.fieldErrors);
      // Show field-level errors
      break;
    
    case 'PAYMENT_FAILED':
      console.error('Payment error:', data.message);
      // Show payment retry UI
      break;
    
    case 'INVALID_TOKEN':
      console.error('Token invalid, redirecting to login');
      // Redirect to login
      break;
    
    default:
      console.error('Unknown error:', data.message);
  }
}

export default apiClient;
```

---

## Best Practices

### In Backend Services

1. **Use Specific Exceptions**: Always throw the most specific exception rather than generic exceptions
   ```java
   // Good
   throw new InsufficientStockException("message", productName, required, available);
   
   // Avoid
   throw new Exception("Stock error");
   ```

2. **Include Context**: Provide enough information in messages and exception properties for debugging
   ```java
   // Good
   throw new InvalidOperationException(
       String.format("Cannot %s order in %s status", operation, status),
       "INVALID_STATE"
   );
   ```

3. **Use Error Codes**: Always set error codes for programmatic handling
   ```java
   throw new PaymentFailedException(message, "MPESA_INVALID_PHONE", "MPESA");
   ```

### In Frontend

1. **Check Status Codes**: Always check the `status` field, not HTTP codes
   ```typescript
   // Good
   if (error.response?.data?.status === 'INSUFFICIENT_STOCK') { ... }
   
   // Avoid
   if (error.response?.status === 409) { ... }
   ```

2. **Display Field Errors**: For validation, show field-level errors to users
   ```typescript
   if (data?.fieldErrors) {
     Object.entries(data.fieldErrors).forEach(([field, error]) => {
       setFormError(field, error);
     });
   }
   ```

3. **Handle HTTP Status**: Use HTTP status for retry logic
   ```typescript
   if (error.response?.status === 409) {
     // Retry logic for conflicts
   } else if (error.response?.status === 401) {
     // Refresh token and retry
   }
   ```

---

## Testing

### Unit Test Example
```java
@Test
public void testInsufficientStock() {
    // Arrange
    Product product = new Product();
    product.setQuantity(5);
    
    // Act & Assert
    assertThrows(InsufficientStockException.class, () -> {
        service.validateAndDeductStock(product, 10);
    });
}
```

---

## Common Scenarios

### Scenario 1: User tries to buy more items than in stock
**Backend**: Throws `InsufficientStockException`
**Frontend**: Shows "Not enough stock available. Please reduce quantity." with available quantity

### Scenario 2: User submits form with validation errors
**Backend**: Throws `ValidationException` with field errors
**Frontend**: Shows field-level error messages (e.g., "Email is required")

### Scenario 3: M-Pesa payment fails
**Backend**: Throws `PaymentFailedException`
**Frontend**: Shows "Payment failed. Please try again" with retry button

### Scenario 4: JWT token expired
**Backend**: Throws `UnauthorizedException`
**Frontend**: Redirects to login or shows "Session expired. Please log in again"

### Scenario 5: User tries to cancel completed order
**Backend**: Throws `InvalidOperationException`
**Frontend**: Shows "Cannot cancel an already completed order"

---

## Adding New Exception Types

To add a new exception type:

1. Create a new exception class extending `RuntimeException`
2. Add handlers to `GlobalExceptionHandler`
3. Update this documentation with usage examples
4. Create frontend error handling for the new status code

Example:
```java
// Step 1: Create exception
public class LowStockWarningException extends RuntimeException {
    private String errorCode = "LOW_STOCK_WARNING";
    // ... fields and methods
}

// Step 2: Add handler
@ExceptionHandler(LowStockWarningException.class)
public ResponseEntity<ApiResponse> handleLowStock(LowStockWarningException ex) {
    ApiResponse response = new ApiResponse(false, ex.getMessage());
    response.setStatus(ex.getErrorCode());
    return new ResponseEntity<>(response, HttpStatus.OK); // Or appropriate status
}
```

---

## HTTP Status Code Mapping

| Exception | HTTP Status | When to Use |
|-----------|-------------|------------|
| InsufficientStockException | 409 Conflict | Business rule violation (conflicting state) |
| ResourceNotFoundException | 404 Not Found | Resource doesn't exist |
| ValidationException | 400 Bad Request | Input validation fails |
| InvalidOperationException | 400 Bad Request | Operation not valid in current state |
| PaymentFailedException | 402 Payment Required | Payment processing fails |
| UnauthorizedException | 401 Unauthorized | Authentication/Authorization fails |
| DuplicateResourceException | 409 Conflict | Unique constraint violation |
| UserException | 400 Bad Request | User-related errors |

---

## Logging

All exceptions are logged with appropriate levels:
- **WARN**: Expected exceptions (InsufficientStock, NotFound, Validation)
- **ERROR**: Unexpected exceptions (Runtime, Payment API failures)

Check logs in `logs/` directory for monitoring and debugging.
