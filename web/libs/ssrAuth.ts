import type { GetServerSidePropsContext, Redirect } from "next";
import { getToken } from "next-auth/jwt";

export const AUTH_REDIRECT: { redirect: Redirect } = {
  redirect: {
    destination: "/auth",
    permanent: false,
  },
};

export async function isSsrRequestAuthenticated(
  context: GetServerSidePropsContext
): Promise<boolean> {
  try {
    const token = await getToken({
      req: context.req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    return Boolean(token);
  } catch {
    return false;
  }
}
