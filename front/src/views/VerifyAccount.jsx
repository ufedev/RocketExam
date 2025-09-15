import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
export const VerifyAccount = () => {

  const { token } = useParams()
  const [active, setActive] = useState(false)
  useEffect(() => {

    async function load() {
      const req = await fetch(`${import.meta.env.VITE_BACK_URL}/acitvate_account/${token}`)
      const res = await req.json()
      if (!er) {
        setActive(true)
      }
    }


  }, [])

  if (active) {
    return <p>Su cuenta ha sido activada</p>
  }

  return <p>No encontrado</p>

} 
