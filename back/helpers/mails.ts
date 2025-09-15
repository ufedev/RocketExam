import nodemailer from 'nodemailer'


const transporter = nodemailer.createTransport(
  {
    host: `${process.env.MAIL_HOST}`,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  } as nodemailer.TransportOptions
)

/** 
 * activateAccount
 * Envia un mail para activar la cuenta
 * @param mail string
 * @param token string  
 * */
export async function activateAccount(mail: string, token: string) {

  const info = await transporter.sendMail({
    from: "utn_devsafio@ufedev.com",
    to: mail,
    subject: "Activa tu cuenta para acceder",
    text: `
    Bienvenido a UTN_DEVSAFIO.
    para activar tu cuenta podes hacer click en el siguiente enlace.

    ${process.env.FRONT_URL}/activate_account/${token}
    

    Si no fuiste quien se registro, ignorá este mail
`
  })

}
