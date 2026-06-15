package com.healthcare.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for adding a communication note (Provider or Payer can add).
 * This enables bidirectional communication on a request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommunicationNoteDto {

    @NotBlank(message = "Author ID is required")
    private String authorId;

    @NotBlank(message = "Author role is required (PROVIDER or PAYER)")
    private String authorRole;

    @NotBlank(message = "Note content cannot be empty")
    private String content;
}
