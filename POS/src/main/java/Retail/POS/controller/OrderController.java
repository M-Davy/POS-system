package Retail.POS.controller;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import Retail.POS.domain.OrderStatus;
import Retail.POS.exceptions.InsufficientStockException;
import Retail.POS.payload.dto.OrderRequestDto;
import Retail.POS.payload.dto.OrderResponseDto;
import Retail.POS.payload.dto.TopProductDto;
import Retail.POS.payload.response.ApiResponse;
import Retail.POS.service.OrderService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    private final OrderService orderService;

    @GetMapping("/monthly/total")
    public ResponseEntity<Double> getMonthlySalesTotal() {
        // Implementation: Sum sales where date is >= first day of current month
        return ResponseEntity.ok(orderService.getMonthlySalesTotal());
    }

    @GetMapping("/reports/top-selling")
    public ResponseEntity<List<TopProductDto>> getTopSellingProducts() {
        // Implementation: Group order items by product and sum quantity
        return ResponseEntity.ok(orderService.getTopSellingProducts());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequestDto request
    ) {
        try {
            logger.info("[CONTROLLER] Creating order with {} items", request.getOrderItems().size());
            OrderResponseDto order = orderService.createOrder(request);
            logger.info("[CONTROLLER] Order created successfully: {}", order.getId());
            return ResponseEntity.ok(order);
        } catch (InsufficientStockException ex) {
            logger.warn("[CONTROLLER] Caught InsufficientStockException: {}", ex.getMessage());
            ApiResponse response = new ApiResponse(false, ex.getMessage());
            response.setStatus("INSUFFICIENT_STOCK");
            return new ResponseEntity<>(response, HttpStatus.CONFLICT);
        } catch (Exception ex) {
            logger.error("[CONTROLLER] Unexpected error creating order", ex);
            ApiResponse response = new ApiResponse(false, "Failed to create order: " + ex.getMessage());
            response.setStatus("ERROR");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByDate(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end
    ) {
        return ResponseEntity.ok(
                orderService.getOrdersByDate(start, end)
        );
    }

    @GetMapping("/today/total")
    public ResponseEntity<Double> getTodaySalesTotal() {
        return ResponseEntity.ok(orderService.getTodaySalesTotal());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponseDto>> getOrdersByStatus(
            @PathVariable OrderStatus status
    ) {
        return ResponseEntity.ok(
                orderService.getOrdersByStatus(status)
        );
    }
}
