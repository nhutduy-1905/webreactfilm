import { create } from 'zustand';

interface Profile {
  id: string;
  name: string;
  image?: string;
}

interface ProfileStore {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
