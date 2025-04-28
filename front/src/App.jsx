
import { BrowserRouter, Routes, Route } from 'react-router'
import { Suspense, lazy } from 'react'
import { Loader } from './components/ui/Loader'
import { Toaster } from 'sonner'


import Login from './views/Login'
import CreateAccount from './views/CreateAccount'
import CreateProblem from './views/CreateProblem'
import CreateExam from './views/CreateExam'
const Public = lazy(() => import("./layouts/Public"))
const Private = lazy(() => import('./layouts/Private'))
const Problems = lazy(() => import('./views/Problems'))
const Exams = lazy(() => import('./views/Exams'))
const MyExams = lazy(() => import('./views/MyExams'))
const TakeExam = lazy(() => import('./views/takeExam'))
const Init = lazy(() => import('./views/Init'))
//Private



export default function App () {
  return (
    <Suspense fallback={<Loader />}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Suspense fallback={<Loader />}><Public /></Suspense>} >
            <Route index element={<Login />} />
            <Route path='create_account' element={<CreateAccount />} />
            <Route path='forgot_password' element={<h1>Forgot Paassrod</h1>} />
          </Route>

          <Route path='/init' element={<Suspense fallback={<Loader />}><Private /></Suspense>}>
            <Route index element={<Suspense fallback={<Loader />}><Init /></Suspense>} />
            {/* EXAMENES */}
            <Route path='exams' >
              <Route index element={<Suspense fallback={<Loader />}><Exams /></Suspense>} />
              <Route path='create' element={<CreateExam />} />
            </Route>
            {/* PROBLEMAS */}
            <Route path='problems'>
              <Route index element={
                <Suspense fallback={<Loader />}>
                  <Problems />
                </Suspense>
              } />
              <Route path='create' element={<CreateProblem />} />
            </Route>
            {/* EXAMEN RESULTADO/PRUEBA */}
            <Route path='my_exams'>
              <Route index element={<Suspense fallback={<Loader />}><MyExams /></Suspense>} />
              <Route path="resolv/:id" element={<Suspense fallback={<Loader />}><TakeExam /></Suspense>} />
            </Route>
            {/* 404 */}
            <Route path='*' element={<div className='w-full h-screen flex justify-center items-center'><h1 className='text-3xl'>Ruta no encontrada 404</h1></div>} />
          </Route>
        </Routes>
        <Toaster richColors visibleToasts={1} />
      </BrowserRouter>
    </Suspense>
  )
}