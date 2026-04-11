# Implementation Checklist

Complete this checklist to fully integrate the exception handling system.

## Pre-Integration (Understanding)

- [ ] Read [EXCEPTION_HANDLING_QUICK_REFERENCE.md](./EXCEPTION_HANDLING_QUICK_REFERENCE.md) - 5 min
- [ ] Review the new exception classes in `POS/src/main/java/Retail/POS/exceptions/`
- [ ] Check updated `GlobalExceptionHandler.java` and `ApiResponse.java`
- [ ] Look at `ExceptionHandlingExamples.java` for usage patterns

## Phase 1: Backend - Core Infrastructure (Already Done ✅)

These are already implemented:

- [x] Created InsufficientStockException with product details
- [x] Created ValidationException with field-level errors
- [x] Created InvalidOperationException for state validation
- [x] Created PaymentFailedException for payment errors
- [x] Created UnauthorizedException for auth failures
- [x] Created DuplicateResourceException for duplicates
- [x] Updated GlobalExceptionHandler to handle all exceptions
- [x] Enhanced ApiResponse with error codes and field errors
- [x] Created ExceptionFactory for easy exception creation
- [x] Added logging to GlobalExceptionHandler

## Phase 2: Backend - Service Integration

You need to do this:

### InventoryService / ProductService
- [ ] Review [ExceptionHandlingExamples.java](./POS/src/main/java/Retail/POS/service/ExceptionHandlingExamples.java) examples 1-2
- [ ] Find stock validation logic
- [ ] Replace generic exceptions with `InsufficientStockException`
- [ ] Replace not found logic with `ExceptionFactory.notFound()`
- [ ] Test with unit tests

**File**: `POS/src/main/java/Retail/POS/service/InventoryService.java`

**Example code**:
```java
// Before
if (product.getQuantity() < qty) throw new Exception("Not enough stock");

// After
if (product.getQuantity() < qty) {
    throw ExceptionFactory.insufficientStock(
        product.getName(), qty, product.getQuantity()
    );
}
```

### OrderService
- [ ] Review stock deduction logic
- [ ] Use `InsufficientStockException` for low stock
- [ ] Use `InvalidOperationException` for invalid order states
- [ ] Handle order not found
- [ ] Test order creation and cancellation scenarios

**File**: `POS/src/main/java/Retail/POS/service/OrderService.java`

**Key operations**:
- ✍️ `createOrder()` - Add stock validation
- ✍️ `cancelOrder()` - Add invalid state check
- ✍️ `updateOrder()` - Check order exists and is in valid state

### PurchaseService (Payment)
- [ ] Locate payment processing code
- [ ] Wrap M-Pesa calls with `PaymentFailedException` handling
- [ ] Add validation before payment attempt
- [ ] Use error codes for different failure types

**File**: `POS/src/main/java/Retail/POS/service/PurchaseService.java`

**Example code**:
```java
// Before
if (!mpesaResponse.isSuccess()) {
    throw new Exception("Payment failed");
}

// After
if (!mpesaResponse.isSuccess()) {
    throw ExceptionFactory.paymentFailed(
        "M-Pesa",
        mpesaResponse.getError(),
        "MPESA_" + mpesaResponse.getErrorCode()
    );
}
```

### UserService
- [ ] Add duplicate email check
- [ ] Use `DuplicateResourceException` for duplicate users
- [ ] Validate JWT token
- [ ] Use `UnauthorizedException` for invalid tokens

**File**: `POS/src/main/java/Retail/POS/service/UserService.java`

**Example code**:
```java
// Before
if (userRepository.existsByEmail(email)) {
    throw new Exception("Email exists");
}

// After
if (userRepository.existsByEmail(email)) {
    throw ExceptionFactory.duplicate("User", "email", email);
}
```

### Other Services (ReportService, ScanService, etc.)
- [ ] Replace generic exceptions with specific types
- [ ] Add `@Throws` Javadoc comments

## Phase 3: Backend - Testing

- [ ] Write unit tests for each service method that throws exceptions
- [ ] Test `InsufficientStockException` scenarios
- [ ] Test `ResourceNotFoundException` scenarios
- [ ] Test `ValidationException` with multiple field errors
- [ ] Test `InvalidOperationException` with state validation
- [ ] Test `PaymentFailedException` with M-Pesa mock
- [ ] Test `DuplicateResourceException` with duplicate data
- [ ] Run the test suite: `mvn test`

