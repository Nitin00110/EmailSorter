package com.emailsorter.emailsorter.Services;

import com.emailsorter.emailsorter.Entities.UserProfile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    // Pulls the key from application.properties
    @Value("${gemini.api.key}")
    private String apiKey;

    // The official Google Gemini 1.5 Flash endpoint
    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    public String refineEmail(String roughDraft) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = GEMINI_API_URL + apiKey;

            // 1. The System Prompt (Telling Gemini exactly what to do)
            String prompt = "You are a professional email assistant. Rewrite the following rough draft into a polite, professional, and grammatically correct email. Only return the refined email text, nothing else. Here is the draft:\n\n" + roughDraft;

            // 2. Build the specific JSON structure Gemini requires
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> parts = new HashMap<>();
            parts.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(parts));

            // 3. Set headers for the HTTP Request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // 4. Call the Gemini API
            String response = restTemplate.postForObject(url, request, String.class);

            // 5. Parse the JSON response to extract ONLY the generated text
            // Jackson ObjectMapper is built into Spring Boot automatically
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response);

            return rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

        } catch (Exception e) {
            return "Error refining email: " + e.getMessage();
        }
    }


    public String generateReply(String originalEmail, String intent, UserProfile profile) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = GEMINI_API_URL + apiKey;

            // 1. Build the highly contextual prompt
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("You are an executive email assistant. Write a polite, professional, and natural-sounding reply to the following email.\n\n");

            promptBuilder.append("--- ORIGINAL EMAIL ---\n");
            promptBuilder.append(originalEmail).append("\n----------------------\n\n");

            if (intent != null && !intent.isEmpty()) {
                promptBuilder.append("Here is the core message the user wants to convey in the reply: ").append(intent).append("\n\n");
            }

            promptBuilder.append("Personalize the sign-off and context using the user's profile data:\n");
            if (profile != null) {
                if (profile.getName() != null) promptBuilder.append("Name: ").append(profile.getName()).append("\n");
                if (profile.getWorkingIn() != null) promptBuilder.append("Role/Industry: ").append(profile.getWorkingIn()).append("\n");
                if (profile.getPhoneNumber() != null) promptBuilder.append("Phone: ").append(profile.getPhoneNumber()).append("\n");
            } else {
                promptBuilder.append("Name: The User\n");
            }

            promptBuilder.append("\nReturn ONLY the generated email body text. Do not include subject lines or any introductory AI chat like 'Here is your email:'.");

            String prompt = promptBuilder.toString();

            // 2. Build the exact JSON structure Gemini requires (Same as refineEmail)
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> parts = new HashMap<>();
            parts.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(parts));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // 3. Call Gemini
            String response = restTemplate.postForObject(url, request, String.class);

            // 4. Parse JSON
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);

            return rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

        } catch (Exception e) {
            return "Error generating reply: " + e.getMessage();
        }
    }
}
