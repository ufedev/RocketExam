import { toast } from 'sonner'
import { Link } from 'react-router'
import { Form } from '../components/ui/Form'
import { Input } from '../components/ui/Input'
import { SubmitButton } from '../components/ui/Button'
import { useState } from 'react'


const Options = () => {
    return <div className='text-center mt-10'>
        <Link className='text-neutral-950 text-sm' to='/'>Iniciar Sesión</Link>
    </div>
}


const CreateAccount = () => {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('')
    const [dni, setDni] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setRePassword] = useState('')


    const handleSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)
        try {
            const config = {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    nombre: name,
                    apellido: lastName,
                    dni,
                    password,
                    rePassword
                })
            }
            const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/signin`, config)
            const res = await req.json()

            if (res.error) {
                toast.error(res.msg)
                setLoading(false)
                return
            }

            toast.success(res.msg)
            setName('')
            setLastName('')
            setDni('')
            setPassword('')
            setRePassword('')


        } catch (er) {
            console.log(er)
        } finally {
            setLoading(false)
        }

    }

    return (

        <Form title="Crear Cuenta" description="Completa el formulario" onSubmit={handleSubmit} options={<Options />}>
            <Input type='text' name='Nombre' label='Nombre' value={name} onChange={(e) => setName(e.target.value)} />
            <Input type='text' name='Apellido' label='Apellido' value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <Input type='number' name='DNI' label='Dni' value={dni} onChange={(e) => setDni(e.target.value)} />
            <Input type='password' name='password' label='Contraseña' value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input type='password' name='rePassword' label='Repetir Contraseña' value={rePassword} onChange={(e) => setRePassword(e.target.value)} />
            <SubmitButton value="Crear cuenta" disabled={loading} />
        </Form>

    )
}

export default CreateAccount