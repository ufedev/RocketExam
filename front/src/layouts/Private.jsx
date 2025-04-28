import { Outlet, useNavigate } from 'react-router'
import { Header } from '../components/Header'
import { useAuth } from '../stores/auth0'
import { useEffect, useState } from 'react'
import { Loader } from '../components/ui/Loader'

const Private = () => {
    const [loading, setLoading] = useState(true)
    const { isAuth, token, logout } = useAuth()
    const navigate = useNavigate()
    useEffect(() => {
        const getUser = async () => {
            setLoading(true)
            try {

                if (isAuth) {
                    const config = {
                        method: "POST",
                        headers: {
                            'authorization': `Bearer ${token}`
                        }
                    }
                    const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/verify_auth`, config)
                    const res = await req.json()

                    if (res.error) {
                        logout()
                        await navigate('/')
                    } else {
                        setLoading(false)
                    }

                } else {
                    await navigate('/')

                }
            } catch (er) {
                console.log(er)
                setLoading(false)
            }

        }

        getUser()

    }, [isAuth, logout, navigate, token])

    if (loading) {
        return <div><Loader /></div>
    }

    return (

        <div className='flex flex-col gap-2 max-h-screen'>
            <Header />
            <main className='max-w-[95%] w-full mx-auto flex-1  main-content pb-10 '>
                <Outlet />
            </main>
        </div>

    )
}

export default Private