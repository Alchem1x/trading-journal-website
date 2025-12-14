/**
 * Middleware for route protection
 * Redirects unauthenticated users to login page
 */

import { withAuth } from 'next-auth/middleware';

export default withAuth({
    pages: {
        signIn: '/',
    },
});

export const config = {
    matcher: ['/dashboard/:path*'],
};
