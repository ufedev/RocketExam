import { useState, useEffect, useCallback } from 'react'
import { useExam } from '../stores/exam0'
import { useAuth } from '../stores/auth0'
import { Editor } from '@monaco-editor/react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '../components/ui/Button'
import { Spinner2 } from '../components/ui/Spinner2'
import 'github-markdown-css/github-markdown.css'
import Swal from 'sweetalert2'
import { TerminalIcon, ArrowBigUpIcon, ArrowBigDownIcon } from 'lucide-react'
import { Loader } from '../components/ui/Loader'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { v4 as uuid } from 'uuid'
const TakeExam = () => {


    const params = useParams()
    const navigate = useNavigate()
    const { token } = useAuth()
    const { loadExam, time, setTime, exam, resetStore } = useExam()
    const [loading, setLoading] = useState(true)
    const [activeProblem, setActiveProblem] = useState()
    const [examState, setExamState] = useState([])
    const [editorValue, setEditorValue] = useState('')
    const [outputResult, setOutputResult] = useState("")
    const [loadingTest, setLoadingTest] = useState(false)
    const [timeSpeed, setTimeSpeed] = useState(1)





    // Callback del handleResult
    const callbackExam = useCallback(() => {
        const getResult = async () => {
            setLoadingTest(true)
            try {
                const body = {
                    examId: exam.id,
                    resolvCodes: {}
                }
                examState.forEach(ex => {
                    body.resolvCodes[ex.problem] = ex.resolvCode ?? ''
                })


                const config = {
                    method: "POST",
                    headers: {
                        authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }

                const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/exam/result`, config)
                const res = await req.json()
                // console.log(res)
                if (res.error) {
                    toast.error(res.msg)
                }

                resetStore()
                navigate("/")


            } catch (err) {
                console.log(err)
            } finally {
                setLoadingTest(false)
            }


        }
        getResult()
    }, [exam?.id, examState, navigate, resetStore, token])

    // Cierre o actualización de ventana
    useEffect(() => {
        const handleCloseWindow = (event) => {


            // callbackExam()
            console.log('casi cerraste!')
            console.log(event)
            callbackExam()

            console.log('prevenido?')


        }

        window.addEventListener('beforeunload', handleCloseWindow)
        return () => window.removeEventListener('beforeunload', handleCloseWindow)
    }, [callbackExam, exam])

    // COntrolador velocidad TIMER
    useEffect(() => {
        if (exam) {
            const hanldeVisibilityChange = () => {

                if (window.document.hidden) {

                    setTimeSpeed(120)
                } else {
                    setTimeSpeed(1)
                }

            }
            const handleBlur = () => {

                setTimeSpeed(120)
            }
            const handleFocus = () => {

                setTimeSpeed(1)


            }


            window.document.addEventListener('visibilitychange', hanldeVisibilityChange)
            window.addEventListener('blur', handleBlur)
            window.addEventListener('focus', handleFocus)

            return () => {
                window.document.removeEventListener('visibilitychange', hanldeVisibilityChange)
                window.removeEventListener('blur', handleBlur)
                window.removeEventListener('focus', handleFocus)
            }
        }

    }, [exam])

    // Effect to get Exam
    useEffect(() => {

        const getExam = async () => {
            setLoading(true)
            try {
                const { id } = params
                const config = {
                    method: 'GET',
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                }


                const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/exam/list/${id}`, config)

                const res = await req.json()


                if (res.error) {
                    if (req.status === 403) {
                        navigate('/')
                    }

                    toast.error(res.msg)
                    return
                }

                loadExam(res.exam, 7200)


            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }

        }
        getExam()
    }, [loadExam, navigate, params, token])

    // Effect to setactiveProblem and ExamState who contains the resolvCode
    useEffect(() => {
        setLoading(true)
        if (exam) {
            setExamState(
                exam.problems.map((p) => ({ resolvCode: "", problem: p.id }))
            )
            setActiveProblem(exam.problems[0])
            setLoading(false)
        }
    }, [exam])

    // TIMER EFFEECT
    useEffect(() => {

        const interval = setInterval(() => {
            if (time > 0) {
                setTime(time - timeSpeed)
            }
        }, 1000)

        return () => clearInterval(interval)


    }, [setTime, time, timeSpeed])

    useEffect(() => {
        if (time !== null) {
            if (time <= 0) {

                Swal.fire("Se ha terminado el tiempo").then(() => {
                    resetStore()
                    callbackExam()
                    navigate('/')
                })

            }
        }
    }, [callbackExam, navigate, resetStore, time])
    // Effect to change the valueEditorCode 
    useEffect(() => {
        if (exam) {
            const activeP = examState.filter(exam => {
                if (exam.problem === activeProblem.id) {
                    return exam
                }
            })

            setEditorValue(activeP.shift()?.resolvCode ?? '')
        }
    }, [examState, activeProblem, exam])

    // CAMBIO DE CODIGO DEL EDITOR
    const handleChangeEditor = (value) => {
        const data = {
            problem: activeProblem.id,
            resolvCode: value
        }

        setExamState(examState.map((ex) => {
            if (ex.problem === data.problem) {
                return { ...data }
            }
            return ex
        }))


    }


    // CAMBIAR PROBLEMA

    const handleChangeProblem = (id) => {
        setActiveProblem(exam.problems.filter((p) => {
            if (p.id === id) {
                return p
            }
        }).shift())


        setOutputResult('')

    }

    // REALIZAR TEST

    const handleSubmitTest = async (id) => {
        setLoadingTest(true)
        const exam = examState.filter(ex => {
            if (ex.problem === id)
                return ex
        }).shift()


        try {
            const config = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    "authorization": `Bearer ${token}`
                },
                body: JSON.stringify(exam)
            }

            // console.log(config)

            const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/exam/problem/test`, config)
            const res = await req.json()
            setOutputResult(res.result)


        } catch {
            toast.error('Hubo un error inmanejable')
        } finally {
            setLoadingTest(false)
        }

    }

    // COMPONENTE
    const handleEndsExam = async () => {

        Swal.fire({
            titleText: "ADVERTENCIA ⚠️",
            text: "Un vez enviado no podra seguir haciendo el examen, Segur@ desea continuar?",
            confirmButtonColor: "#500",
            confirmButtonText: "Enviar",
            showCancelButton: true,
            cancelButtonText: "Cancelar"
        }).then(async (confirm) => {
            if (confirm.isConfirmed) {
                callbackExam()
            }

        })
    }



    if (loading)
        return <Loader />

    return (

        <div className='flex flex-col gap-2 overflow-auto pb-10'>


            <div className='grid grid-cols-2 grid-rows-1 gap-2  max-h'>
                <div div className=' grid grid-cols-10 rounded-md gap-2' >

                    <nav className='col-start-1 col-end-2 bg-neutral-900 text-neutral-950'>
                        {
                            exam?.problems?.map((p, index) =>
                                <button
                                    key={uuid()}
                                    className={`p-2 cursor-pointer  bg-neutral-950 text-neutral-50 text-2xl font-bold aspect-square w-full ${p.id === activeProblem?.id && 'border'}`} title={p.title}
                                    onClick={() => handleChangeProblem(p.id)}
                                >{index + 1}</button>
                            )
                        }

                    </nav>
                    <div className='col-start-2 col-end-11 rounded-md  border-[1px] border-neutral-500 shadow  bg-neutral-200 flex-1  overflow-hidden h-full'>

                        <article className='overflow-auto p-10 prose h-full min-w-full'>
                            <Markdown remarkPlugins={[remarkGfm]}>
                                {activeProblem?.description}
                            </Markdown>
                        </article>

                    </div>
                </div>
                <div className='grid grid-rows-3 gap-2 h-full'>
                    <div className=' row-start-1 row-end-3 border-[1px] border-neutral-500 rounded-md  overflow-hidden'>

                        <Editor defaultLanguage='javascript' theme='vs-dark' onChange={handleChangeEditor} value={editorValue} />

                    </div>
                    <div className='flex flex-col gap-2 h-full'>
                        {/* BOTON TEST */}
                        <Button value="Correr TEST" className='bg-green-300 text-neutral-950 hover:bg-green-800 ' onClick={() => handleSubmitTest(activeProblem.id)} disabled={loadingTest} />
                        {/* CONSOLA */}
                        <div className='flex-1 grid grid-cols-6 grid-rows-1 gap-2 h-full overflow-auto text-sm'>
                            <section className='col-start-1 col-end-3 bg-neutral-800 p-2 border-[1px] border-neutral-500 rounded-md h-full overflow-auto'>
                                <h4 className='font-bold text-neutral-400 flex gap-2' title='input'><ArrowBigDownIcon />Test</h4>
                                <article className='mt-3'>
                                    {JSON.parse(activeProblem?.input ?? "[]").map((i, idx) => {


                                        if (Array.isArray(i)) {
                                            if (idx === 0) {
                                                return <div key={uuid()} className='flex gap-1 border-b-[1px] pb-2 border-neutral-600'>{i.map((el, index) => {
                                                    return <p key={uuid()}>{JSON.stringify(el)}{index < el.length && ', '}Test Visible</p>
                                                })}</div>
                                            } else {
                                                return <div key={uuid()} className='flex gap-1 border-b-[1px] pb-2 border-neutral-600'>Test {idx + 1}</div>
                                            }
                                        }
                                        return <p className='border-b-[1px] pb-2 border-neutral-600' key={uuid()}>{JSON.stringify(i)}</p>
                                    })}
                                </article>
                            </section>
                            {/* <section className='col-start-3 col-end-4 bg-neutral-800 p-2 border-[1px] border-neutral-500 rounded-md overflow-auto'>
                                <h4 className='font-bold text-neutral-400 flex gap-2' title='output'>Test<ArrowBigUpIcon /></h4>
                                <article className='mt-3'>
                                    {JSON.parse(activeProblem?.output ?? "[]").map(out => {

                                        return <p key={uuid()} className='border-b-[1px] pb-2 border-neutral-600'>{JSON.stringify(out)}</p>

                                    })}
                                </article>
                            </section> */}
                            <section className='col-start-3 col-end-7 p-2 border-[1px] border-neutral-500 rounded-md bg-neutral-800 overflow-auto'>
                                <h4 className='font-bold text-neutral-400' title='terminal'><TerminalIcon /></h4>
                                <div className=' whitespace-pre-wrap mt-3'>
                                    {loadingTest ? <Spinner2 /> : (Array.isArray(outputResult) ? outputResult?.map(r => <p key={uuid()} className='pb-2 border-b border-neutral-600 text-sm'>{r}</p>) : outputResult)}
                                </div>
                            </section>
                        </div>
                    </div>

                </div>

            </div>
            <div className='flex items-center justify-between py-5'>
                <p className='text-2xl p-2 bg-neutral-700 rounded animate-pulse'>Timer: <span className='text-3xl font-bold'>
                    {Math.floor(time / 3600).toString().padStart(2, '0')}:{Math.floor((time % 3600) / 60).toString().padStart(2, '0')}:{(time % 60).toString().padStart(2, '0')}
                </span> </p>
                <Button value='Finalizar Examen' className='bg-green-300 hover:bg-green-800 text-neutral-950 text-2xl' onClick={handleEndsExam} />
            </div>

        </div >

    )
}

export default TakeExam