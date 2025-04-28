import { useEffect, useState } from 'react'
import { useAuth } from '../stores/auth0'
import { toast } from 'sonner'
import { Table } from '../components/ui/Table'
import { Input } from '../components/ui/Input'
const Init = () => {
    const { token, user } = useAuth()
    const [exams, setExams] = useState([])
    const [filterExams, setFilterExams] = useState([])
    const [deleted, setDeleted] = useState(false)
    const [search, setSearch] = useState('')
    const cols = [
        {
            col: 'Usuario',
            as: 'user'
        },
        {
            col: 'Examen',
            as: "exam"
        },
        {
            col: "Calificación",
            as: 'result'
        }
    ]
    useEffect(() => {

        const getExams = async () => {
            try {
                const config = {
                    method: "GET",
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                }

                const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/exam_result/list`, config)
                const res = await req.json()

                if (res.error) {
                    // toast.error(res.msg)
                    return
                }

                setExams(res.exams)

            } catch (err) {
                toast.error(`${err.message}`)
            }
        }
        getExams()
    }, [token, deleted])

    useEffect(() => {
        if (search !== '') {
            const s = search.toLowerCase()
            const newFilter = exams.filter((ex) => {
                if (ex.user.toLowerCase().includes(s) || ex.exam.toLowerCase().includes(s)) {
                    return ex
                }

            })
            setFilterExams(newFilter)
        } else {
            setFilterExams(exams)
        }

    }, [exams, search])


    const handleDeleteResult = async (value) => {

        try {
            const config = {
                method: 'DELETE',
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
            const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/exam_result/${value}`, config)
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



    return (

        <div className='h-full overflow-auto px-2 scrollbar-hidden'>
            <div className='mt-3 flex flex-col gap-10'>
                <h2 className='text-3xl font-bold'>Calificaciones</h2>
                <Input type='text' placeholder={`Buscador${user?.type === "PROFESOR" ? ' | Usuario' : ''} | Examen | Calificación`} name='Buscador' label='Buscador' value={search} onChange={(e) => {
                    setSearch(e.target.value)
                }} />
            </div>
            <Table cols={cols} data={filterExams} notDefaultActions={user?.type !== 'PROFESOR'} onDelete={handleDeleteResult} />
        </div>

    )
}

export default Init