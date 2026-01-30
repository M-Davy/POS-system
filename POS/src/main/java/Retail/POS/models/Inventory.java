package Retail.POS.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "productId", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

}
