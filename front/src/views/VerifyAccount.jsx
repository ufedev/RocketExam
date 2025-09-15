import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
export const VerifyAccount = () => {

  const { token } = useParams()
  const [active, setActive] = useState(false)
  const [loader, setLoader] = useState(false)
  useEffect(() => {

    async function load() {
      setLoader(true)
      const req = await fetch(`${import.meta.env.VITE_BACK_URL}/api/activate_account/${token}`)
      const res = await req.json()
      console.log(res)
      if (!res.error) {
        setActive(true)
      }
      setLoader(false)
    }
    try {
      load()
    } catch {
      console.log('something wrong')
    }
  }, [])

  if (loader) return <p>Verificando solicitud...</p>
  return <div><p>{active ? "La cuenta ha sido activada" : "Error 404, usuario no encontrado"} </p></div>

} 
