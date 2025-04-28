import { useState, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import { orderBy } from 'natural-orderby'
import { Trash2Icon, SquareTerminalIcon, EllipsisIcon } from 'lucide-react'
import Swal from 'sweetalert2'
import { toast } from 'sonner'
export const Row = ({ data, cols, onDelete, customActions, notDefaultActions }) => {
    const handleDelete = async () => {

        Swal.fire({
            titleText: `ADVERTENCIA`,
            text: `Esta seguro que desea eliminar '${data[Object.values(cols[0])[0]]}'`,
            confirmButtonColor: "#500",
            confirmButtonText: 'Eliminar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            cancelButtonColor: '#606060'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await onDelete(data.id)
            }
        }).catch(() => {
            toast.error('Hubo un error al eliminar')
        })


    }
    return (
        <tr className='bg-neutral-950 odd:bg-neutral-800 hover:bg-neutral-400 hover:text-neutral-950 transition-all text-sm'>
            {cols.map(col => {
                return <td className='text-center py-2 even:bg-neutral-800/30 select-none' key={uuid()}>{data[col.col]}</td>
            })}
            {
                !notDefaultActions && <td className='p-1 w-[5rem]'>
                    <div className='flex gap-5 justify-center px-5'>
                        <button onClick={() => handleDelete()} title={`Eliminar ${Object.values(data)[1]}`} className='cursor-pointer   hover:bg-red-300/50 hover:text-red-800 transition-all p-1 rounded'><Trash2Icon width={16} height={16} /></button>
                    </div>
                </td>
            }{
                customActions && <td className='flex justify-center gap-2 py-2 items-center'><customActions.Component value={data.id} /></td>
            }
        </tr>
    )
}


export const Table = ({ data, title, description, cols, customActions, notDefaultActions, onDelete = () => {} }) => {

    const [normalizeData, setNormalizeData] = useState([])

    useEffect(() => {

        const normalize = data.map(d => {
            const newObject = {}

            cols.forEach(col => {
                newObject[col.col] = d[col.as]
            })

            return { id: d.id, ...newObject }
        })
        setNormalizeData(normalize)
    }, [cols, data])

    const handleOrderBy = (column) => {
        const orderData = orderBy(normalizeData,
            [column],
            ['desc']

        )
        setNormalizeData(orderData)
    }

    return (
        <div className='mt-10 flex flex-col gap-1'>
            <h3 className='text-2xl font-bold'>{title}</h3>
            <h6 className='text-sm text-neutral-300'>{description}</h6>
            <div className='w-full h-full mt-5 '>
                {data.length > 0 ? (<table className='table-auto w-full l mx-auto border-collapse'>
                    <thead>
                        <tr className='text-md'>

                            {cols.map(c => <th onClick={() => handleOrderBy(c.col)} className='py-2 select-none bg-neutral-50 text-neutral-950 cursor-pointer' key={c.col}>{c.col}</th>)}

                            {!notDefaultActions && <th className=' py-2 bg-neutral-50 text-neutral-950 select-none' title='Acciones'><div className='flex justify-center'><SquareTerminalIcon /></div></th>}

                            {customActions && <td className='py-2 bg-neutral-50 text-neutral-950 select-none'><div className='flex justify-center' title='Opciones'><EllipsisIcon /></div></td>}
                        </tr>
                    </thead>
                    <tbody>
                        {normalizeData.map(nd => <Row onDelete={onDelete} key={nd.id} data={nd} cols={cols} notDefaultActions={notDefaultActions} customActions={customActions} />)}
                    </tbody>
                </table>) : <p>No hay datos</p>}
            </div>
        </div>
    )
}