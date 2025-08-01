# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please follow these steps:

1. **DO NOT** open a public issue
2. Email the details to: [your-security-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a detailed response within 7 days.

## Security Measures

This project implements the following security measures:

- Environment variables for sensitive data
- CORS protection on API endpoints
- Rate limiting on API calls
- Input validation and sanitization
- XSS protection through React's built-in escaping
- Content Security Policy headers

## Best Practices for Contributors

- Never commit sensitive data (API keys, passwords, tokens)
- Always use environment variables for configuration
- Validate and sanitize all user inputs
- Keep dependencies up to date
- Follow the principle of least privilege.
