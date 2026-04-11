# Quick Start - Exception Handling Setup

**TL;DR**: Complete exception handling system is ready. Start integrating in 3 steps.

## What You Got

A complete, production-ready exception handling system:

```
✅ 7 exception classes for different error scenarios
✅ Global exception handler that catches all errors
✅ Standard API response format
✅ Factory methods for easy exception creation
✅ Comprehensive documentation with examples
✅ Frontend error handling patterns
✅ Ready-to-use code samples
```

## Your Backend Now Returns This

**Error Response** (all errors follow this format):
```json
{
  "success": false,
  "message": "Insufficient stock available for Product XYZ",
  "status": "INSUFFICIENT_STOCK",
  "fieldErrors": null,
  "data": null,
  "timestamp": "2026-04-11T10:30:45"
}
```

**The `status` field is the key** - use this in frontend to handle errors.

## 3-Step Integration

### Step 1: Update One Service (15 min) 

Open `POS/src/main/java/Retail/POS/service/ProductService.java` and find this:

```java
// OLD
public Product getProductById(Long id) {
    return productRepository.findById(id)
        .orElseThrow(() -> new Exception("Not found"));
}
```

Replace with:
```java
// NEW
public Product getProductById(Long id) {
    return productRepository.findById(id)
        .orElseThrow(() -> ExceptionFactory.notFound("Product", id));
}
```

Add import:
```java
import Retail.POS.exceptions.ExceptionFactory;
```

That's it! The GlobalExceptionHandler will catch this and return the proper JSON error.

### Step 2: Setup Frontend API Service (15 min)

Create `UI/pos/lib/api-service.ts` with error handling:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
});

// Add JWT token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, message } = error.response?.data || {};

    // Handle specific errors
    if (status === 'INSUFFICIENT_STOCK') {
      alert('Not enough items in stock');
    } else if (status === 'PAYMENT_FAILED') {
      alert('Payment failed: ' + message);
    } else if (status === 'UNAUTHORIZED') {
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### Step 3: Use in React Component (10 min)

```typescript
// components/AddToCartButton.tsx
import apiClient from '@/lib/api-service';

export function AddToCartButton() {
  const handleAddToCart = async (productId: number, quantity: number) => {
    try {
      const response = await apiClient.post('/orders', {
        productId,
        quantity,
      });
      alert('Added to cart!');
    } catch (error: any) {
      const status = error.response?.data?.status;
      
      if (status === 'INSUFFICIENT_STOCK') {
        alert('Not enough items in stock');
      } else if (status === 'VALIDATION_FAILED') {
        const errors = error.response.data.fieldErrors;
        Object.entries(errors).forEach(([field, msg]) => {
          console.log(`${field}: ${msg}`);
        });
      } else {
        alert('Error: ' + error.response?.data?.message);
      }
    }
  };

  return (
    <button onClick={() => handleAddToCart(1, 5)}>
      Add to Cart
    </button>
  );
}
```

That's it! Errors are now handled gracefully.

## Exception Reference

Quick lookup table:

| Error | Status Code | What It Means | HTTP |
|-------|-------------|--------------|------|
| Stock too low | `INSUFFICIENT_STOCK` | Not enough items | 409 |
| Item not found | `NOT_FOUND` | ID doesn't exist | 404 |
| Invalid input | `VALIDATION_FAILED` | Form errors | 400 |
| Can't do action | `INVALID_OPERATION` | Invalid state | 400 |
| Payment error | `PAYMENT_FAILED` | M-Pesa failed | 402 |
| Need login | `UNAUTHORIZED` | JWT expired | 401 |
| Already exists | `DUPLICATE_RESOURCE` | Email taken | 409 |

## Common Patterns

### Show validation errors next to fields:
```typescript
catch (error: any) {
  if (error.response?.data?.status === 'VALIDATION_FAILED') {
    const errors = error.response.data.fieldErrors;
    // errors = { "email": "Already taken", "name": "Required" }
    Object.entries(errors).forEach(([field, message]) => {
      showErrorUnderField(field, message);
    });
  }
}
```

### Warn about low stock:
```typescript
catch (error: any) {
  if (error.response?.data?.status === 'INSUFFICIENT_STOCK') {
    showWarning('Only ' + availableQty + ' items available');
  }
}
```

### Handle payment retry:
```typescript
catch (error: any) {
  if (error.response?.data?.status === 'PAYMENT_FAILED') {
    showError(error.response.data.message);
    showRetryButton(); // Let user try again
  }
}
```

## Where to Find Things

| What | Where |
|------|-------|
| New exception classes | `POS/src/main/java/Retail/POS/exceptions/` |
| Global error handler | `POS/src/main/java/Retail/POS/exceptions/GlobalExceptionHandler.java` |
| Create exceptions easily | `POS/src/main/java/Retail/POS/exceptions/ExceptionFactory.java` |
| Example usage | `POS/src/main/java/Retail/POS/service/ExceptionHandlingExamples.java` |
| Comprehensive guide | `EXCEPTION_HANDLING.md` |
| Frontend guide | `FRONTEND_ERROR_HANDLING.md` |
| Quick reference | `EXCEPTION_HANDLING_QUICK_REFERENCE.md` |
| Full checklist | `IMPLEMENTATION_CHECKLIST.md` |
| Summary | `IMPLEMENTATION_SUMMARY.md` |

## Testing It

### Quick backend test:
1. Open Postman
2. Make request to create product with `name: ""` (empty)
3. You should get back:
```json
{
  "success": false,
  "status": "VALIDATION_FAILED",
  "fieldErrors": { "name": "Name is required" }
}
```

### Quick frontend test:
1. Try adding out-of-stock item (need to manually set qty=0 in DB for test)
2. Button click should show "Not enough items in stock"
3. Check browser console - should see `INSUFFICIENT_STOCK` status

## Common Mistakes to Avoid

❌ **Don't**: Check HTTP status code  
✅ **Do**: Check `error.response?.data?.status`

❌ **Don't**: Show error from backend directly  
✅ **Do**: Use status code to show appropriate user message

❌ **Don't**: Throw generic `Exception` or `RuntimeException`  
✅ **Do**: Use specific exception like `InsufficientStockException`

❌ **Don't**: Forget to import ExceptionFactory  
✅ **Do**: Add `import Retail.POS.exceptions.ExceptionFactory;`

## Next: Full Integration

Once 3-step setup works:

1. Go through [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
2. Update all services (InventoryService, OrderService, PurchaseService, UserService)
3. Add comprehensive error handling to all frontend forms
4. Test everything end-to-end

**Estimated time**: 
- Quick start (3 steps): 40-60 minutes
- Full integration: 12-16 hours

## Quick Links

- 📖 [Full Documentation](./EXCEPTION_HANDLING.md)
- 🚀 [Quick Reference](./EXCEPTION_HANDLING_QUICK_REFERENCE.md)
- ✅ [Checklist](./IMPLEMENTATION_CHECKLIST.md)
- 💻 [Frontend Guide](./FRONTEND_ERROR_HANDLING.md)
- 📝 [Examples](./POS/src/main/java/Retail/POS/service/ExceptionHandlingExamples.java)

---

**Ready? Start with Step 1: Update one service!**
