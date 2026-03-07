package com.emailsorter.emailsorter.Controllers;

import com.emailsorter.emailsorter.DTOs.EmailDTO;
import com.emailsorter.emailsorter.Services.GmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    @Autowired
    private GmailService gmailService;

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
}