package com.emailsorter.emailsorter.Services;

import com.emailsorter.emailsorter.DTOs.EmailDTO;
import com.emailsorter.emailsorter.Repositories.TrackedEmailRepository;
import org.springframework.stereotype.Service;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.ListMessagesResponse;
import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.model.MessagePartHeader;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.api.services.gmail.model.MessagePart;
import java.util.Base64;


import java.util.ArrayList;
import java.util.List;

@Service
public class GmailService {

    TrackedEmailRepository  trackedEmailRepository;
    GmailService(TrackedEmailRepository trackedEmailRepository) {
        this.trackedEmailRepository = trackedEmailRepository;
    }
    public List<EmailDTO> getInbox(String accessTokenValue) throws Exception {
        // 1. Setup Gmail API Client using the user's token
        GoogleCredentials credentials = GoogleCredentials.create(new AccessToken(accessTokenValue, null));
        Gmail gmailService = new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("EmailSorter")
                .build();

        // 2. Ask Google for the 20 most recent email IDs
        ListMessagesResponse response = gmailService.users().messages().list("me")
                .setMaxResults(20L)
                .execute();

        List<EmailDTO> inbox = new ArrayList<>();
        List<Message> messages = response.getMessages();

        if (messages != null) {
            for (Message msg : messages) {
                Message fullMsg = gmailService.users().messages().get("me", msg.getId())
                        .setFormat("metadata")
                        .setMetadataHeaders(List.of("From", "Subject", "Date"))
                        .execute();

                EmailDTO emailDTO = emailDtoSetup(fullMsg);

                // Fallbacks in case an email is missing a subject
                if (emailDTO.getSubject() == null) emailDTO.setSubject("(No Subject)");

                inbox.add(emailDTO);
            }
        }
        return inbox;
    }

    public EmailDTO getEmailById(String accessTokenValue, String messageId) throws Exception {
        GoogleCredentials credentials = GoogleCredentials.create(new AccessToken(accessTokenValue, null));
        Gmail gmailService = new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("EmailSorter")
                .build();

        Message fullMsg = gmailService.users().messages().get("me", messageId)
                .setFormat("full")
                .execute();

        EmailDTO emailDTO = emailDtoSetup(fullMsg);
        emailDTO.setBody(extractEmailBody(fullMsg.getPayload()));

        // --- NEW TRACKING LOGIC ---
        // Scan the headers of the opened email to see if it was sent from our app
        // --- NEW TRACKING LOGIC ---
        // Scan the headers of the opened email to see if it was sent from our app
        List<MessagePartHeader> headers = fullMsg.getPayload().getHeaders();
        if (headers != null) {
            for (MessagePartHeader header : headers) {
                // THE FIX: Use equalsIgnoreCase because email servers change capitalization in transit!
                if (header.getName().equalsIgnoreCase("X-EmailSorter-Tracking-Id")) {

                    // THE FIX: Use trim() to remove any invisible spaces Google might have added
                    String trackingId = header.getValue().trim();

                    // Add a print statement so you can see it working in your terminal!
                    System.out.println("🔥 Found Tracking Header! ID: " + trackingId);

                    trackedEmailRepository.findById(trackingId).ifPresent(trackedEmail -> {
                        System.out.println("✅ Found matching email in Database! Marking as read.");
                        if (!trackedEmail.isRead()) {
                            trackedEmail.setRead(true);
                            trackedEmail.setReadAt(java.time.LocalDateTime.now());
                            trackedEmailRepository.save(trackedEmail);
                        }
                    });
                    break;
                }
            }
        }
        // --------------------------


        // Decode the actual email body
        String decodedBody = extractEmailBody(fullMsg.getPayload());
        emailDTO.setBody(decodedBody);

        return emailDTO;
    }

    // 1. The Main Extractor
    private String extractEmailBody(MessagePart payload) {
        // Kick off the recursive search
        String base64Body = findHtmlOrPlainTextRecursive(payload);

        if (base64Body != null && !base64Body.isEmpty()) {
            try {
                // Gmail uses Base64 URL-safe encoding, not standard Base64
                byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(base64Body);
                return new String(decodedBytes);
            } catch (IllegalArgumentException e) {
                return "Error decoding email body: " + e.getMessage();
            }
        }

        return "No content available.";
    }

    // 2. The "Recursive MIME-type Parsing Algorithm" from your resume!
    private String findHtmlOrPlainTextRecursive(MessagePart part) {
        if (part == null) return "";

        // BASE CASE: We hit the HTML jackpot. Return immediately!
        if (part.getMimeType().equalsIgnoreCase("text/html") && part.getBody() != null) {
            return part.getBody().getData();
        }

        String plainTextFallback = "";

        // RECURSIVE CASE: It has sub-parts (like attachments or alternative text formats)
        if (part.getParts() != null) {
            // Pass 1: Prioritize searching for HTML in all sub-parts first
            for (MessagePart subPart : part.getParts()) {
                if (subPart.getMimeType().equalsIgnoreCase("text/html") && subPart.getBody() != null) {
                    return subPart.getBody().getData();
                }
            }

            // Pass 2: If no direct HTML, dig deeper into nested folders (like multipart/mixed)
            for (MessagePart subPart : part.getParts()) {
                if (subPart.getMimeType().startsWith("multipart/")) {
                    String nestedResult = findHtmlOrPlainTextRecursive(subPart);
                    // If the recursive dive found HTML, bubble it up!
                    if (nestedResult != null && !nestedResult.isEmpty()) {
                        return nestedResult;
                    }
                } else if (subPart.getMimeType().equalsIgnoreCase("text/plain") && subPart.getBody() != null) {
                    // Save plain text as an absolute last resort
                    plainTextFallback = subPart.getBody().getData();
                }
            }
        }
        // Base Case 3: Simple email that only has plain text
        else if (part.getMimeType().equalsIgnoreCase("text/plain") && part.getBody() != null) {
            return part.getBody().getData();
        }

        return plainTextFallback;
    }

    public void sendEmail(String accessTokenValue, String to, String subject, String bodyText, String trackingId) throws Exception {
        GoogleCredentials credentials = GoogleCredentials.create(new AccessToken(accessTokenValue, null));
        Gmail gmailService = new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("EmailSorter")
                .build();

        // Construct the raw email and inject our custom tracking header!
        String rawEmail = "To: " + to + "\r\n" +
                "Subject: " + subject + "\r\n" +
                "X-EmailSorter-Tracking-Id: " + trackingId + "\r\n" +
                "Content-Type: text/plain; charset=utf-8\r\n\r\n" +
                bodyText;

        String encodedEmail = Base64.getUrlEncoder().encodeToString(rawEmail.getBytes());
        Message message = new Message();
        message.setRaw(encodedEmail);

        gmailService.users().messages().send("me", message).execute();
    }

    private EmailDTO emailDtoSetup(Message fullMsg) {
        EmailDTO emailDTO = new EmailDTO();
        emailDTO.setId(fullMsg.getId());

        // Extract Headers (same as before)
        List<MessagePartHeader> headers = fullMsg.getPayload().getHeaders();
        if (headers != null) {
            for (MessagePartHeader header : headers) {
                switch (header.getName()) {
                    case "From": emailDTO.setFrom(header.getValue()); break;
                    case "Subject": emailDTO.setSubject(header.getValue()); break;
                    case "Date": emailDTO.setDate(header.getValue()); break;
                }
            }
        }
        return emailDTO;
    }
}