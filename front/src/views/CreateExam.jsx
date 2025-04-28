import { Form } from '../components/ui/Form'
import { Input } from '../components/ui/Input'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import { SubmitButton } from '../components/ui/Button'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { useAuth } from '../stores/auth0'
import { useNavigate } from 'react-router'

const animatedComponent = makeAnimated()


const CreateExam = () => {

    const navigate = useNavigate()
    const { token, user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [subject, setSubject] = useState("")
    const [problems, setProblems] = useState([])
    const [optionsProblems, setOptionsProblems] = useState([])

    useEffect(() => {
        if (user?.type !== 'PROFESOR') {
            toast.error('No esta autorizado')
            navigate('/')
        }
    }, [navigate, user?.type])

    useEffect(() => {

        const getProblems = async () => {
            try {
                setLoading(true)
                const config = {
                    method: "GET",
                    headers: {
                        'authorization': `Bearer ${token}`
                    }
                }

                const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/problem/list`, config)
                const res = await req.json()
                if (res.error) {
                    toast.error(req.msg)
                    setLoading(false)
                    return
                }
                setOptionsProblems(res?.problems.map(p => {
                    return {
                        value: p.id,
                        label: `${p.title} - ${p.complexity}`
                    }
                }))


            } catch {
                toast.error('Hubo un error')
            } finally {
                setLoading(false)
            }
        }

        getProblems()

    }, [token])

    const handleCreateExam = async (e) => {
        e.preventDefault()
        const payload = {
            name,
            subject,
            problems
        }

        if (Object.values(payload).includes('')) {
            toast.error('Hay campos vacios')
            return
        }

        try {
            setLoading(true)

            const config = {
                method: "POST",
                headers: {
                    'authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }

            const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/exam/create`, config)
            const res = await req.json()

            if (res.error) {
                toast.error(res.msg)
                setLoading(false)
                return
            }
            toast.success(res.msg)

            setTimeout(() => navigate(0), 500)

        } catch {
            toast.error('Ocurrio un error en el servidor')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='mt-10 h-screen'>
            <Form title="Crear Examen" description=""
                onSubmit={handleCreateExam}
            >
                <Input type='text' name='name' label='Nombre' value={name} onChange={e => setName(e.target.value)} />
                <Input type='text' name='subject' label='Materia' value={subject} onChange={(e) => setSubject(e.target.value)} />

                <div className='flex flex-col'>
                    <label className='text-sm'>Problemas</label>
                    <Select
                        closeMenuOnSelect={false}
                        isMulti options={optionsProblems}
                        animatedComponent={animatedComponent}
                        onChange={(e) => setProblems(e.map(ev => ev.value))}
                    />
                </div>
                <SubmitButton value='Crear Examen' disabled={loading} />
            </Form>
        </div>

    )
}

export default CreateExam