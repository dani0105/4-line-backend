import { CirclePicker } from 'react-color';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { DialogContent } from '@material-ui/core';
import  { useState } from 'react';

export function BoardConfigurationDialog(props: any) {

    const { onClose, params, open } = props;

    const [colorPlayer1,setPlayer1Color] = useState(params.colorPlayer1);
    const [colorPlayer2,setPlayer2Color] = useState(params.colorPlayer2);


    const handleClose = () => {
        onClose({
            colorPlayer1:colorPlayer1,
            colorPlayer2:colorPlayer2
        });
    };

    console.log(colorPlayer1);
    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Configuración</DialogTitle>
            <DialogContent>
                <div className="container-fluid">
                    <div className="row ">
                        <div className="col-12">
                            <h4 className='text-center'>Player1</h4>
                            <CirclePicker className="w-100" colors={['#F44E3B', '#FE9200', '#FCDC00', '#A4DD00']}
                                color={ colorPlayer1  }
                                onChangeComplete={(color: { hex: any; }) => setPlayer1Color(color.hex)}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <h4 className='text-center'>Player2</h4>
                            <CirclePicker width='100%' colors={['#68BC00', '#009CE0', '#7B64FF', '#FA28FF']}
                                color={ colorPlayer2 }
                                onChangeComplete={(color: { hex: any; }) => setPlayer2Color(color.hex)}
                            />
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-12">
                            <button onClick={handleClose} className="btn btn-block btn-success">Guardar</button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}