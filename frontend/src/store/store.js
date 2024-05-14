import {configureStore} from "@reduxjs/toolkit"
import jwtReducer from './slices/jwt'

export const store = configureStore({
    reducer:{
        jwt: jwtReducer,
    },
}) 