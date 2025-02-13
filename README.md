# 🔥 FireStream - Open Source S3 Alternative

FireStream is a Next.js-based file management system with secure uploads, API key authentication, and user management. Ideal for teams needing reliable file storage and access control.

## Prerequisites
Before starting, set up the [FireStream API](https://github.com/alohe/firestream-api). After setting up this project, create an account, assign yourself as an admin in the database, and generate an API key.

## Features
- Secure file uploads with validation
- API key-based authentication
- User and role management
- Next.js frontend with Tailwind CSS
- Secure storage and access control
- Usage analytics dashboard
- RESTful API
- MIT licensed, open source
- Self-hostable and customizable

## Setup

### Requirements
- Node.js 18+
- Environment variables from `.env.example`

### Installation
```bash
git clone https://github.com/alohe/firestream.git
npm install --legacy-peer-deps
```
Create a `.env` file from `.env.example`. 

Run Prisma generate if not triggered by the postinstall script:
```bash
npx prisma generate
```

Start the development server:
```bash
npm run dev
```

Access at [localhost:3000](http://localhost:3000).

*Ignore the `FIRESTREAM_API_KEY` initially. Generate one from the admin dashboard after setup.*

## Upload API Setup
Follow the [FireStream API setup guide](https://github.com/alohe/firestream-api).

## Deployment
Deploy on any Next.js-supported host. Add your API URL to `next.config.ts` for images:
```ts
images: { domains: ['localhost', 'api.example.com'] },
```

## Contributing
Fork, branch, commit, push, and create a PR.

## License
MIT License. See [LICENSE](LICENSE).

## Contact
Email [hi@alohe.dev](mailto:hi@alohe.dev) or [@alemalohe](https://x.com/alemalohe).
