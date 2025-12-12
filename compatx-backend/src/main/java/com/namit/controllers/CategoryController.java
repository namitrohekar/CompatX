package com.namit.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.namit.models.Category;
import com.namit.services.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin
public class CategoryController {

    private final CategoryService categoryService;

    
    @PostMapping("/admin/add-category")
    public ResponseEntity<?> addCategory(@Valid @RequestBody Category category){
        return categoryService.addCategory(category);
    }
    
    
    @GetMapping("/admin/get-all-categories")
    public ResponseEntity<?> getAllCategories(){
        return categoryService.getAllCategories();
    }
    
    
    @PutMapping("/admin/update-category/{categoryId}")
    public ResponseEntity<?> updateCategory(@PathVariable Long categoryId,
                                            @Valid @RequestBody Category category){
        return categoryService.updateCategory(categoryId, category);
    }
    
    
    @DeleteMapping("/admin/delete-category/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long categoryId){
        return categoryService.deleteCategory(categoryId);
    }
    
}
