import type { GetServerSidePropsContext } from "next";
import Head from "next/head"
import { getServerSession } from "next-auth";
import { authOptions } from "../libs/authOptions";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { profileActions } from "../store/profile";
import { useAppDispatch} from "../store/index";

import useCurrentUser from "../hooks/useCurrentUser";

const images = [
  '/images/default-blue.png',
  '/images/default-red.png',
  '/images/default-slate.png',
  '/images/default-green.png'
]

interface UserCardProps {
  name: string;
  imgSrc: string;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      }
    }
  }

  return {
    props: {}
  }
}

const UserCard: React.FC<UserCardProps> = ({ name, imgSrc }) => {
  return (
    <div className="group flex-row w-44 mx-auto">
        <div className="w-44 h-44 rounded-md flex items-center justify-center border-2 border-transparent group-hover:cursor-pointer group-hover:border-white overflow-hidden">
          <img draggable={false} className="w-max h-max object-contain" src={imgSrc} alt={name} />
        </div>
      <div className="mt-4 text-gray-400 text-2xl text-center group-hover:text-white">{name}</div>
   </div>
  );
}

const Profile = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: currentUser } = useCurrentUser();
  

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(profileActions.updateProfile(currentUser));
    }
  }, [currentUser?.id, dispatch])

  const selectProfile = useCallback(() => {
    router.push('/?intro=1');
  }, [router]);

  return (
    <>
    <Head>
        <link rel="shortcut icon" href="/images/default-blue.png" />
        <title>{currentUser?.name}</title>
    </Head>
    <div className="flex items-center h-full justify-center">
      <div className="flex flex-col">
        <h1 className="text-3xl md:text-6xl text-white text-center">Who&#39;s watching?</h1>
        <div className="flex items-center justify-center gap-8 mt-10">
          {images.map((imgSrc, index) => (
            <div key={imgSrc} onClick={() => selectProfile()}>
              <UserCard
                name={index === 0 ? (currentUser?.name || "User") : `User ${index + 1}`}
                imgSrc={imgSrc}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

export default Profile;
