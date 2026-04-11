# Exception Handling Quick Reference

## Backend Exception Classes

| Exception | HTTP Status | When to Use | Error Code |
|-----------|-------------|------------|-----------|
| **InsufficientStockException** | 409 | Not enough inventory | `INSUFFICIENT_STOCK` |
| **ResourceNotFoundException** | 404 | Resource doesn't exist | `NOT_FOUND` |
| **ValidationException** | 400 | Input validation fails | `VALIDATION_FAILED` |
| **InvalidOperationException** | 400 | Invalid state transition | `INVALID_OPERATION` |
| **PaymentFailedException** | 402 | Payment processing fails | `PAYMENT_FAILED` |
| **UnauthorizedException** | 401 | Auth token invalid/expired | `UNAUTHORIZED` |
| **DuplicateResourceException** | 409 | Resource already exists | `DUPLICATE_RESOURCE` |

## Backend Usage

### Using Factory Methods (Recommended)

```java
// Check stock
if (product.getQuantity() < needed) {
    throw ExceptionFactory.insufficientStock(
        product.getName(), needed, product.getQuantity()
    );
}

// Find or throw
Product p = productRepo.findById(id)
    .orElseThrow(() -> ExceptionFactory.notFound("Product", id));

// Duplicate check
if (userRepo.existsByEmail(email)) {
    throw ExceptionFactory.duplicate("User", "email", email);
}

// Validation
ValidationException ex = new ValidationException("Validation failed");
if (invalid) ex.addFieldError("field", "error message");
if (!ex.getFieldErrors().isEmpty()) throw ex;

// Invalid operation
if (order.isCompleted()) {
    throw ExceptionFactory.invalidOperation(
        "cancel", "order is completed", "CANNOT_CANCEL"
    );
}

// Payment
if (!paymentResponse.success()) {
    throw ExceptionFactory.paymentFailed(
        "M-Pesa", response.getError(), "MPESA_ERROR"
    );
}

// Unauthorized
if (!validateToken(jwt)) {
    throw ExceptionFactory.unauthorized(
        "Invalid token", "INVALID_TOKEN"
    );
}
```

## API Response Format

All errors return:
```json
{
  "success": false,
  "message": "User-friendly message",
  "status": "ERROR_CODE",
  "fieldErrors": {"field": "error"}, // Only for validation
  "data": null,
  "timestamp": "2026-04-11T10:30:45"
}
```

## Frontend - Axios Setup

```typescript
// lib/api-service.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const { status, message } = error.response?.data || {};
    
    if (status === 'INSUFFICIENT_STOCK') {
      // Show inventory warning
    } else if (status === 'VALIDATION_FAILED') {
      // Show field errors
    } else if (status === 'PAYMENT_FAILED') {
      // Show payment retry
    } else if (status === 'UNAUTHORIZED') {
      // Redirect to login
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Frontend - Form Error Handling

```typescript
// Handle validation errors
try {
  await apiClient.post('/api/endpoint', data);
} catch (error: any) {
  const { status, fieldErrors } = error.response?.data || {};
  
  if (status === 'VALIDATION_FAILED') {
    // Display next to form fields
    Object.entries(fieldErrors).forEach(([field, msg]) => {
      setError(field, msg);
    });
  } else {
    // Show toast/alert
    showError(error.response?.data?.message);
  }
}
```

## Frontend - Inventory Management

```typescript
// Handle insufficient stock
try {
  await addToCart(productId, quantity);
} catch (error: any) {
  if (error.response?.data?.status === 'INSUFFICIENT_STOCK') {
    showWarning('Only ' + availableQty + ' items in stock');
    // Update inventory display
  }
}
```

## Frontend - Payment Handling

```typescript
// Handle payment errors
try {
  await processPayment(orderId, phoneNumber);
} catch (error: any) {
  const { status, message } = error.response?.data || {};
  
  if (status === 'PAYMENT_FAILED') {
    showError(message); // e.g., "M-Pesa payment failed: Invalid phone"
    showRetryButton(); // Let user retry
  }
}
```

## Testing Exceptions

```java
@Test
public void testInsufficientStock() {
    Product product = new Product();
    product.setQuantity(5);
    
    InsufficientStockException ex = assertThrows(
        InsufficientStockException.class,
        () -> service.deductStock(product, 10)
    );
    
    assertEquals("Product Stock", ex.getProductName());
    assertEquals(10, ex.getRequiredQuantity());
    assertEquals(5, ex.getAvailableQuantity());
}
```

## Error Codes by Scenario

| Scenario | Exception | Code | User Message |
|----------|-----------|------|--------------|
| User buys 10 but only 5 in stock | InsufficientStockException | INSUFFICIENT_STOCK | "Only 5 items available" |
| Product ID doesn't exist | ResourceNotFoundException | NOT_FOUND | "Product not found" |
| Email already registered | DuplicateResourceException | DUPLICATE_RESOURCE | "Email already registered" |
| Form field empty | ValidationException | VALIDATION_FAILED | "Field is required" |
| Cancel completed order | InvalidOperationException | INVALID_OPERATION | "Cannot cancel completed order" |
| M-Pesa fails | PaymentFailedException | PAYMENT_FAILED | "Payment failed. Try again?" |
| JWT token invalid | UnauthorizedException | UNAUTHORIZED | "Session expired. Log in again." |

## String Messages for Frontend

Don't display error messages from backend directly. Use status code to show appropriate message:

```typescript
const userMessages: Record<string, string> = {
  'INSUFFICIENT_STOCK': 'Not enough items in stock',
  'NOT_FOUND': 'Item not found',
  'VALIDATION_FAILED': 'Please check your input',
  'INVALID_OPERATION': 'This action cannot be performed',
  'PAYMENT_FAILED': 'Payment processing failed. Please try again.',
  'UNAUTHORIZED': 'Your session has expired. Please log in.',
  'DUPLICATE_RESOURCE': 'This item already exists',
};
```

## Logging

All exceptions are logged:
- **WARN**: Expected errors (insufficient stock, validation, not found)
- **ERROR**: Unexpected errors (payment API down, database error)

Check logs in `logs/` directory.

## Common Patterns

**Pattern 1: Validate then Action**
```java
if (product.getQuantity() < qty) {
    throw ExceptionFactory.insufficientStock(...);
}
product.setQuantity(product.getQuantity() - qty);
```

**Pattern 2: Find or Fail**
```java
Product p = repo.findById(id)
    .orElseThrow(() -> ExceptionFactory.notFound("Product", id));
```

**Pattern 3: Accumulate Validation Errors**
```java
ValidationException ex = new ValidationException("Failed");
if (condition1) ex.addFieldError("field1", "error1");
if (condition2) ex.addFieldError("field2", "error2");
if (!ex.getFieldErrors().isEmpty()) throw ex;
```

## Next Steps

1. ✅ Exception classes created
2. ✅ GlobalExceptionHandler updated
3. ✅ ApiResponse enhanced
4. ✅ ExceptionFactory for easy creation
5. TODO: Update existing services to use new exceptions
6. TODO: Implement frontend error handlers
7. TODO: Add error state management (Redux, Zustand, Context)

## Checklist for Integration

- [ ] Review and import new exception classes
- [ ] Update services to throw appropriate exceptions
- [ ] Test exception handling in controllers
- [ ] Set up Axios interceptor in frontend
- [ ] Create error alert/notification component
- [ ] Handle form validation errors
- [ ] Handle payment errors with retry
- [ ] Handle inventory insufficient stock
- [ ] Add error logging
- [ ] Test error responses end-to-end
