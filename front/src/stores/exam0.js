import { create } from 'zustand'
import { persist } from 'zustand/middleware'


export const useExam = create(persist((set) => ({
    exam: null,
    time: null,
    resolvCodes: null,
    loadExam: (exam, time) => set({ exam, time }),
    loadResolvCodes: (code) => set({ resolvCodes: code }),
    setTime: (newtime) => set({ time: newtime }),
    resetStore: () => set({ exam: null, time: null, resolvCodes: null })
}),
    {
        name: 'exam0-persist-store'
    }))