import { Form } from '../components/ui/Form'
import { TextArea } from '../components/ui/TextArea'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { SubmitButton, Button } from '../components/ui/Button'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { v4 as uuid } from 'uuid'
import { useAuth } from '../stores/auth0'
import { useNavigate } from 'react-router'
import Swal from 'sweetalert2'
const CreateProblem = () => {
    const options = [
        { label: 'Fácil', value: 'Fácil' },
        { label: 'Medio', value: 'Medio' },
        { label: 'Dificil', value: 'Dificil' }
    ]
    const navigate = useNavigate()
    const { token, user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState("")
    const [complexity, setComplexity] = useState('Fácil')
    const [ioput, setIoput] = useState([])

    useEffect(() => {
        if (user?.type !== 'PROFESOR') {
            toast.error('No esta autorizado')
            navigate('/')
        }
    }, [navigate, user?.type])


    const handleCreateProblem = async (e) => {
        e.preventDefault()
        setLoading(true)

        if ([title, description].includes('')) {
            toast.error('Hay campos vacios')
            setLoading(false)
            return
        }
        if (ioput.length > 0) {

            // console.log(ioput)

            try {
                const ouip = ioput.map(io =>
                    ({ output: JSON.parse(io.output ?? ""), input: JSON.parse(io.input ?? "") }))
                const ou = ouip.map(io => io.output)
                const ip = ouip.map(io => io.input)

                const payload = {
                    title,
                    description,
                    complexity,
                    input: ip,
                    output: ou
                }
                // console.log(payload)
                // setLoading(false)
                // return
                // console.log(payload)
                const config = {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                }

                const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/problem/create`, config)
                const res = await req.json()
                console.log(res)
                if (res.error) {
                    toast.error(res.msg)
                    setLoading(false)
                    return
                }

                toast.success(res.msg)
                setLoading(false)
                navigate(0)



            } catch (er) {
                if (er.name === "SyntaxError") {
                    toast.error('Los input/output si son textos deben ir entre comillas dobles "texto"')
                    setLoading(false)
                } else {
                    toast.error(`Hubo un error`)
                    setLoading(false)
                }
            }
        } else {
            toast.error('No hay tests')
            setLoading(false)
            return
        }

    }
    const handleAddIoputs = () => {
        console.log('adding')


        setIoput([...ioput, { key: uuid(), input: '', output: '' }])
    }
    const handleChangeIoputs = (key, type, value) => {
        const updated = ioput.map(io => {
            if (io.key === key) {
                io[type] = value
            }
            return io
        })

        setIoput(updated)
    }
    const handleDeleteIoputs = (key) => {
        const updated = ioput.filter(io => {
            return io.key !== key && io
        })
        setIoput(updated)
    }

    return (
        <div className='mt-10 pb-10 h-full overflow-auto scrollbar-hidden rounded'>
            <Form title="Crear Problema" description="Crea un problema para los examenes"
                onSubmit={handleCreateProblem}
            >
                <Input type='text' name='title' label='Titulo' value={title} onChange={e => setTitle(e.target.value)} />
                <TextArea name='description' label='Descripción' value={description} onChange={(e) => setDescription(e.target.value)} />
                <Select name='complexity' label='Complejidad' options={options} value={complexity} onChange={(e) => setComplexity(e.target.value)} />


                <div className='flex flex-col'>
                    <Button value='Agregar Input/Output' onClick={handleAddIoputs} className='bg-neutral-950' />
                    <div className='flex flex-col gap-2 my-5'>
                        {ioput.length > 0 ? (
                            ioput.map((io, index) => {
                                return (
                                    <div className='flex-1 flex flex-col justify-center ' key={io.key}>
                                        <h6 className='font-bold'>Test {index + 1} -- {io.key}</h6>
                                        <div className='flex justify-center items-end gap-2 '>
                                            <Input type='text' name='input' label='Input' value={io.input} onChange={(e) => handleChangeIoputs(io.key, 'input', e.target.value)} />
                                            <Input type='text' name='output' label='Output' value={io.output} onChange={(e) => handleChangeIoputs(io.key, 'output', e.target.value)} />
                                            <Button value="Eliminar" onClick={() => handleDeleteIoputs(io.key)} className='bg-neutral-950' />
                                        </div>
                                    </div>)
                            })) : <p className='text-center my-5'>Sin <b>Inputs</b>/<b>Ouputs</b></p>
                        }
                    </div>
                </div>
                <SubmitButton value='Crear problema' disabled={loading} />
            </Form>
        </div>

    )
}

export default CreateProblem