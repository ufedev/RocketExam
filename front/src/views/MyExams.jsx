import { useState, useEffect } from 'react'
import { useAuth } from '../stores/auth0'
import { Loader } from '../components/ui/Loader'
import { Table } from '../components/ui/Table'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { useNavigate } from 'react-router'
import Swal from 'sweetalert2'
const MyExams = () => {

    const navigate = useNavigate()
    const { token } = useAuth()

    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingButton, setLoadingButton] = useState(false)
    const cols = [
        {
            col: "Examen",
            as: "name"
        }
    ]

    const handleClickAction = async (value) => {
        setLoadingButton(true)
        try {
            const config = {
                headers: {
                    authorization: `Bearer ${token}`
                }
            }
            const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/exam_result/get/${value}`, config)
            const res = await req.json()

            if (res.error) {
                toast.error(res.msg)
                setLoadingButton(false)
                return
            }
            if (res.resultExam) {
                const note = res.resultExam.result
                Swal.fire({
                    title: 'Ya completaste este examen',
                    text: `Tu nota fue ${note < 46 ? `${note} : Insatisfatoria 😢` : note > 46 && (note > 66 ? `${note} : Promocionado 🥳` : `${note} : Regular 👍`)}`,
                    confirmButtonColor: "#000"
                })
                setLoadingButton(false)
                return

            }
            Swal.fire({
                title: "Advertencia ⚠️",
                html: `<p class='whitespace-pre-line'>Una vez iniciado no se puede volver atras,\n cualquier recarga o cierre de pestaña anulara el examen.\n LEER BIEN TODO </p>`,
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#000',
                showCancelButton: true,

            }).then((confirm) => {
                if (confirm.isConfirmed) {

                    // console.log(confirm)
                    Swal.fire({
                        title: 'Condiciones ✍️',
                        html: `<p class='whitespace-pre-line'>Tendran un maximo de 2Horas, una vez finalizado ese tiempo se enviara automaticamente.\n
                        
                        Si se abre la consola o cambia de pestaña o miniminza el navegador el tiempo correra mas rápido. Por ejemplo si tienen 2hrs son 120min, en caso de salir el tiempo correra 2min por cada segundo, osea, tendran únicamente 1min si permanecen fuera como maximo.\n
                        
                        El examen devuelve la nota al finalizarlo, pero durante el examen tienen la herramienta de test que controlara y mostrara los resultados y/o errores.\n

                        Una vez finalizá el tiempo el examen se envia automaticamente.\n
                        
                        </p>`,
                        confirmButtonText: 'Continuar',
                        confirmButtonColor: "#000",
                        showCancelButton: true
                    }).then((confirm) => {
                        if (confirm.isConfirmed) {
                            Swal.fire({
                                title: "Reglas 🫷",
                                html: `<p class='whitespace-pre-line'>Esta prohibido el uso del celular durante el examen, los celulares deben estar en un lugar visible y boca abajo.\n
                                Cualquier falta hará que se anule del examen.\n
                                 No habra respuestas a consultas durante el examen solo una vez finalizado, ahí se verán los problemas y posibles soluciones.\n
                                  </p>
                                 `,
                                confirmButtonColor: '#000',
                                confirmButtonText: 'Ir al examen',
                                showCancelButton: true

                            }).then(confirm => {
                                if (confirm.isConfirmed) {
                                    navigate(`resolv/${value}`)
                                }
                            })
                        }
                    })
                }
            })
            // 




        } catch {
            toast.error('Hubo un problema')

        } finally {
            setLoadingButton(false)
        }
    }
    const actions = {
        Component: ({ value }) => <Button onClick={() => handleClickAction(value)} value="Tomar" className="odd:bg-neutral-50 hover:odd:bg-neutral-300 text-neutral-950" loading={loadingButton} />
    }
    useEffect(() => {
        const getExams = async () => {
            try {
                const config = {

                    headers: {
                        authorization: `Bearer ${token}`
                    }
                }
                const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/exam/list`, config)
                const res = await req.json()
                if (res.error) {
                    // toast.error(res.msg)
                    setLoading(false)
                    return
                }

                setExams(res.exams)

            } catch {
                toast.error('Hubo un error al cargar los examenes')
            } finally {
                setLoading(false)
            }
        }

        getExams()
    }, [token])
    if (loading) {
        return <Loader />
    }
    return (

        <div className='h-full overflow-auto scrollbar-hidden'>
            <div className='mt-5'>
                <h2 className='text-3xl font-bold'>Mis Examenes</h2>
            </div>
            <div className=''>
                <Table title="Examenes" description="Listado de disponibilidad" cols={cols} data={exams} notDefaultActions customActions={actions} />
            </div>
        </div>

    )
}

export default MyExams