package Retail.POS.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Entity
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private String brandName;

    @OneToOne
    private User storeOwner;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String description;

    @PrePersist
    protected void onCreate(){
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate(){
        this.updatedAt = LocalDateTime.now();
    }



}
