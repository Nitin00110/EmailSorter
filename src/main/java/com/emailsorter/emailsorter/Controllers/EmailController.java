package com.emailsorter.emailsorter.Controllers;

import com.emailsorter.emailsorter.DTOs.EmailDTO;
import com.emailsorter.emailsorter.Entities.TrackedEmail;
import com.emailsorter.emailsorter.Repositories.TrackedEmailRepository;
import com.emailsorter.emailsorter.Services.GmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/emails")
public class EmailController {


    private final GmailService gmailService;
    private final TrackedEmailRepository trackedEmailRepository;
    @Autowired
    public EmailController(GmailService gmailService, TrackedEmailRepository trackedEmailRepository) {
        this.gmailService = gmailService;
        this.trackedEmailRepository = trackedEmailRepository;
    }

    @GetMapping("/inbox")
    public List<EmailDTO> getInbox(@RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient) throws Exception {

        // Grab the token from the currently logged-in user
        String token = authorizedClient.getAccessToken().getTokenValue();

        // Fetch and return the formatted list
        return gmailService.getInbox(token);
    }

    @GetMapping("/inbox/{id}")
    public EmailDTO getEmailById(
            @PathVariable String id,
            @RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient) throws Exception {

        String token = authorizedClient.getAccessToken().getTokenValue();
        return gmailService.getEmailById(token, id);
    }


    @PostMapping("/send")
    public String sendEmail(
            @RegisteredOAuth2AuthorizedClient("google") OAuth2AuthorizedClient authorizedClient,
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody Map<String, String> payload) {

        try {
            String token = authorizedClient.getAccessToken().getTokenValue();
            String senderEmail = principal.getAttribute("email"); // Who is sending it

            String to = payload.get("to");
            String subject = payload.get("subject");
            String body = payload.get("body");

            // 1. Generate the secret Tracking ID
            String trackingId = UUID.randomUUID().toString();

            // 2. Save it to the database as "Unread"
            TrackedEmail trackedEmail = TrackedEmail.builder()
                    .trackingId(trackingId)
                    .senderEmail(senderEmail)
                    .recipientEmail(to)
                    .subject(subject)
                    .isRead(false)
                    .build();
            trackedEmailRepository.save(trackedEmail);

            // 3. Send the email with the hidden header
            gmailService.sendEmail(token, to, subject, body, trackingId);

            return "Email sent successfully!";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    // Dashboard Endpoint: Let the user see which of their sent emails have Blue Ticks!
    @GetMapping("/sent-status")
    public List<TrackedEmail> getTrackedEmails(@AuthenticationPrincipal OAuth2User principal) {
        String senderEmail = principal.getAttribute("email");
        return trackedEmailRepository.findBySenderEmail(senderEmail);
    }
}