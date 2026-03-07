package com.emailsorter.emailsorter.DTOs;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor // Replaces public EmailDTO() {}
@AllArgsConstructor
public class EmailDTO {
    private String id;
    private String from;
    private String subject;
    private String date;
    private String body;
}