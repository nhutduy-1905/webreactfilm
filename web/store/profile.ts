'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface profileState {
    id?:string,
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
        id:"",
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