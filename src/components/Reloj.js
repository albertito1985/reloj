import {Component} from 'react';
import {es} from '../modell/writtenComponents/written';
import { reloj } from '../controller/controller';
import {CgArrowsHAlt} from 'react-icons/cg';

class Disco extends Component {
    calculateDegrees(){
        let hours = this.props.hours;
        let minutes = this.props.minutes;
        return {"--rotate": `${(hours*15) + (minutes*0.25)}deg`};
    }
  
    render(){
      return(<div className="disco" style={this.calculateDegrees()}></div>)
    }
  }
  
class Escrito extends Component{
render(){
    let text = es.phraseFinder(this.props.hours, this.props.minutes, this.props.mode);
    return(<div className="escrito" >{text}</div>)
}
}
  
class RelojDigital extends Component{
showTime(){
    
    let hours = this.props.hours;
    let returnArray=[]
    if(this.props.mode === 12){
        if(hours >= 12){
            hours = (hours - 12 === 0)? 12: hours - 12;
            returnArray.push(<span key="PM">-PM</span>);
        }else if(hours === 0 ){
            hours = 12;
            if(this.props.minutes===0){
                returnArray.push(<span key="PM">-PM</span>);
            }else{
                returnArray.push(<span key="AM">-AM</span>);
            }
            
        }else{
            returnArray.push(<span key="AM">-AM</span>);
        }
    }
    returnArray.unshift(<div className="hours" key="Hours">{(hours<10)?`0${hours}`: hours}</div>,
        <span key=":">:</span>,
        <div className="minutes" key="Minutes">{(this.props.minutes<10)? `0${this.props.minutes}`: this.props.minutes}</div>);
    return returnArray;
} 

render(){
    if(this.props.mode === null){
        return null;
    };
    return(<div className="relojDigital">
        {this.showTime()}
    </div>)
}
}
  
  class RelojAnalogo extends Component{
    constructor(){
      super();
      this.state = {
        moving: false,
        handle: undefined,
        clockWork:{
          time:{
            hours: undefined,
            minutes:undefined
          },
          degrees:{
            hours:undefined,
            minutes:undefined
          }  
        }
      };
      this.handle.eventHandlers.mouseUp =this.handle.eventHandlers.mouseUp.bind(this);
      this.handle.eventHandlers.mouseDown =this.handle.eventHandlers.mouseDown.bind(this);
      this.handle.eventHandlers.mouseMove = this.handle.eventHandlers.mouseMove.bind(this);
    }
    
    componentDidMount(){
      let reloj = document.getElementById("reloj");
      this.clockCenter = this.calculateClockCenter();
      let manillaContainers = Array.prototype.slice.call(document.getElementsByClassName("manillaContainer"));
      manillaContainers.forEach((container)=>{
        container.addEventListener('mousedown',this.handle.eventHandlers.mouseDown);
      });
      reloj.addEventListener('mouseup',this.handle.eventHandlers.mouseUp);
      reloj.addEventListener('mousemove',this.handle.eventHandlers.mouseMove);
    }
  
    calculateClockCenter(){
      let reloj = document.getElementById("reloj");
      let relojPosition= reloj.getBoundingClientRect();
      return {
        x: relojPosition.x + (reloj.clientWidth/2),
        y: relojPosition.y + (reloj.clientHeight/2)
      }
    }
  
    componentWillUnmount(){
      let reloj = document.getElementById("reloj");
      let manillaContainers = Array.prototype.slice.call(document.getElementsByClassName("manillaContainer"));
      manillaContainers.forEach((container)=>{
        container.removeEventListener('mousedown',this.handle.eventHandlers.mouseDown);
      });
      reloj.removeEventListener('mouseup',this.handle.eventHandlers.mouseUp);
      reloj.removeEventListener('mousemove',this.handle.eventHandlers.mouseMove);
    }
  
    handle = {
      that: this,
      both : {
        moveView(timeObject){
          let minutero = document.getElementById("minutero");
          let horario = document.getElementById("horario");
          minutero.style.setProperty('--rotation', timeObject.degrees.minutes);
          horario.style.setProperty('--rotation', timeObject.degrees.hours);
        },
      },
      eventHandlers:{
        mouseMove:function(e){
          if(this.state.moving === true){
            let timeObject = reloj.change(e, this.state.handle, this.clockCenter,this.state.clockWork);
            this.handle.both.moveView(timeObject);
            this.props.changeTime({...timeObject.time})
          }
        },
        mouseDown(e){
          let horario = document.getElementById("horario");
          let minutero = document.getElementById("minutero");
          let handle;
          if (horario.contains(e.target)){
            handle = "horario";
            horario.style.zIndex = 15;
          }else if(minutero.contains(e.target)){
            handle = "minutero";
            minutero.style.zIndex = 15;
          }
  
          this.setState({moving:true,
                handle:handle
              });
        },
        mouseUp(e){
          let actualHandle = document.getElementById(this.state.handle);
          actualHandle.style.zIndex = 10; 
          this.setState({moving:false,
          handle: "horario"});
        }
      }
    }
  
    render(){
      return(<div className="reloj" id="reloj">
        <div className="manillaContainer minutero" id="minutero"><span className="agarrador" ><CgArrowsHAlt/></span><div className="manilla"></div></div>
        <div className="manillaContainer horario" id="horario"><span className="agarrador" ><CgArrowsHAlt/></span><div className="manilla"></div></div>
        <div className="numeros">
        <div className="background">
          </div>
          <div className="horasContainer">
            <div className="horas numero1">
              <p className="numero">1</p>
            </div>
            <div className="horas numero2">
              <p className="numero">2</p>
            </div>
            <div className="horas numero3">
              <p className="numero">3</p>
            </div>
            <div className="horas numero4">
              <p className="numero">4</p>
            </div>
            <div className="horas numero5">
              <p className="numero">5</p>
            </div>
            <div className="horas numero6">
              <p className="numero">6</p>
            </div>
            <div className="horas numero7">
              <p className="numero">7</p>
            </div>
            <div className="horas numero8">
              <p className="numero">8</p>
            </div>
            <div className="horas numero9">
              <p className="numero">9</p>
            </div>
            <div className="horas numero10">
              <p className="numero">10</p>
            </div>
            <div className="horas numero11">
              <p className="numero">11</p>
            </div>
            <div className="horas numero12">
              <p className="numero">12</p>
            </div>
          </div>
          <div className="minutosContainer" style={{display:(this.state.handle === "minutero")? "flex":"none"}}>
            <div className="minutos numero1">
              <p className="numero">5</p>
            </div>
            <div className="minutos numero2">
              <p className="numero">10</p>
            </div>
            <div className="minutos numero3">
              <p className="numero">15</p>
            </div>
            <div className="minutos numero4">
              <p className="numero">20</p>
            </div>
            <div className="minutos numero5">
              <p className="numero">25</p>
            </div>
            <div className="minutos numero6">
              <p className="numero">30</p>
            </div>
            <div className="minutos numero7">
              <p className="numero">35</p>
            </div>
            <div className="minutos numero8">
              <p className="numero">40</p>
            </div>
            <div className="minutos numero9">
              <p className="numero">45</p>
            </div>
            <div className="minutos numero10">
              <p className="numero">50</p>
            </div>
            <div className="minutos numero11">
              <p className="numero">55</p>
            </div>
          </div>
          
        </div>
        <div className="numero logo">
        </div>
      </div>
      )
    }
  }


  export {Disco, Escrito, RelojDigital, RelojAnalogo}