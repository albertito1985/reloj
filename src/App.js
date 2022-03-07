import {Component} from 'react';
import './App.css';

import './controller/useful';//probar
import './controller/controller';
import { reloj } from './controller/controller';

import {es} from './modell/writtenComponents/written';

import {CgArrowsHAlt} from 'react-icons/cg';


class App extends Component {
  constructor(){
    super();
    this.state = {
      hours: 0,
      minutes: 0,
      period:"AM",
      config:{
        clockType:0,
        writtenType:0
      }
    }

    this.changeTime = this.changeTime.bind(this)
  }
  
  componentDidMount(){
    //fetch info from URL
  }

  changeTime({hours,minutes,period}){
    this.setState({
      hours:hours,
      minutes:minutes,
      period: period
    })
  }

  parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

  render(){
    return (
      <div className="App">
        <div className="container">
          <Disco hours={this.state.hours} minutes={this.state.minutes} period={this.state.period}/>
          <div className="relojes">
            <RelojAnalogo hours={this.state.hours} minutes={this.state.minutes} period={this.state.period} moving={this.state.moving} changeTime={this.changeTime}/>
            <RelojDigital hours={this.state.hours} minutes={this.state.minutes} period={this.state.period} changeTime={this.changeTime}/>
          </div>
          <div className="texto">
            <p className="pregunta">¿Qué hora és?</p>
            <Escrito hours={this.state.hours} minutes={this.state.minutes} mode={this.state.config.writtenType}/>
          </div>
        </div>
      </div>
    );
  }
}
class Disco extends Component {
  
  render(){
    return(<div className="disco"></div>)
  }
}

class Escrito extends Component{
  render(){
    let text = es.phraseFinder(this.props.hours, this.props.minutes, this.props.mode);
    return(<div className="escrito">{text}</div>)
  }
}

class RelojDigital extends Component{
  
  render(){
    return(<div className="relojDigital">
      <div className="hours">{(this.props.hours<10)?`0${this.props.hours}`: this.props.hours}</div>
      <span>:</span>
      <div className="minutes">{(this.props.minutes<10)? `0${this.props.minutes}`: this.props.minutes}</div>
    </div>)
  }
}

class RelojAnalogo extends Component{
  constructor(){
    super();
    this.state = {
      moving: false,
      handle: "horario",
      horario:0,
      minutero:0,
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
          let timeObject = reloj.change(e, this.state.handle, this.clockCenter);
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
          {/* <div className="minutos numero12">
            <p className="numero">00</p>
          </div> */}
        </div>
        
      </div>
      <div className="numero logo">
      </div>
    </div>
    )
  }
}


export default App;
