import { Outlet, useNavigate } from 'react-router'
import { useState, useEffect } from 'react'
import { Loader } from '../components/ui/Loader'
import { useAuth } from '../stores/auth0'
import { toast } from 'sonner'
const Public = () => {

    const [loading, setLoading] = useState(true)
    const { token, isAuth, logout } = useAuth()
    const navigate = useNavigate()
    useEffect(() => {

        const getUser = async () => {
            try {
                setLoading(true)
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
                        setLoading(false)
                        return
                    }

                    await navigate('/init')


                } else {
                    setLoading(false)
                }
            } catch {
                toast.error('Ha ocurrido un error')
                setLoading(false)
            }

        }
        getUser()
    }, [isAuth, logout, navigate, token])

    if (loading) {
        return <div><Loader /></div>
    }
    return (

        <main className='min-h-screen flex justify-center items-center'><Outlet /></main>

    )
}

export default Public