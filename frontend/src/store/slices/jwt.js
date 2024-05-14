import { createSlice } from "@reduxjs/toolkit";

const jwtSlice = createSlice({
    name:"jwt",
    initialState:{
        value: (sessionStorage.getItem('jwtToken')||"")
    },
    reducers:{
        set: (state, action) => {
            sessionStorage.setItem('jwtToken', action.payload);
            state.value = action.payload;
        }
    },
})

export const { set } = jwtSlice.actions; 
export default jwtSlice.reducer;
