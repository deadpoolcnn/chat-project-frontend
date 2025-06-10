# Flask Encrypted Chat System Frontend

This project is a React 18-based frontend for a secure chat system, supporting user registration, login, friend management, and end-to-end encrypted messaging. It communicates with a Flask backend API.

## Main Features
- User registration & login (with automatic RSA key pair generation)
- Friend management (add, list)
- Encrypted chat window (AES message encryption, RSA key exchange, digital signature)
- Private key export on registration; private key import via .pem file on login

## Getting Started
```bash
yarn install
yarn start
```

## Project Structure
- `src/components` — Main React components
- `src/pages` — Page-level components
- `src/api.js` — API abstraction
- `src/utils/crypto.js` — Cryptographic utilities (RSA/AES)

## Security Workflow
- On registration, the frontend generates an RSA key pair. The public key is uploaded to the server, and the private key is downloaded as a .pem file for the user to keep securely.
- On login, if the private key is not found in the browser, the user is prompted to import their .pem private key file.
- All messages are encrypted with a random AES key, which is itself encrypted with the recipient's public key. Messages are signed with the sender's private key.

## Documentation
See `Flask加密聊天系统设计文档.md` for detailed design and protocol information.
