// Only to private zone
// import { Button } from './ui/Button'
import { Lk } from './ui/Lk'
import { useAuth } from '../stores/auth0'
import { useState, useEffect } from 'react'
import logo from '../assets/logo.svg'
import { useResolvedPath } from 'react-router'
export const Header = () => {

    const path = useResolvedPath()
    const { logout, user } = useAuth()
    const [examPath, setExamPath] = useState(true)

    useEffect(() => {
        if (path.pathname.startsWith('/init/my_exams/resolv')) {
            setExamPath(true)
        } else {
            setExamPath(false)
        }
    }, [path, examPath])

    const handleCloseSession = () => {

        logout()
    }
    return <header className={` z-40 px-5 py-1 h-[4rem]  min-h-[4rem] border-b-[1px] border-neutral-700 bg-neutral-950 ${examPath && 'invisible'}`}>
        <div className='container mx-auto flex justify-between items-center h-full'>
            <div className='flex justify-center items-center gap-2'>
                <div className='w-full h-full'>
                    <img src={logo} width={60} height={60} />
                </div>
                <h2 className='text-2xl font-bold'>RocketExam</h2>
            </div>
            <nav className='flex-1 flex justify-end items-center gap-4 text-sm'>
                <Lk href="" value='Inicio' />
                {
                    user?.type === 'PROFESOR' && <Lk href="exams" value="Examenes" />
                }

                {
                    user?.type === 'PROFESOR' && <Lk href='problems' value="Problemas" />
                }
                <Lk href="my_exams" value='Mis Examenes' />
                <button className='cursor-pointer rounded border-none text-sm text-neutral-400' onClick={handleCloseSession}>Cerrar Sesión</button>
            </nav>
        </div>
    </header>
}