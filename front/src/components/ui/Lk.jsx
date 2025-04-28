import { Link } from 'react-router'


export const Lk = ({ value, href }) => {

    return <Link className='text-neutral-300 hover:text-neutral-50 transition-colors hover:underline hover:underline-offset-1' to={`${href}`} title={value}>{value}</Link>
}