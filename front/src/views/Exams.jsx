import { Lk } from '../components/ui/Lk'
import { useState, useEffect } from 'react'
import { useAuth } from '../stores/auth0'
import { Table } from '../components/ui/Table'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Loader } from '../components/ui/Loader'
import Swal from 'sweetalert2'

const Exams = () => {

    const navigate = useNavigate()
    const { token, user } = useAuth()
    const [cols] = useState([{
        col: "Nombre",
        as: 'name'
    },
    {
        col: "Materia",
        as: 'subject'
    },
    {
        col: "Estado",
        as: 'available'
    }
    ])



    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(false)
    const [deleted, setDeleted] = useState(false)
    useEffect(() => {

        if (user?.type !== 'PROFESOR') {
            navigate('/')

        }

        const getExams = async () => {
            try {
                setLoading(true)
                const config = {
                    method: "GET",
                    headers: {
                        'authorization': `Bearer ${token}`
                    }
                }

                const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/exam/list`, config)
                const res = await req.json()
                if (res.error) {
                    toast.error(res.msg)
                    setLoading(false)
                    return
                }


                setExams(res?.exams)
                setLoading(false)
            }
            catch {
                toast.error('Hubo un error')
                setLoading(false)
            }


        }
        getExams()
    }, [cols, navigate, token, user?.type, deleted])


    const handleDeleteExam = async (id) => {
        try {
            const config = {
                method: "DELETE",
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
            const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/exam/${id}`, config)
            const res = await req.json()

            if (res.error) {
                // toast.error(res.msg)
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
    return (

        <div className='h-full overflow-auto scrollbar-hidden'>
            <div className='mt-5 text-right'>
                <nav>
                    <Lk href="create" value="Crear Examen" />
                </nav>
            </div>



            <Table data={exams} title="Examenes" description="Listado de examenes" cols={cols} onDelete={handleDeleteExam} />
        </div>

    )
}

export default Exams