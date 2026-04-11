# Frontend Exception Handling Guide

## Overview

This guide shows how to handle exceptions from the backend POS API in your Next.js frontend. All errors follow the standardized API response format with specific `status` codes that you can use for programmatic error handling.

## Setup Global API Error Handling

### Option 1: Using Axios Interceptor (Recommended)

Create/update your API service file:

```typescript
// lib/api-service.ts
import axios, { AxiosError, AxiosInstance } from 'axios';

export interface ApiErrorResponse {
  success: false;
  message: string;
  status: string;
  fieldErrors?: Record<string, string>;
  timestamp: string;
}

interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  status: string;
  data: T;
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors and refresh tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const errorData = error.response?.data;

    // Handle specific error codes
    if (errorData?.status) {
      handleApiError(errorData, error.response?.status);
    }

    // Redirect to login on unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Global error handler
export function handleApiError(
  errorData: ApiErrorResponse,
  httpStatus?: number
) {
  const { status, message, fieldErrors } = errorData;

  // Log error for debugging
  console.error(`[API Error] ${status}: ${message}`, fieldErrors);

  switch (status) {
    case 'INSUFFICIENT_STOCK':
      if (typeof window !== 'undefined') {
        // Dispatch event for components to listen to
        window.dispatchEvent(
          new CustomEvent('showError', {
            detail: {
              message: 'This product is out of stock',
              type: 'warning',
            },
          })
        );
      }
      break;

    case 'NOT_FOUND':
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showError', {
            detail: {
              message: 'The requested resource was not found',
              type: 'error',
            },
          })
        );
      }
      break;

    case 'VALIDATION_FAILED':
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('validationError', {
            detail: fieldErrors,
          })
        );
      }
      break;

    case 'PAYMENT_FAILED':
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showError', {
            detail: {
              message: 'Payment processing failed. Please try again.',
              type: 'error',
            },
          })
        );
      }
      break;

    case 'INVALID_TOKEN':
    case 'UNAUTHORIZED':
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
      break;

    case 'DUPLICATE_RESOURCE':
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showError', {
            detail: {
              message: message || 'This resource already exists',
              type: 'error',
            },
          })
        );
      }
      break;

    default:
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('showError', {
            detail: {
              message: message || 'An unexpected error occurred',
              type: 'error',
            },
          })
        );
      }
  }
}

export default apiClient;
```

### Option 2: Custom Hook for Error Handling

```typescript
// hooks/useApiError.ts
import { useCallback } from 'react';
import { AxiosError } from 'axios';

export interface ApiError extends AxiosError {
  response?: {
    data: {
      success: false;
      message: string;
      status: string;
      fieldErrors?: Record<string, string>;
    };
  };
}

export function useApiError() {
  const handleError = useCallback((error: ApiError) => {
    const status = error.response?.data?.status;
    const message = error.response?.data?.message;

    switch (status) {
      case 'INSUFFICIENT_STOCK':
        return {
          type: 'warning' as const,
          message: 'Not enough stock available',
          action: 'updateInventory' as const,
        };

      case 'VALIDATION_FAILED':
        return {
          type: 'validation' as const,
          message: 'Please check your input',
          fieldErrors: error.response?.data?.fieldErrors || {},
        };

      case 'PAYMENT_FAILED':
        return {
          type: 'error' as const,
          message: 'Payment failed. Please try again.',
          action: 'retry' as const,
        };

      case 'UNAUTHORIZED':
      case 'INVALID_TOKEN':
        return {
          type: 'error' as const,
          message: 'Your session has expired. Please log in again.',
          action: 'redirect' as const,
          redirectTo: '/login',
        };

      default:
        return {
          type: 'error' as const,
          message: message || 'An unexpected error occurred',
        };
    }
  }, []);

  return { handleError };
}
```

## Component Error Handling Examples

### Example 1: Form Validation Errors

```typescript
// components/ProductForm.tsx
import { useState } from 'react';
import apiClient, { handleApiError } from '@/lib/api-service';

export function ProductForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setErrors({});

    try {
      const response = await apiClient.post('/products/create', formData);
      // Success
      console.log('Product created:', response.data.data);
    } catch (error: any) {
      const errorData = error.response?.data;

      // Handle validation errors
      if (errorData?.status === 'VALIDATION_FAILED') {
        setErrors(errorData.fieldErrors || {});
      } else {
        // Handle other errors
        handleApiError(errorData, error.response?.status);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }}>
      <div className="form-group">
        <label>Product Name</label>
        <input name="name" type="text" />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Price</label>
        <input name="price" type="number" />
        {errors.price && <span className="error">{errors.price}</span>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
```

### Example 2: Stock Validation

