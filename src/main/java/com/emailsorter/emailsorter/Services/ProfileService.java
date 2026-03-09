package com.emailsorter.emailsorter.Services;

import com.emailsorter.emailsorter.Entities.UserProfile;
import com.emailsorter.emailsorter.Repositories.ProfileRepository;
import org.springframework.boot.webmvc.autoconfigure.WebMvcProperties;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProfileService {

    ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;

    }

    public UserProfile getProfile(String email) {
        return profileRepository.findById(email).orElse(null);
    }

    public UserProfile setProfile(String email,UserProfile incomingData) {
        UserProfile updatedUser = UserProfile.builder()
                .email(email) // Force the ID from the parameter
                .name(incomingData.getName())
                .age(incomingData.getAge())
                .gender(incomingData.getGender())
                .phoneNumber(incomingData.getPhoneNumber())
                .workingIn(incomingData.getWorkingIn())
                .build();

        return profileRepository.save(updatedUser);

    }

}
