
export const Input = ({ label, type, name, placeholder, min = null, max = null, value, onChange }) => {
    return (
        <div className='flex flex-col gap-[2px] w-full'>
            <label className='text-sm' htmlFor={name}>{label}</label>
            <input
                id={name}
                className='border-[1px] border-neutral-400 rounded p-2 w-full'
                type={type} name={name} placeholder={placeholder} min={min} max={max} value={value} onChange={onChange} />
        </div>
    )
}