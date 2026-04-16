interface Message {
    found?: string,
    empty?: string
    data: any[],
}

interface ErrorMessage extends Message {
    err: any
}

const responseData = (message: Message, req: any) =>
    message.data.length > 0 ?
        {
            success: true,
            message: message.found || `${action(req)} ${getSequelizeName(message.data)}`,
            data: message.data
        }
    :   { 
            success: true,
            message: message.empty || `${getSequelizeName(message.data)}, not found` 
        }
   

const getSequelizeName = (data: any) => data.length > 0 ? Object.values(data)
    .toString()
    .split(":")[1]
    .split("]")[0] : "Empty"


const action = (req: Request) => {
    switch(req.method) {
        case 'POST': return 'Add'
        case 'DELETE': return 'Removed'
        case 'PUT': return 'Updated'
        case 'PATCH': return 'Updated' 
        default: return 'Fetching'
    }
}

export {  responseData, getSequelizeName, Message }