import { Spinner } from './Spinner'

export const Button = ({ value, onClick, disabled = false, className = "" }) => {
    return <button
        type='button'
        onClick={onClick}
        className={`${className} cursor-pointer p-2 rounded transition-all text-neutral-50 font-bold ${disabled && 'animate-pulse'} `}
        disabled={disabled}>{disabled ? <Spinner /> : value}</button>

}

export const SubmitButton = ({ value, disabled }) => {
    return <button type="submit" disabled={disabled}
        className={`cursor-pointer p-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-100 font-bold rounded shadow-2xl ${disabled && 'animate-pulse'} transition-all `} >
        {disabled ? <Spinner /> : value}
    </button>
}