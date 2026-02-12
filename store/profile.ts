<<<<<<< HEAD
'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface profileState {
    createdAt:string,
    email:string,
    emailVerified:string,
    favoriteIds?: string[],
    image:string,
    name:string,
    updatedAt:string    
}

interface initialState {
    profile: profileState
}

const  initialState:initialState = {
    profile: {
        createdAt:"",
        email:"",
        emailVerified:"",
        favoriteIds: [],
        image:"",
        name:"",
        updatedAt:""
    }
}

  
const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        updateProfile(state, action:PayloadAction<profileState>) {
           
            state.profile = action.payload 
        }
    }

});

const profileActions = profileSlice.actions;

export default profileSlice;
export { profileActions };
=======
// store/profile.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileState {
  createdAt: string;
  email: string;
  emailVerified: string | null;
  favoriteIds: string[];
  image: string;
  name: string;
  updatedAt: string;
}

interface ProfileSliceState {
  profile: ProfileState;
}

const initialState: ProfileSliceState = {
  profile: {
    createdAt: '',
    email: '',
    emailVerified: null,
    favoriteIds: [],
    image: '',
    name: '',
    updatedAt: '',
  },
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<ProfileState>>) => {
      state.profile = {
        ...state.profile,
        ...action.payload,
      };
    },
    resetProfile: (state) => {
      state.profile = initialState.profile;
    },
  },
});

export const profileActions = profileSlice.actions;
export default profileSlice.reducer;
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
