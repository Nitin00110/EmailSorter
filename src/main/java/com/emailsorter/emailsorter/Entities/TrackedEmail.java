package com.emailsorter.emailsorter.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "tracked_emails")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackedEmail {

    @Id
    private String trackingId; // The hidden UUID we put in the email header

    private String senderEmail;
    private String recipientEmail;
    private String subject;

    @JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime readAt;
}