```typescript
// components/AddToCartButton.tsx
import { useState } from 'react';
import apiClient from '@/lib/api-service';

interface Props {
  productId: number;
  availableStock: number;
}

export function AddToCartButton({ productId, availableStock }: Props) {
  const [loading, setLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const handleAddToCart = async (quantity: number) => {
    setLoading(true);
    setStockError(null);

    try {
      await apiClient.post('/orders/add-item', {
        productId,
        quantity,
      });
      // Success - add to cart UI
    } catch (error: any) {
      const errorData = error.response?.data;

      if (errorData?.status === 'INSUFFICIENT_STOCK') {
        setStockError(
          `Only ${availableStock} items available. ` +
          `You requested ${Math.min(quantity, availableStock + 1)}.`
        );
      } else {
        setStockError('Failed to add to cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => handleAddToCart(1)} disabled={loading || availableStock === 0}>
        Add to Cart
      </button>
      {stockError && <div className="error-message">{stockError}</div>}
    </>
  );
}
```

### Example 3: Payment Handling

```typescript
// components/PaymentForm.tsx
import { useState } from 'react';
import apiClient from '@/lib/api-service';

export function PaymentForm({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('MPESA');

  const handlePayment = async (phoneNumber: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/purchases/initiate', {
        orderId,
        paymentMethod,
        phoneNumber,
      });

      if (response.data.success) {
        // Show success message
        console.log('Payment initiated:', response.data.data);
        // Redirect or show confirmation
      }
    } catch (error: any) {
      const errorData = error.response?.data;

      if (errorData?.status === 'PAYMENT_FAILED') {
        // Provide retry option
        setError(
          errorData.message || 'Payment processing failed. Please try again.'
        );
      } else if (errorData?.status === 'VALIDATION_FAILED') {
        // Show field-specific errors
        const fieldErrors = errorData.fieldErrors;
        if (fieldErrors?.phoneNumber) {
          setError(fieldErrors.phoneNumber);
        } else {
          setError('Please check your input');
        }
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="MPESA">M-Pesa</option>
        <option value="CASH">Cash</option>
      </select>

      {error && <div className="alert alert-danger">{error}</div>}

      <button
        onClick={() => handlePayment('+254712345678')}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}
```

### Example 4: Error Alert Component

```typescript
// components/ErrorAlert.tsx
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Alert {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
  duration?: number;
}

export function ErrorAlert() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const handleError = (event: CustomEvent) => {
      const { message, type = 'error' } = event.detail;
      const id = Date.now().toString();

      setAlerts((prev) => [...prev, { id, message, type }]);

      // Auto-remove after duration
      if (event.detail.duration !== 0) {
        setTimeout(() => {
          setAlerts((prev) => prev.filter((a) => a.id !== id));
        }, event.detail.duration || 5000);
      }
    };

    window.addEventListener('showError', handleError as EventListener);
    return () => {
      window.removeEventListener('showError', handleError as EventListener);
    };
  }, []);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="alert-container fixed top-4 right-4 space-y-2 z-50">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`alert alert-${alert.type} flex justify-between items-center`}
        >
          <span>{alert.message}</span>
          <button onClick={() => removeAlert(alert.id)} className="ml-2">
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Always check `status` field**: Use the error code, not HTTP status, for determining error type
2. **Show user-friendly messages**: Don't expose technical error messages
3. **Handle field errors separately**: Display validation errors next to form fields
4. **Provide retry options**: For payment and transient errors
5. **Log errors**: Keep logs for debugging but never log sensitive data
6. **Handle offline**: Check for network errors separately
7. **Clear errors on retry**: Reset error states when user retries an action

## Error Status Codes Reference

| Status | What to Do | User Message |
|--------|-----------|--------------|
| `INSUFFICIENT_STOCK` | Show available quantity | "Only X items available" |
| `NOT_FOUND` | Redirect or show 404 | "Item not found" |
| `VALIDATION_FAILED` | Show field errors | Display near form fields |
| `INVALID_OPERATION` | Disable action | "Cannot perform this action" |
| `PAYMENT_FAILED` | Show retry | "Payment failed. Try again?" |
| `UNAUTHORIZED` | Redirect to login | "Your session expired" |
| `DUPLICATE_RESOURCE` | Clear form | "This already exists" |
| `INTERNAL_ERROR` | Show generic message | "Something went wrong" |

---

## Testing Error Scenarios

```typescript
// __tests__/api-errors.test.ts
import apiClient from '@/lib/api-service';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('/api/orders', (req, res, ctx) => {
    return res(
      ctx.status(409),
      ctx.json({
        success: false,
        message: 'Insufficient stock',
        status: 'INSUFFICIENT_STOCK',
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('handles insufficient stock error', async () => {
  try {
    await apiClient.post('/orders', { quantity: 10 });
  } catch (error: any) {
    expect(error.response.data.status).toBe('INSUFFICIENT_STOCK');
  }
});
```

---

## Troubleshooting

### Error not being caught
- Check if endpoint path is correct
- Verify JWT token is being sent if required
- Check browser console for CORS errors

### Field errors not displaying
- Ensure `fieldErrors` object exists in response
- Check field names match form input names
- Verify error component is rendering fieldErrors properly

### Token refresh not working
- Check token storage location (localStorage, cookies, etc.)
- Verify token refresh endpoint is available
- Ensure Authorization header format is correct (Bearer token)
