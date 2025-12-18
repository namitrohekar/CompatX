package com.namit.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.namit.dtos.auth.CustomerProductDTO;
import com.namit.dtos.auth.ProductStatsDTO;
import com.namit.mappers.CustomerProductMapper;
import com.namit.models.AppUser;
import com.namit.models.Category;
import com.namit.models.Product;
import com.namit.repositories.AppUserRepository;
import com.namit.repositories.CategoryRepository;
import com.namit.repositories.ProductRepository;
import com.namit.responsewrapper.MyResponseWrapper;
import com.namit.specifications.ProductSpecification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AppUserRepository userRepository;
    private final MyResponseWrapper responseWrapper;



    // temp products
    public ResponseEntity<?> createProduct(Product product, Long categoryId, Long userId) {

        // category exists?
        Optional<Category> category = categoryRepository.findById(categoryId);
        if (!category.isPresent()) {
            return responseWrapper.universalResponse("Category not Found !", null, HttpStatus.NOT_FOUND);
        }

        // user exists?
        Optional<AppUser> user = userRepository.findById(userId);
        if (!user.isPresent()) {
            return responseWrapper.universalResponse("User Not Found ", null, HttpStatus.NOT_FOUND);
        }

        // set relations
        product.setCategory(category.get());
        product.setUser(user.get());

        Product savedProduct = productRepository.save(product);
        return responseWrapper.universalResponse("Product created SuccessFully ", savedProduct, HttpStatus.CREATED);
    }

    // GET ALL PRODUCTS
    public ResponseEntity<?> getAllProducts() {
        List<Product> product = productRepository.findAll();
        return responseWrapper.universalResponse("Products fetched successfully ", product, HttpStatus.OK);
    }

    // GET PRODUCTS BY ID
    public ResponseEntity<?> getProductById(Long productId) {

        Optional<Product> product = productRepository.findById(productId);

        if (product.isPresent()) {
            return responseWrapper.universalResponse("Product Found ", product.get(), HttpStatus.OK);
        } else {
            return responseWrapper.universalResponse("Product not found ", null, HttpStatus.NOT_FOUND);
        }
    }

    // GET PRODUCTS BY CATEGORY
    public ResponseEntity<?> getProductsByCategory(Long categoryId) {

        List<Product> products = productRepository.findByCategoryCategoryId(categoryId);

        if (products.isEmpty()) {
            return responseWrapper.universalResponse("Sorry no product for this category ", products, HttpStatus.OK);
        } else {
            return responseWrapper.universalResponse("Products found for  following category ", products, HttpStatus.OK);
        }
    }

    // SEARCH PRODUCTS
    public ResponseEntity<?> searchProducts(String keyword) {
        List<Product> products =
                productRepository.findByProductNameContainingIgnoreCaseOrBrandContainingIgnoreCase(keyword, keyword);

        if (products.isEmpty()) {
            return responseWrapper.universalResponse(" No Search results", null, HttpStatus.NOT_FOUND);
        } else {
            return responseWrapper.universalResponse("Search results", products, HttpStatus.OK);
        }
    }

    // Advance Search
    public ResponseEntity<?> smartSearch(String keyword) {

        List<Product> all = productRepository.findAll();
        String[] tokens = keyword.toLowerCase().split("\\s+");  // split by spaces

        List<Product> filtered = all.stream()
            .filter(p -> {
                String name = p.getProductName().toLowerCase();
                String brand = p.getBrand().toLowerCase();

                // every token must match productName OR brand
                for (String token : tokens) {
                    if (!(name.contains(token) || brand.contains(token))) {
                        return false;
                    }
                }
                return true;
            })
            .collect(Collectors.toList());

        if (filtered.isEmpty()) {
            return responseWrapper.universalResponse("No smart search results found", filtered, HttpStatus.OK);
        } else {
            return responseWrapper.universalResponse("Smart Search results", filtered, HttpStatus.OK);
        }
    }

    // UPDATE PRODUCT
    public ResponseEntity<?> updateProduct(Long productId, Product productData, Long categoryId) {

        Optional<Product> existingProduct = productRepository.findById(productId);
        if (!existingProduct.isPresent()) {
            return responseWrapper.universalResponse("Product not found ", null, HttpStatus.NOT_FOUND);
        }

        Product product = existingProduct.get();

        product.setProductName(productData.getProductName());
        product.setBrand(productData.getBrand());
        product.setDescription(productData.getDescription());
        product.setPrice(productData.getPrice());
        product.setStock(productData.getStock());

        // update category if provided
        if (categoryId != null) {
            Optional<Category> category = categoryRepository.findById(categoryId);
            if (category.isPresent()) {
                product.setCategory(category.get());
            }
        }

        // same for image
        if (productData.getImageUrl() != null) {
            product.setImageUrl(productData.getImageUrl());
        }

        Product updatedProduct = productRepository.save(product);
        return responseWrapper.universalResponse("Product updated successfully", updatedProduct, HttpStatus.OK);
    }

    // DELETE PRODUCT
    public ResponseEntity<?> deleteProduct(Long productId) {
        Optional<Product> product = productRepository.findById(productId);

        if (!product.isPresent()) {
            return responseWrapper.universalResponse("Product not found", null, HttpStatus.NOT_FOUND);
        }

        productRepository.deleteById(productId);
        return responseWrapper.universalResponse("Product deleted successfully", null, HttpStatus.OK);
    }

    // PRODUCT STATS (GLOBAL)
    public ResponseEntity<?> getProductStats() {
        try {
            Long totalProducts = productRepository.count();
            Long totalCategories = categoryRepository.count();
            Long totalBrands = productRepository.countDistinctBrand();

            ProductStatsDTO stats = new ProductStatsDTO(
                totalProducts != null ? totalProducts : 0L,
                totalCategories != null ? totalCategories : 0L,
                totalBrands != null ? totalBrands : 0L
            );

            return responseWrapper.universalResponse(
                "Stats fetched successfully",
                stats,
                HttpStatus.OK
            );
        } catch (Exception e) {

            e.printStackTrace();
            return responseWrapper.universalResponse(
                "Failed to fetch stats",
                null,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // FILTER PRODUCTS  specification / temp paging
    public ResponseEntity<?> filterProducts(
            String keyword,
            Long categoryId,
            String brand,
            Double minPrice,
            Double maxPrice,
            Integer minStock,
            Integer maxStock,
            String sortField,
            String sortDirection,
            Integer page,
            Integer size
    ) {
        Specification<Product> spec = Specification.where(ProductSpecification.keywordContains(keyword))
                .and(ProductSpecification.hasCategory(categoryId))
                .and(ProductSpecification.brandContains(brand))
                .and(ProductSpecification.priceBetween(minPrice, maxPrice))
                .and(ProductSpecification.stockBetween(minStock, maxStock));

        Pageable pageable;
        if (page != null && size != null) {
            Sort sort = Sort.unsorted();
            if (sortField != null && !sortField.isBlank()) {
                sort = sortDirection != null && sortDirection.equalsIgnoreCase("desc")
                        ? Sort.by(sortField).descending()
                        : Sort.by(sortField).ascending();
            }
            pageable = PageRequest.of(page, size, sort);
            Page<Product> resultPage = productRepository.findAll(spec, pageable);

            Map<String, Object> payload = new HashMap<>();
            payload.put("items", resultPage.getContent());
            payload.put("page", resultPage.getNumber());
            payload.put("size", resultPage.getSize());
            payload.put("totalElements", resultPage.getTotalElements());
            payload.put("totalPages", resultPage.getTotalPages());

            return responseWrapper.universalResponse("Filtered products", payload, HttpStatus.OK);
        } else {
            List<Product> items = productRepository.findAll(spec, Sort.unsorted());
            return responseWrapper.universalResponse("Filtered products", items, HttpStatus.OK);
        }
    }

    
   //  CUSTOMER SERVICES
     
    public ResponseEntity<?> customerFilterProducts(
            String keyword,
            Long categoryId,
            String brand,
            Double minPrice,
            Double maxPrice,
            String sortField,
            String sortDirection,
            Integer page,
            Integer size
    ) {
        Specification<Product> spec = Specification.where(ProductSpecification.keywordContains(keyword))
                .and(ProductSpecification.hasCategory(categoryId))
                .and(ProductSpecification.brandContains(brand))
                .and(ProductSpecification.priceBetween(minPrice, maxPrice));

        Sort sort = Sort.unsorted();
        if (sortField != null && !sortField.isBlank()) {
            sort = sortDirection != null && sortDirection.equalsIgnoreCase("desc")
                    ? Sort.by(sortField).descending()
                    : Sort.by(sortField).ascending();
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> resultPage = productRepository.findAll(spec, pageable);

        Map<String, Object> payload = new HashMap<>();
        payload.put("items", resultPage.getContent());
        payload.put("page", resultPage.getNumber());
        payload.put("size", resultPage.getSize());
        payload.put("totalElements", resultPage.getTotalElements());
        payload.put("totalPages", resultPage.getTotalPages());

        return responseWrapper.universalResponse("Filtered products", payload, HttpStatus.OK);
    }

    // CUSTOMER GET ALL PRODUCTS
    public ResponseEntity<?> customerGetAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> result = productRepository.findAll(pageable);

        Map<String, Object> payload = new HashMap<>();
        payload.put("items", result.getContent());
        payload.put("page", result.getNumber());
        payload.put("size", result.getSize());
        payload.put("totalElements", result.getTotalElements());
        payload.put("totalPages", result.getTotalPages());

        return responseWrapper.universalResponse(
                "Customer products",
                payload,
                HttpStatus.OK
        );
    }

    // SINGLE PRODUCT FOR CUSTOMER
    public ResponseEntity<?> getCustomerProduct(Long id) {

        Product p = productRepository.findById(id).orElse(null);

        if (p == null) {
            return responseWrapper.universalResponse("Not Found ", null, HttpStatus.NOT_FOUND);
        }

        return responseWrapper.universalResponse("Product Found ", CustomerProductMapper.toDTO(p), HttpStatus.OK);
    }

    // RELATED PRODUCTS
    public ResponseEntity<?> getRelatedProducts(Long categoryId, Long excludeId) {

        List<Product> list = productRepository.findByCategoryCategoryId(categoryId);

        List<CustomerProductDTO> dtoList = list.stream()
                .filter(p -> !p.getId().equals(excludeId))
                .map(CustomerProductMapper::toDTO)
                .limit(4)
                .toList();

        return responseWrapper.universalResponse("Okay", dtoList, HttpStatus.OK);
    }

    
    // ADMIN-OWNERSHIP METHODS
   

    private boolean isNotOwner(Product product, Long adminUserId) {
        return product.getUser() == null ||
               product.getUser().getUserId() == null ||
               !product.getUser().getUserId().equals(adminUserId);
    }

    // ADMIN: create product for self (owner = logged-in admin)
    public ResponseEntity<?> adminCreateProduct(Long adminUserId, Product product, Long categoryId) {

        Optional<Category> category = categoryRepository.findById(categoryId);
        if (!category.isPresent()) {
            return responseWrapper.universalResponse("Category not Found !", null, HttpStatus.NOT_FOUND);
        }

        AppUser admin = userRepository.findById(adminUserId)
                .orElse(null);

        if (admin == null) {
            return responseWrapper.universalResponse("Admin user not found", null, HttpStatus.NOT_FOUND);
        }

        product.setCategory(category.get());
        product.setUser(admin);

        Product savedProduct = productRepository.save(product);
        return responseWrapper.universalResponse("Product created successfully", savedProduct, HttpStatus.CREATED);
    }

    // ADMIN: get only own products (paginated)
    public ResponseEntity<?> adminGetProducts(Long adminUserId, int page, int size) {

        Specification<Product> spec = (root, query, cb) ->
                cb.equal(root.get("user").get("userId"), adminUserId);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> result = productRepository.findAll(spec, pageable);

        Map<String, Object> payload = new HashMap<>();
        payload.put("items", result.getContent());
        payload.put("page", result.getNumber());
        payload.put("size", result.getSize());
        payload.put("totalElements", result.getTotalElements());
        payload.put("totalPages", result.getTotalPages());

        return responseWrapper.universalResponse("Admin products", payload, HttpStatus.OK);
    }

    // ADMIN: get single product, but only if owned
    public ResponseEntity<?> adminGetProduct(Long adminUserId, Long productId) {

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return responseWrapper.universalResponse("Product not found", null, HttpStatus.NOT_FOUND);
        }

        if (isNotOwner(product, adminUserId)) {
            return responseWrapper.universalResponse("Forbidden: You do not own this product", null, HttpStatus.FORBIDDEN);
        }

        return responseWrapper.universalResponse("Product found", product, HttpStatus.OK);
    }

    // ADMIN: update only own product
    public ResponseEntity<?> adminUpdateProduct(Long adminUserId, Long productId, Product productData, Long categoryId) {

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return responseWrapper.universalResponse("Product not found", null, HttpStatus.NOT_FOUND);
        }

        if (isNotOwner(product, adminUserId)) {
            return responseWrapper.universalResponse("Forbidden: You do not own this product", null, HttpStatus.FORBIDDEN);
        }

        product.setProductName(productData.getProductName());
        product.setBrand(productData.getBrand());
        product.setDescription(productData.getDescription());
        product.setPrice(productData.getPrice());
        product.setStock(productData.getStock());

        if (categoryId != null) {
            Optional<Category> category = categoryRepository.findById(categoryId);
            category.ifPresent(product::setCategory);
        }

        if (productData.getImageUrl() != null) {
            product.setImageUrl(productData.getImageUrl());
        }

        Product updatedProduct = productRepository.save(product);
        return responseWrapper.universalResponse("Product updated successfully", updatedProduct, HttpStatus.OK);
    }

    // ADMIN: delete only own product
    public ResponseEntity<?> adminDeleteProduct(Long adminUserId, Long productId) {

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return responseWrapper.universalResponse("Product not found", null, HttpStatus.NOT_FOUND);
        }

        if (isNotOwner(product, adminUserId)) {
            return responseWrapper.universalResponse("Forbidden: You do not own this product", null, HttpStatus.FORBIDDEN);
        }

        productRepository.delete(product);
        return responseWrapper.universalResponse("Product deleted successfully", null, HttpStatus.OK);
    }

    // ADMIN: filter only own products
    public ResponseEntity<?> adminFilterProducts(
            Long adminUserId,
            String keyword,
            Long categoryId,
            String brand,
            Double minPrice,
            Double maxPrice,
            Integer minStock,
            Integer maxStock,
            String sortField,
            String sortDirection,
            Integer page,
            Integer size
    ) {
        Specification<Product> spec = Specification.where(ProductSpecification.keywordContains(keyword))
                .and(ProductSpecification.hasCategory(categoryId))
                .and(ProductSpecification.brandContains(brand))
                .and(ProductSpecification.priceBetween(minPrice, maxPrice))
                .and(ProductSpecification.stockBetween(minStock, maxStock))
                .and((root, query, cb) -> cb.equal(root.get("user").get("userId"), adminUserId));

        Pageable pageable;
        if (page != null && size != null) {
            Sort sort = Sort.unsorted();
            if (sortField != null && !sortField.isBlank()) {
                sort = sortDirection != null && sortDirection.equalsIgnoreCase("desc")
                        ? Sort.by(sortField).descending()
                        : Sort.by(sortField).ascending();
            }
            pageable = PageRequest.of(page, size, sort);
            Page<Product> resultPage = productRepository.findAll(spec, pageable);

            Map<String, Object> payload = new HashMap<>();
            payload.put("items", resultPage.getContent());
            payload.put("page", resultPage.getNumber());
            payload.put("size", resultPage.getSize());
            payload.put("totalElements", resultPage.getTotalElements());
            payload.put("totalPages", resultPage.getTotalPages());

            return responseWrapper.universalResponse("Filtered admin products", payload, HttpStatus.OK);
        } else {
            List<Product> items = productRepository.findAll(spec, Sort.unsorted());
            return responseWrapper.universalResponse("Filtered admin products", items, HttpStatus.OK);
        }
    }
}
