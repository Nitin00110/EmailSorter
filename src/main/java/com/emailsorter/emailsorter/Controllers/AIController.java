package com.emailsorter.emailsorter.Controllers;

import com.emailsorter.emailsorter.Entities.UserProfile;
import com.emailsorter.emailsorter.Services.GeminiService;
import com.emailsorter.emailsorter.Services.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final GeminiService geminiService;
    private final ProfileService profileService;
    AIController(GeminiService geminiService, ProfileService profileService) {
        this.geminiService = geminiService;
        this.profileService = profileService;
    }

    @PostMapping("/refine")
    public String refineDraft(@RequestBody Map<String, String> payload) {
        // Grab the "draft" string from the incoming JSON request
        String draft = payload.get("draft");

        // Pass it to Gemini and return the polished result
        return geminiService.refineEmail(draft);
    }

    @PostMapping("/reply")
    public String generateSmartReply(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody Map<String, String> payload) {

        // 1. Get the data sent from the frontend
        String originalEmail = payload.get("originalEmail");
        String intent = payload.get("intent");

        UserProfile profile = null;

        // 2. Check if the user is actually logged in
        if (principal != null) {
            // Real user logged in via Browser
            String email = principal.getAttribute("email");
            profile = profileService.getProfile(email);
        } else {
            // Postman testing mode (No user logged in, use a dummy profile)
            profile = new UserProfile();
            profile.setName("Postman Tester");
            profile.setWorkingIn("Software Engineering");
        }

        // 3. Send it all to Gemini
        return geminiService.generateReply(originalEmail, intent, profile);
    }
}