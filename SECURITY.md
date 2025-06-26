# Security Guidelines for AgriChain

## 🔒 Environment Variables

### Required Environment Variables

1. **Backend (.env)**:
   ```bash
   SECRET_KEY=your-unique-secret-key-here
   DEBUG=False  # NEVER set to True in production
   PRIVATE_KEY=your-blockchain-private-key
   CONTRACT_ADDRESS=your-deployed-contract-address
   ```

2. **Frontend (.env)**:
   ```bash
   EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
   EXPO_PUBLIC_DEBUG_API=false
   ```

3. **Root (.env)**:
   ```bash
   ANVIL_PRIVATE_KEY=your-anvil-private-key
   ```

## 🚨 Security Checklist

### Before Deployment:
- [ ] All private keys moved to environment variables
- [ ] DEBUG=False in production
- [ ] Strong SECRET_KEY generated
- [ ] API logging disabled in production
- [ ] HTTPS enabled for all endpoints
- [ ] Authentication implemented
- [ ] Input validation added
- [ ] Rate limiting configured

### Development:
- [ ] Use .env.example files as templates
- [ ] Never commit .env files to git
- [ ] Use different keys for dev/staging/prod
- [ ] Regularly rotate keys

## 🔑 Key Management

### Private Keys:
- Generate unique keys for each environment
- Use hardware wallets for production
- Implement key rotation policies
- Never log private keys

### API Keys:
- Use environment-specific keys
- Implement proper scoping
- Monitor usage and set limits
- Revoke unused keys

## 🛡️ Additional Security Measures

1. **Authentication**: Implement JWT or OAuth2
2. **Authorization**: Role-based access control
3. **Input Validation**: Sanitize all inputs
4. **Rate Limiting**: Prevent abuse
5. **CORS**: Configure properly for production
6. **HTTPS**: Use SSL/TLS certificates
7. **Monitoring**: Log security events
8. **Updates**: Keep dependencies updated

## 📞 Reporting Security Issues

If you discover a security vulnerability, please email: security@agrichain.com

Do not create public issues for security vulnerabilities.