**Test example**:
```java
@Test
public void testInsufficientStockThrowsException() {
    Product product = new Product();
    product.setQuantity(5);
    product.setName("Test Product");

    InsufficientStockException ex = assertThrows(
        InsufficientStockException.class,
        () -> inventoryService.deductStock(product, 10)
    );

    assertEquals("Test Product", ex.getProductName());
    assertEquals(10, ex.getRequiredQuantity());
    assertEquals(5, ex.getAvailableQuantity());
}
```

## Phase 4: Frontend - Setup

### Create API Service with Error Handling
- [ ] Open `UI/pos/lib/api-service.ts`
- [ ] Add axios interceptor for errors (copy from [FRONTEND_ERROR_HANDLING.md](./FRONTEND_ERROR_HANDLING.md))
- [ ] Set up JWT token injection in requests
- [ ] Test with a simple API call

**Setup code**:
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
    const { status } = error.response?.data || {};
    // Handle errors based on status code
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Create Error Alert Component
- [ ] Create `UI/pos/components/ErrorAlert.tsx`
- [ ] Support dismissable alerts
- [ ] Auto-dismiss after timeout
- [ ] Support different alert types (error, warning, success)
- [ ] Add to layout

**Component code**:
```typescript
// components/ErrorAlert.tsx
import { useState, useEffect } from 'react';

export function ErrorAlert() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const handleError = (event: CustomEvent) => {
      const { message, type = 'error' } = event.detail;
      const id = Date.now();
      setAlerts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, 5000);
    };

    window.addEventListener('showError', handleError as EventListener);
    return () => window.removeEventListener('showError', handleError as EventListener);
  }, []);

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {alerts.map((alert) => (
        <div key={alert.id} className={`alert alert-${alert.type} p-4 rounded`}>
          {alert.message}
        </div>
      ))}
    </div>
  );
}
```

## Phase 5: Frontend - Component Integration

### Login/Auth Pages
- [ ] Add error handling to login form
- [ ] Handle `UNAUTHORIZED` and `INVALID_TOKEN` responses
- [ ] Redirect to login on token expiry
- [ ] Show field errors for invalid credentials

**File**: `UI/pos/app/login/page.tsx`

```typescript
try {
  await apiClient.post('/auth/login', credentials);
} catch (error: any) {
  const { status, fieldErrors } = error.response?.data;
  if (status === 'VALIDATION_FAILED') {
    setErrors(fieldErrors);
  } else {
    showError('Login failed. Please check your credentials.');
  }
}
```

### Product Management Pages
- [ ] Handle form validation errors
- [ ] Show field-level validation messages
- [ ] Handle duplicate product names/codes
- [ ] Test create, update, delete operations

**File**: `UI/pos/components/ProductForm.tsx`

```typescript
try {
  await apiClient.post('/products/create', formData);
} catch (error: any) {
  const { status, fieldErrors } = error.response?.data;
  if (status === 'VALIDATION_FAILED') {
    Object.entries(fieldErrors).forEach(([field, msg]) => {
      setFormError(field, msg);
    });
  }
}
```

### Order/Sales Pages
- [ ] Handle `INSUFFICIENT_STOCK` validation
- [ ] Show available quantity when stock is insufficient
- [ ] Allow quantity adjustment
- [ ] Prevent submitting with insufficient stock

**File**: `UI/pos/components/OrderForm.tsx` or `SalesForm.tsx`

```typescript
try {
  await addToCart(productId, quantity);
} catch (error: any) {
  if (error.response?.data?.status === 'INSUFFICIENT_STOCK') {
    setStockError(`Only ${availableQty} items available`);
  }
}
```

### Payment Pages
- [ ] Handle `PAYMENT_FAILED` responses
- [ ] Show payment method specific errors
- [ ] Provide retry mechanism
- [ ] Show payment status during processing

**File**: `UI/pos/components/PaymentForm.tsx`

```typescript
try {
  await apiClient.post('/purchases/initiate', { orderId, phoneNumber });
} catch (error: any) {
  if (error.response?.data?.status === 'PAYMENT_FAILED') {
    showError('Payment failed. Please try again.');
    showRetryButton();
  }
}
```

### Admin Pages
- [ ] Handle all error types that the admin operations can produce
- [ ] Show success confirmations
- [ ] Handle unauthorized operations
- [ ] Show validation errors for admin forms

**File**: `UI/pos/app/admin/page.tsx`

## Phase 6: Frontend - Testing

