# Security Policy

## Reporting Security Vulnerabilities

We take security seriously at Visucan. If you discover a security vulnerability, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email: security@visucan.io

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 3 business days
- **Fix Timeline**: Depends on severity (critical: <7 days, high: <30 days)
- **Public Disclosure**: After fix is deployed (coordinated disclosure)

## Security Measures

### Authentication & Authorization
- OAuth 2.0 / OpenID Connect
- Multi-factor authentication (MFA) supported
- JWT tokens with httpOnly cookies
- Role-based access control (RBAC)

### Data Protection
- **At Rest**: AES-256 encryption
- **In Transit**: TLS 1.3
- **Secrets**: Vercel environment variables (encrypted)
- **Customer Data**: Isolated per customer

### Network Security
- Zero-trust architecture
- VLAN segmentation
- Firewall rules (default deny)
- VPN access for device backend
- DDoS protection (Vercel Edge Network)

### Application Security
- Input validation (Zod schemas)
- SQL injection prevention (Drizzle ORM)
- XSS protection (React auto-escaping)
- CSRF protection (NextAuth.js)
- Rate limiting (Vercel KV)
- Content Security Policy (CSP)

### Infrastructure Security
- Regular security patches
- Automated vulnerability scanning
- Dependency updates (Dependabot)
- Container image scanning
- Secrets rotation

### Monitoring & Logging
- Access logs retained for 2 years
- Session recordings (video + serial)
- Anomaly detection
- Real-time alerts (PagerDuty)

## Compliance

- **GDPR**: Data minimization, right to erasure
- **CCPA**: Privacy disclosures, opt-out
- **SOC 2**: In progress
- **ISO 27001**: Planned

## Security Best Practices for Users

1. **Use Strong Passwords**: Minimum 12 characters, mixed case, numbers, symbols
2. **Enable MFA**: Always enable multi-factor authentication
3. **API Keys**: Rotate regularly, use scoped permissions
4. **Code Review**: Review AI-generated code before deployment
5. **Secrets**: Never commit API keys or passwords to Git
6. **Updates**: Keep your local tools updated

## Known Limitations

### MVP Phase
- Session recording is not end-to-end encrypted (video/serial logs)
- User-uploaded firmware is not automatically scanned for malware
- Device network is not fully isolated (same VLAN for all devices)

These will be addressed in future releases.

## Security Roadmap

### Phase 1 (Q1 2025)
- [x] Basic authentication (OAuth)
- [x] Database encryption
- [ ] Rate limiting
- [ ] API key management

### Phase 2 (Q2 2025)
- [ ] MFA enforcement for paid plans
- [ ] End-to-end session encryption
- [ ] Automated malware scanning
- [ ] SOC 2 Type I certification

### Phase 3 (Q3 2025)
- [ ] Hardware security modules (HSM)
- [ ] Advanced threat detection
- [ ] Bug bounty program
- [ ] SOC 2 Type II certification

## Contact

For security questions or concerns:
- Email: security@visucan.io
- PGP Key: [Coming Soon]

---

Last Updated: 2025-11-07
