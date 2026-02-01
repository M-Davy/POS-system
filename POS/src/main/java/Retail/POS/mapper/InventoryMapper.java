package Retail.POS.mapper;

import Retail.POS.models.Inventory;
import Retail.POS.models.Product;
import Retail.POS.payload.dto.InventoryDto;
import Retail.POS.payload.dto.InventoryResponseDto;

public class InventoryMapper {



    public static InventoryResponseDto toResponseDto(Inventory inventory) {
        return InventoryResponseDto.builder().
                id(inventory.getId()).
                product(ProductMapper.toDto(inventory.getProduct())).
                quantity(inventory.getQuantity()).
                build();




    }
}
