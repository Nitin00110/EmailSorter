package com.emailsorter.emailsorter.Repositories;

import com.emailsorter.emailsorter.Entities.TrackedEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackedEmailRepository extends JpaRepository<TrackedEmail, String> {
    List<TrackedEmail> findBySenderEmail(String senderEmail);
}