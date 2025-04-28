

export const Form = ({ children, title, description, onSubmit, options }) => {
    return (
        <div className='bg-neutral-100 p-5 rounded shadow shadow-neutral-300 min-w-[20rem] min-h-[20rem] text-neutral-950 flex flex-col'>
            <h3 className='text-2xl font-bold'>{title}</h3>
            <h4>{description}</h4>
            <form onSubmit={onSubmit} className='mt-5 flex flex-col gap-3'>{children}</form>
            {options}
        </div>
    )
}