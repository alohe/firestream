import { db } from '@/lib/db'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth, { type DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'

declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string
            name: string
            image: string
        } & DefaultSession['user']
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    basePath: '/api/auth',
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        Resend({
            apiKey: process.env.RESEND_API_KEY,
            from: process.env.EMAIL_FROM,
        }),
    ],
    adapter: PrismaAdapter(db),
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signin',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
    },
    callbacks: {
        authorized: async ({ auth }) => {
            return !!auth
        },
        session: async ({ session, user }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: user.id,
                    name: user.name,
                    image: user.image
                },
            }
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
    events: {
        createUser: async ({ user }) => {
            // Verification request is handled by the Resend provider
            console.log('User created:', user)
        },
    },
})
