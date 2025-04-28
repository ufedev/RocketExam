const Option = ({ value, label }) => {
    return (
        <option value={value}>{label}</option>
    )
}

export const Select = ({ label, name, options, value, onChange }) => {
    return (
        <div className='flex flex-col gap-1'>
            <label htmlFor={label} className='text-sm'>{label}</label>
            <select id={label} name={name} value={value} onChange={onChange}
                className='border-[1px] border-neutral-400 p-2 rounded'
            >
                {options.map(option => <Option key={option.value} value={option.value} label={option.label} />)}
            </select>
        </div>
    )
}

// export const SelectMultiple = ({ label, name, options, value, onChange }) => {
//     return (
//         <div className='flex flex-col gap-1'>
//             <label htmlFor={label} className='text-sm'>{label}</label>
//             <select multiple  id={label} name={name} value={value} onChange={onChange}
//                 className='border-[1px] border-neutral-400 p-2 rounded'
//             >
//                 {options.map(option => <Option key={option.value} value={option.value} label={option.label} />)}
//             </select>
//         </div>
//     )
// }