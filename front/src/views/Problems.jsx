import { Table } from '../components/ui/Table'
import { Lk } from '../components/ui/Lk'
import { useEffect, useState } from 'react'
import { Loader } from '../components/ui/Loader'
import { useAuth } from '../stores/auth0'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'
const Problems = () => {

    const navigate = useNavigate()
    const { token, user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [problems, setProblems] = useState([])
    const [deleted, setDeleted] = useState(false)
    const cols = [
        {
            col: 'Problema',
            as: 'title'
        },
        {
            col: "Dificultad",
            as: 'complexity'
        },

    ]
    useEffect(() => {


        const getProblems = async () => {
            // console.log(user.type)
            if (user?.type !== 'PROFESOR') {
                navigate("/")
            }
            try {
                const config = {
                    method: "GET",
                    headers: {
                        'authorization': `Bearer ${token}`
                    }
                }

                const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/problem/list`, config)
                const res = await req.json()

                if (res.error) {
                    // toast.error(res.msg)
                    return
                }

                setProblems(res.problems)
                setLoading(false)
            } catch (er) {
                console.log(er)
            }
        }

        getProblems()

    }, [navigate, token, user?.type, deleted])


    // useEffect(())

    const handleDeleteProblem = async (id) => {
        try {
            const config = {
                method: "DELETE",
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
            const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/problem/${id}`, config)
            const res = await req.json()

            if (res.error) {
                toast.error(res.msg)
                return
            }

            toast.success(res.msg)
            setDeleted(!deleted)

        } catch (err) {
            toast.error(err.message)
        }
    }


    if (loading) {
        return <Loader />
    }

    return <div>
        <div className='mt-5 text-right'>
            <nav>
                <Lk href="create" value="Crear Problema" />
            </nav>
        </div>



        <Table data={problems} title="Problemas" description="Listado de problemas" cols={cols} onDelete={handleDeleteProblem} />
    </div>
}

export default Problems