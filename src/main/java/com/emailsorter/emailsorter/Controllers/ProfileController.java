package com.emailsorter.emailsorter.Controllers;


import com.emailsorter.emailsorter.Entities.UserProfile;
import com.emailsorter.emailsorter.Services.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    ProfileService profileService;
    ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // GET endpoint: Fetch the current user's profile
    // GET endpoint: Fetch the current user's profile
    @GetMapping
    public ResponseEntity<UserProfile> getProfile(@AuthenticationPrincipal OAuth2User principal) {
        // 1. Safety check: If the session cookie didn't make it, return 401 Unauthorized
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        // 2. Grab their Google details
        String email = principal.getAttribute("email");
        UserProfile userProfile = profileService.getProfile(email);

        // 3. THE FIX: If they aren't in the database yet, auto-create their profile!
        if (userProfile == null) {
            userProfile = new UserProfile();
            userProfile.setEmail(email);

            // Grab their real name from their Google account
            String name = principal.getAttribute("name");
            userProfile.setName(name);

            // Save it to PostgreSQL so they exist next time
            userProfile = profileService.setProfile(email, userProfile);
        }

        // 4. Return the profile (this makes the React frontend happy!)
        return ResponseEntity.ok(userProfile);
    }

    // POST endpoint: Create or Update the user's profile
    @PostMapping
    public ResponseEntity<UserProfile> saveProfile(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody UserProfile profileData) {

        String email = principal.getAttribute("email");
        profileData.setEmail(email);


        if (profileData.getName() == null || profileData.getName().isEmpty()) {
            profileData.setName(principal.getAttribute("name"));
        }

        UserProfile savedProfile = profileService.setProfile(email, profileData);

        return ResponseEntity.ok(savedProfile);
    }
}