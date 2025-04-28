export const TextArea = ({ name = '', label, value, onChange }) => {
    return (
        <div className='flex flex-col gap-1'>
            <label htmlFor={label} className='text-sm'>{label}</label>
            <textarea onChange={onChange} id={label} name={name} value={value}
                className='border-[1px] border-neutral-400 rounded shadow min-h-[5rem] p-2'
            >{value}</textarea>
        </div>
    )
}