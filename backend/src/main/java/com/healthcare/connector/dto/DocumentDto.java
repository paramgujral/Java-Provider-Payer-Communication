package com.healthcare.connector.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DocumentDto {
    private String id;
    private String name;
    private String type;
    private Long size;
    private LocalDateTime uploadDate;
    private String url;
}
