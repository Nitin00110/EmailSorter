package com.emailsorter.emailsorter.Repositories;

import com.emailsorter.emailsorter.Entities.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileRepository extends JpaRepository<UserProfile, String> {
}
