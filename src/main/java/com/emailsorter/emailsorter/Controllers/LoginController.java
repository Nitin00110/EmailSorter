package com.emailsorter.emailsorter.Controllers;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping()
public class LoginController {

    // produces = MediaType.TEXT_HTML_VALUE tells the browser to render this as a webpage
    @GetMapping(value = "/home", produces = MediaType.TEXT_HTML_VALUE)
    public String home() {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head><title>EmailSorter</title></head>\n" +
                "<body style=\"font-family: Arial, sans-serif; text-align: center; margin-top: 15%;\">\n" +
                "    <h1>Welcome to EmailSorter</h1>\n" +
                "    <p>Please log in to manage your inbox and AI settings.</p>\n" +
                "    \n" +
                "    <a href=\"/oauth2/authorization/google\">\n" +
                "        <button style=\"padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #4285F4; color: white; border: none; border-radius: 5px;\">\n" +
                "            Login with Google\n" +
                "        </button>\n" +
                "    </a>\n" +
                "</body>\n" +
                "</html>";
    }
}