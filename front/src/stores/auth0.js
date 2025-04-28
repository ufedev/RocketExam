import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuth = create(persist((set) => ({
    user: null,
    isAuth: null,
    token: null,
    login: (user, token) => set({ user, token, isAuth: true }),
    logout: () => set({ user: null, token: null, isAuth: null })
}), {
    name: 'auth0-persist-store'
}))