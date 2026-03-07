package com.emailsorter.emailsorter.Services;

import com.emailsorter.emailsorter.DTOs.EmailDTO;
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

                EmailDTO emailDTO = new EmailDTO();
                emailDTO.setId(fullMsg.getId());
                 // The short preview text

                // 4. Extract the specific headers
                List<MessagePartHeader> headers = fullMsg.getPayload().getHeaders();
                if (headers != null) {
                    for (MessagePartHeader header : headers) {
                        switch (header.getName()) {
                            case "From":
                                // Gmail returns "Name <email@domain.com>", you might want to clean this up later
                                emailDTO.setFrom(header.getValue());
                                break;
                            case "Subject":
                                emailDTO.setSubject(header.getValue());
                                break;
                            case "Date":
                                emailDTO.setDate(header.getValue());
                                break;
                        }
                    }
                }

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

        // Fetch the specific email in FULL format
        Message fullMsg = gmailService.users().messages().get("me", messageId)
                .setFormat("full")
                .execute();

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

        // Decode the actual email body
        String decodedBody = extractEmailBody(fullMsg.getPayload());
        emailDTO.setBody(decodedBody);

        return emailDTO;
    }

    private String extractEmailBody(MessagePart payload) {
        String bodyData = "";

        if (payload.getParts() != null) {
            for (MessagePart part : payload.getParts()) {
                if (part.getMimeType().equals("text/html") && part.getBody().getData() != null) {
                    bodyData = part.getBody().getData();
                    break;
                } else if (part.getMimeType().equals("text/plain") && part.getBody().getData() != null) {
                    // Keep plain text as a fallback if HTML isn't found
                    bodyData = part.getBody().getData();
                }
            }
        } else if (payload.getBody() != null && payload.getBody().getData() != null) {
            // Simple, single-part email
            bodyData = payload.getBody().getData();
        }

        if (!bodyData.isEmpty()) {
            byte[] decodedBytes = Base64.getUrlDecoder().decode(bodyData);
            return new String(decodedBytes);
        }

        return "No content available.";
    }
}