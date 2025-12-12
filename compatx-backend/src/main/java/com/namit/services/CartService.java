package com.namit.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.namit.dtos.cart.AddToCartDTO;
import com.namit.dtos.cart.CartItemResponseDTO;
import com.namit.dtos.cart.CartResponseDTO;
import com.namit.dtos.cart.ProductInCartDTO;
import com.namit.dtos.cart.UpdateCartItemDTO;
import com.namit.models.AppUser;
import com.namit.models.Cart;
import com.namit.models.CartItem;
import com.namit.models.Product;
import com.namit.repositories.AppUserRepository;
import com.namit.repositories.CartItemRepository;
import com.namit.repositories.CartRepository;
import com.namit.repositories.ProductRepository;
import com.namit.responsewrapper.MyResponseWrapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final AppUserRepository userRepository;
    private final MyResponseWrapper responseWrapper;

    // GET CART — PURE READ
    @Transactional(readOnly = true)
    public ResponseEntity<?> getCart(Long userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserIdWithItems(userId);

        if (!cartOpt.isPresent()) {
            CartResponseDTO empty = CartResponseDTO.builder()
                .cartId(null)
                .items(List.of())
                .totalItems(0)
                .totalPrice(0.0)
                .updatedAt(null)
                .build();

            return responseWrapper.universalResponse("Cart retrieved", empty, HttpStatus.OK);
        }

        CartResponseDTO response = mapToCartResponse(cartOpt.get());
        return responseWrapper.universalResponse("Cart retrieved", response, HttpStatus.OK);
    }

    // ADD TO CART — CREATES CART IF MISSING
    public ResponseEntity<?> addToCart(Long userId, AddToCartDTO request) {

        Optional<Product> productOpt = productRepository.findById(request.getProductId());
        if (!productOpt.isPresent()) {
            return responseWrapper.universalResponse("Product not found", null, HttpStatus.NOT_FOUND);
        }

        Product product = productOpt.get();

        if (product.getStock() < request.getQuantity()) {
            return responseWrapper.universalResponse(
                "Insufficient stock. Available: " + product.getStock(),
                null,
                HttpStatus.BAD_REQUEST
            );
        }

        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> existingItem =
                cartItemRepository.findByCart_CartIdAndProduct_Id(cart.getCartId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQty = item.getQuantity() + request.getQuantity();

            if (product.getStock() < newQty) {
                return responseWrapper.universalResponse(
                    "Cannot add more. Available stock: " + product.getStock(),
                    null,
                    HttpStatus.BAD_REQUEST
                );
            }

            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setPriceAtAdd(product.getPrice());

            cart.addItem(cartItem);
            cartItemRepository.save(cartItem);
        }

        cartRepository.save(cart);
        return responseWrapper.universalResponse("Item added to cart", 
                mapToCartResponse(cart), HttpStatus.OK);
    }

    // UPDATE QUANTITY
    public ResponseEntity<?> updateCartItem(Long userId, Long cartItemId, UpdateCartItemDTO request) {

        Optional<CartItem> cartItemOpt = cartItemRepository.findByIdAndUserId(cartItemId, userId);

        if (!cartItemOpt.isPresent()) {
            return responseWrapper.universalResponse("Cart item not found", null, HttpStatus.NOT_FOUND);
        }

        CartItem cartItem = cartItemOpt.get();
        Product product = cartItem.getProduct();

        if (product.getStock() < request.getQuantity()) {
            return responseWrapper.universalResponse(
                "Insufficient stock. Available: " + product.getStock(),
                null,
                HttpStatus.BAD_REQUEST
            );
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        return responseWrapper.universalResponse("Cart item updated", 
                mapToCartResponse(cartItem.getCart()), HttpStatus.OK);
    }

    // REMOVE ITEM
    public ResponseEntity<?> removeCartItem(Long userId, Long cartItemId) {

        Optional<CartItem> cartItemOpt = cartItemRepository.findByIdAndUserId(cartItemId, userId);

        if (!cartItemOpt.isPresent()) {
            return responseWrapper.universalResponse("Cart item not found", null, HttpStatus.NOT_FOUND);
        }

        CartItem item = cartItemOpt.get();
        Cart cart = item.getCart();

        cart.removeItem(item);
        cartItemRepository.delete(item);

        return responseWrapper.universalResponse("Item removed", 
                mapToCartResponse(cart), HttpStatus.OK);
    }

    // CLEAR CART
    public ResponseEntity<?> clearCart(Long userId) {

        Optional<Cart> cartOpt = cartRepository.findByUser_UserId(userId);

        if (!cartOpt.isPresent()) {
            return responseWrapper.universalResponse("Cart not found", null, HttpStatus.NOT_FOUND);
        }

        Cart cart = cartOpt.get();
        cart.clearItems();
        cartItemRepository.deleteByCart_CartId(cart.getCartId());
        cartRepository.save(cart);

        return responseWrapper.universalResponse("Cart cleared", null, HttpStatus.OK);
    }

    // COUNT ITEMS PURE READ
    @Transactional(readOnly = true)
    public ResponseEntity<?> getCartItemCount(Long userId) {

        Optional<Cart> cartOpt = cartRepository.findByUser_UserId(userId);

        if (!cartOpt.isPresent()) {
            return responseWrapper.universalResponse("Cart count retrieved", 0, HttpStatus.OK);
        }

        Integer count = cartItemRepository.getTotalQuantityByCartId(cartOpt.get().getCartId());
        return responseWrapper.universalResponse("Cart count retrieved", count, HttpStatus.OK);
    }

    // HELPERS

    private Cart getOrCreateCart(Long userId) {

        Optional<Cart> cartOpt = cartRepository.findByUserIdWithItems(userId);
        if (cartOpt.isPresent()) return cartOpt.get();

        Optional<AppUser> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found");
        }

        Cart newCart = new Cart();
        newCart.setUser(userOpt.get());
        return cartRepository.save(newCart);
    }


    private CartResponseDTO mapToCartResponse(Cart cart) {
        List<CartItemResponseDTO> itemDTOs = cart.getItems().stream()
            .map(this::mapToCartItemResponse)
            .collect(Collectors.toList());

        return CartResponseDTO.builder()
            .cartId(cart.getCartId())
            .items(itemDTOs)
            .totalItems(cart.getTotalItems())
            .totalPrice(cart.getTotalPrice())
            .updatedAt(cart.getUpdatedAt())
            .build();
    }

    private CartItemResponseDTO mapToCartItemResponse(CartItem item) {
        Product product = item.getProduct();

        ProductInCartDTO productDTO = ProductInCartDTO.builder()
            .productId(product.getId())
            .productName(product.getProductName())
            .brand(product.getBrand())
            .imageUrl(product.getImageUrl())
            .availableStock(product.getStock())
            .currentPrice(product.getPrice())
            .build();

        return CartItemResponseDTO.builder()
            .cartItemId(item.getCartItemId())
            .product(productDTO)
            .quantity(item.getQuantity())
            .priceAtAdd(item.getPriceAtAdd())
            .subtotal(item.getSubtotal())
            .build();
    }
}
