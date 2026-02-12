import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
<<<<<<< HEAD

import prismadb from './prismadb';
import { authOptions } from "../pages/api/auth/[...nextauth]";
=======
import { authOptions } from "../pages/api/auth/[...nextauth]";
import  {prisma} from "./prismadb";
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)

const serverAuth = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
<<<<<<< HEAD
    throw new Error('Not signed in');
  }

  const currentUser = await prismadb.user.findUnique({
=======
    throw new Error("Not signed in");
  }

  const currentUser = await prisma.user.findUnique({
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
    where: {
      email: session.user.email,
    },
    select: {
<<<<<<< HEAD
        hashedPassword: false,
        createdAt: true,
        email: true,
        emailVerified: true,
        favoriteIds: true,
        image: true,
        name: true,
        updatedAt: true
    }

  });
  
  if (!currentUser) {
    throw new Error('Not signed in');
  }

  return { currentUser };
}
=======
      hashedPassword: false,
      createdAt: true,
      email: true,
      emailVerified: true,
      favoriteIds: true,
      image: true,
      name: true,
      updatedAt: true,
    },
  });

  if (!currentUser) {
    throw new Error("Not signed in");
  }

  return { currentUser };
};
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)

export default serverAuth;
