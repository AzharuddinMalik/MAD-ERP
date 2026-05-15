package net.engineeringdigest.journalApp.config;

import net.engineeringdigest.journalApp.dto.ApiErrorResponse;
import net.engineeringdigest.journalApp.exception.BusinessRuleException;
import net.engineeringdigest.journalApp.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * 🧪 GlobalExceptionHandler Tests (Pure Mockito — no Spring context)
 * ✅ Updated for E1: Now validates ApiErrorResponse DTO with error codes.
 */
@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    GlobalExceptionHandler handler;

    @Test
    void validationErrors_returnSanitized400_withErrorCode() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("projectRequestDTO", "name", "Project name is required");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<ApiErrorResponse> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().errorCode()).isEqualTo("ERR_VALIDATION_FAILED");
        assertThat(response.getBody().message()).contains("name: Project name is required");
        assertThat(response.getBody().status()).isEqualTo(400);
    }

    @Test
    void entityNotFound_returns404_withErrorCode() {
        EntityNotFoundException ex = new EntityNotFoundException("City not found: 999");

        ResponseEntity<ApiErrorResponse> response = handler.handleNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().errorCode()).isEqualTo("ERR_ENTITY_NOT_FOUND");
        assertThat(response.getBody().message()).isEqualTo("City not found: 999");
    }

    @Test
    void resourceNotFound_returns404_withTypedErrorCode() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Project", 42L);

        ResponseEntity<ApiErrorResponse> response = handler.handleResourceNotFound(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().errorCode()).isEqualTo("ERR_PROJECT_NOT_FOUND");
        assertThat(response.getBody().message()).contains("Project not found with ID: 42");
    }

    @Test
    void businessRuleViolation_returns422_withErrorCode() {
        BusinessRuleException ex = BusinessRuleException.insufficientStock("Cement", 100, 20);

        ResponseEntity<ApiErrorResponse> response = handler.handleBusinessRule(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(response.getBody().errorCode()).isEqualTo("ERR_INSUFFICIENT_STOCK");
        assertThat(response.getBody().message()).contains("Cement");
    }

    @Test
    void dataIntegrityViolation_returnsSanitized409() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException(
                "could not execute statement; SQL [n/a]; constraint [UK_city_name]");

        ResponseEntity<ApiErrorResponse> response = handler.handleIntegrity(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().errorCode()).isEqualTo("ERR_DATA_CONFLICT");
        // Must NOT leak raw SQL or constraint names
        assertThat(response.getBody().message()).doesNotContain("SQL");
        assertThat(response.getBody().message()).doesNotContain("UK_city_name");
    }

    @Test
    void accessDenied_returns403_withErrorCode() {
        AccessDeniedException ex = new AccessDeniedException("Access Denied");

        ResponseEntity<ApiErrorResponse> response = handler.handleAccessDenied(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().errorCode()).isEqualTo("ERR_ACCESS_DENIED");
    }

    @Test
    void genericException_returnsSanitized500() {
        Exception ex = new RuntimeException("Unexpected internal error with DB connection pool leak");

        ResponseEntity<ApiErrorResponse> response = handler.handleGeneric(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().errorCode()).isEqualTo("ERR_INTERNAL");
        // Must NOT leak internal error details
        assertThat(response.getBody().message()).doesNotContain("DB connection pool");
    }
}