- [ ] Test form with invalid input
- [ ] Test adding out-of-stock items to cart
- [ ] Test duplicate user creation
- [ ] Test payment failure and retry
- [ ] Test token expiry and login redirect
- [ ] Test network errors
- [ ] Test error alert auto-dismiss
- [ ] Test field error display near form fields

**Manual test scenarios**:
1. Try creating a product with empty name → Should show "Name is required"
2. Try buying 100 items when only 10 in stock → Should show insufficient stock
3. Try registering with existing email → Should show "Email already exists"
4. Trigger M-Pesa payment with fake number → Should show payment error with retry

## Phase 7: Backend - Build and Deploy

- [ ] Run `mvn clean package` to build
- [ ] Check for compilation errors
- [ ] Run unit tests: `mvn test`
- [ ] Verify JAR file is created
- [ ] Test Docker build if using containers
- [ ] Review logs for any warnings

## Phase 8: End-to-End Testing

- [ ] Test complete user flow: Login → Browse → Add to Cart → Checkout
- [ ] Test with invalid inputs at each step
- [ ] Test with insufficient stock
- [ ] Test payment scenarios
- [ ] Verify error messages are user-friendly
- [ ] Check error codes in browser console
- [ ] Verify database operations are atomic (no partial updates on error)
- [ ] Test with multiple users simultaneously
- [ ] Test error scenarios under load

## Phase 9: Documentation & Deployment

- [ ] Update README.md with exception handling info (or link to docs)
- [ ] Add team notes about exception handling approach
- [ ] Document any custom exceptions added beyond the base set
- [ ] Create deployment guide for error monitoring
- [ ] Set up log aggregation (if applicable)
- [ ] Brief team on new exception handling system

## Phase 10: Post-Deployment Monitoring

- [ ] Monitor logs for unexpected errors
- [ ] Track error rates by exception type
- [ ] Check if users encounter any unhandled errors
- [ ] Gather feedback on error messages
- [ ] Fix any edge cases discovered
- [ ] Consider adding more specific exceptions as needed

---

## Quick Status Board

```
Backend Infrastructure:        ✅ DONE
  - Exception classes created
  - GlobalExceptionHandler updated
  - ApiResponse enhanced

Backend Integration:            ⏳ TODO
  - Update InventoryService
  - Update OrderService
  - Update PurchaseService
  - Update UserService
  - Add unit tests

Backend Testing:               ⏳ TODO
  - Test all exception scenarios
  - Build and verify no errors

Frontend Setup:                ⏳ TODO
  - Create API service with interceptors
  - Create error alert component

Frontend Integration:          ⏳ TODO
  - Login page error handling
  - Product pages error handling
  - Order/sales error handling
  - Payment error handling

Testing & QA:                  ⏳ TODO
  - Manual testing of scenarios
  - E2E testing
  - Load testing

Documentation & Deploy:        ⏳ TODO
  - Team documentation
  - Deploy to production
  - Monitor and adjust
```

## Estimated Timeline

- **Phase 1-3** (Backend): 4-6 hours (depending on service count)
- **Phase 4-6** (Frontend): 3-4 hours
- **Phase 7-10** (Testing & Deploy): 4-6 hours

**Total**: ~12 hours for full implementation

## Files to Work On

### High Priority (Do First)
1. `POS/src/main/java/Retail/POS/service/InventoryService.java`
2. `POS/src/main/java/Retail/POS/service/OrderService.java`
3. `UI/pos/lib/api-service.ts`
4. Create `UI/pos/components/ErrorAlert.tsx`

### Medium Priority (Do Second)
1. `POS/src/main/java/Retail/POS/service/PurchaseService.java`
2. `POS/src/main/java/Retail/POS/service/UserService.java`
3. Forms that accept user input

### Lower Priority (Nice to Have)
1. Other services (ReportService, ScanService, etc.)
2. Advanced error state management

## Help Resources

- **Quick Ref**: [EXCEPTION_HANDLING_QUICK_REFERENCE.md](./EXCEPTION_HANDLING_QUICK_REFERENCE.md)
- **Backend Guide**: [EXCEPTION_HANDLING.md](./EXCEPTION_HANDLING.md)
- **Frontend Guide**: [FRONTEND_ERROR_HANDLING.md](./FRONTEND_ERROR_HANDLING.md)
- **Examples**: `POS/src/main/java/Retail/POS/service/ExceptionHandlingExamples.java`
- **Summary**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**Start with Phase 2 Step 1 and work your way down!**
