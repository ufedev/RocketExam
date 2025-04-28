import { Link, useNavigate } from 'react-router'
import { Form } from '../components/ui/Form'
import { Input } from '../components/ui/Input'
import { SubmitButton } from '../components/ui/Button'
import { useState } from 'react'
import { useAuth } from '../stores/auth0'
import { toast } from 'sonner'


const Options = () => {
    return <div className='text-center mt-10'>
        <Link className='text-neutral-950 text-sm' to='/create_account'>Crear cuenta</Link>
    </div>
}


const Login = () => {

    const { login } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dni, setDni] = useState('')
    const [password, setPassword] = useState('')
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            // console.log('good')
            const config = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    dni, password
                })
            }
            const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/login`, config)
            const res = await req.json()
            if (res.error) {
                toast.error(res.msg)
                setLoading(false)
                return
            }
            login(res.user, res.token)
            navigate('/init')

        } catch (er) {
            console.log(er)
        } finally {
            setLoading(false)
        }
    }

    return (

        <Form title="Iniciar Sesión" description="Inicia sesión y realiza los examenes" onSubmit={handleSubmit} options={<Options />}>
            <Input type='number' name='DNI' label='Dni' value={dni} onChange={(e) => setDni(e.target.value)} />
            <Input type='password' name='password' label='Contraseña' value={password} onChange={e => setPassword(e.target.value)} />
            <SubmitButton value="Inciar Sesión" disabled={loading} />
        </Form>

    )
}

export default Login