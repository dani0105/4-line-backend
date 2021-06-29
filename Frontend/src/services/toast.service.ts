import { toast } from 'react-toastify';


export function successToast( text:string, time=2000, hideProgressBar=true ):React.ReactText{
    return toast.success(text,{hideProgressBar:hideProgressBar,autoClose:time})
}

export function errorToast(text:string,time=2000, hideProgressBar=true):React.ReactText{
    return toast.error(text,{hideProgressBar:hideProgressBar,autoClose:time})
}

export function infoToast(text:string,time=2000, hideProgressBar=true):React.ReactText{
    return toast.info(text,{hideProgressBar:hideProgressBar,autoClose:time})
}

export function deleteToast(id:string|number){
    toast.done(id);
}
