import { getServerSession } from 'next-auth/next';
export const serverAuth = async () => {
  const session = await getServerSession();
  return session;
};
