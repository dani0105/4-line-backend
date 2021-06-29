import { Cell } from 'models';
import { Component } from 'react';

interface prop {
    data: Cell,
    onClick: any,
    onEnter:any,
    onLeave:any
    color:string
}

export class CellComponent extends Component<prop> {

    public state:Cell;

    constructor(props: any) {
        super(props);
        this.state=this.props.data;
    }
    

    private printCircle()  {
        if(this.props.data.ghost )
            return(
                <div style={{width:'45px',height:'45px',backgroundColor:this.props.color,opacity:0.5}} 
                className="rounded-circle m-auto d-block"/>
            );
        if(this.props.data.mark){
            return(
                <div style={{width:'45px',height:'45px',backgroundColor:'#000000'}} 
                className="rounded-circle m-auto d-block"/>
            );
        }
        return(
            <div style={{width:'45px',height:'45px',backgroundColor:this.props.color}} 
            className="rounded-circle m-auto d-block"/>
        );
    }

    render() {
        return (
            <div 
                style={{border:'solid 1px black',width:'50px',height:'50px'}} 
                onClick={(e)=> this.props.onClick(this.state)} 
                onMouseEnter={(e) => this.props.onEnter(this.state)}
                onDrag={(e) => {}}
                onMouseLeave={(e) => this.props.onLeave(this.state)}>
                    {this.printCircle()}
            </div>
        );
    }
}