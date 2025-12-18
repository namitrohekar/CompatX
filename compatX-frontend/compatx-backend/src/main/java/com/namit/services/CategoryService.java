package com.namit.services;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.namit.models.Category;
import com.namit.repositories.CategoryRepository;
import com.namit.responsewrapper.MyResponseWrapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    
    private final MyResponseWrapper responseWrapper;
    

    
    // Add Category
    
    public ResponseEntity<?> addCategory(Category category ){
        
        Optional<Category> categoryExists = categoryRepository.findByCategoryName(category.getCategoryName());
        
        if (categoryExists.isPresent()) {
            
            return responseWrapper.universalResponse("The category already Exists", null, HttpStatus.CONFLICT);
            
        } else {
            
            Category savedCategory =  categoryRepository.save(category);
            
            return responseWrapper.universalResponse("The category created Successfully !", savedCategory, HttpStatus.CREATED);
        }
    }
    
    
    // Get All category 
    
    public ResponseEntity<?> getAllCategories() {
        
        List<Category> categories = categoryRepository.findAll();
        
        if (categories.size() == 0) {
            return responseWrapper.universalResponse(" currently There are no categories ", null, HttpStatus.OK);
            
        } else {
            
            return responseWrapper.universalResponse("Categories Found ", categories, HttpStatus.OK);

        }
    }
    
    
    
    // update category by id
    public ResponseEntity<?> updateCategory(Long categoryId, Category category) {
        
        Optional<Category> categoryExist = categoryRepository.findById(categoryId);
        
        if (!categoryExist.isPresent()) {
            return responseWrapper.universalResponse(
                    "The Category with id " + categoryId + " does not exist",
                    null,
                    HttpStatus.NOT_FOUND
            );
        } else {
            Category existingCategory = categoryExist.get();
            
            // Update  fields 
            existingCategory.setCategoryName(category.getCategoryName());
          
            
            Category savedCategory = categoryRepository.save(existingCategory);
            
            return responseWrapper.universalResponse(
                    "Category updated successfully",
                    savedCategory,
                    HttpStatus.OK
            );
        }
    }

    
    
    // delete category by id 
    public ResponseEntity<?> deleteCategory ( Long categoryId) {
        
            Optional<Category> category = categoryRepository.findById(categoryId);
        
            if (!category.isPresent()) {
                
                return responseWrapper.universalResponse("The Category does Not exists ", null, HttpStatus.NOT_FOUND);
                
            } else {
                
                categoryRepository.deleteById(categoryId);
                    return responseWrapper.universalResponse("Category Deleted successfully", null, HttpStatus.OK);
            }
            
    }
    
    
    public ResponseEntity<?> getAllCustomerCategories() {
        List<Category> categories = categoryRepository.findAll();

        return responseWrapper.universalResponse(
                "All categories",
                categories,
                HttpStatus.OK
        );
    }

    
    
}
