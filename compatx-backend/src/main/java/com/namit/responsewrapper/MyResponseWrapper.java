package com.namit.responsewrapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@Data
public class MyResponseWrapper {
	
	private String message;
	
	private Object data;
	
	
	public ResponseEntity<MyResponseWrapper> universalResponse( String message ,
																Object data ,
																HttpStatus httpStatus){
		this.message = message;
		this.data = data;
		
		return new ResponseEntity<>( this , httpStatus);
		
	}
	
	

}
