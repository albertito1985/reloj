import {Component} from 'react';
import './App.css';
import {CgArrowsHAlt} from 'react-icons/cg';
import './controll/useful';//probar
import {es} from './modell/writtenComponents/written';

class App extends Component {
  constructor(){
    super();
    this.state = {
      hours: 12,
      minutes: 0,
    }

    this.changeTime = this.changeTime.bind(this)
  }
  changeTime(hours,minutes){
    this.setState({
      hours:hours,
      minutes:minutes
    })
  }
  render(){
    return (
      <div className="App">
       <Reloj hours={this.state.hours} minutes={this.state.minutes} changeTime={this.changeTime}/>
       <Escrito hours={this.state.hours} minutes={this.state.minutes}/>
      </div>
    );
  }
}

class Escrito extends Component{
render(){
  let text = es.phraseFinder(this.props.hours, this.props.minutes);
  return(<div>{text}</div>)
}
}

class Reloj extends Component{
  constructor(){
    super();
    this.state = {
      moving: false,
      handle: undefined,
      horario:0,
      minutero:0
    };
    this.degreesCenteredIn0 = this.degreesCenteredIn0.bind(this);
    this.calculateDegrees = this.calculateDegrees.bind(this);
    this.handle.eventHandlers.mouseUp =this.handle.eventHandlers.mouseUp.bind(this);
    this.handle.eventHandlers.mouseDown =this.handle.eventHandlers.mouseDown.bind(this);
    this.handle.eventHandlers.mouseMove = this.handle.eventHandlers.mouseMove.bind(this);
    this.handle.minutero.move = this.handle.minutero.move.bind(this);
    this.handle.minutero.hourDegrees = this.handle.minutero.hourDegrees.bind(this);
    this.handle.horario.move = this.handle.horario.move.bind(this);
    this.handle.senseRotation =this.handle.senseRotation.bind(this);
    let deadCenter;
  }
  
  componentDidMount(){
    let reloj = document.getElementById("reloj");
    this.deadCenter = reloj.clientHeight/2;
    let manillaContainers = Array.prototype.slice.call(document.getElementsByClassName("manillaContainer"));
    manillaContainers.forEach((container)=>{
      container.addEventListener('mousedown',this.handle.eventHandlers.mouseDown);
    });
    reloj.addEventListener('mouseup',this.handle.eventHandlers.mouseUp);
    reloj.addEventListener('mousemove',this.handle.eventHandlers.mouseMove);
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
      moveView(hourDegrees,minuteDegrees){
        let minutero = document.getElementById("minutero");
        let horario = document.getElementById("horario");
        minutero.style.setProperty('--rotation', minuteDegrees);
        horario.style.setProperty('--rotation', hourDegrees);
      }
    },
    senseRotation(nextPosition,handle,criticalPoints){
      let returnObject= {};
      let threshold = 360/criticalPoints;
      let nextPositionSimplified= nextPosition % threshold;
      let handleStateSimplified= this.state[handle] % threshold;
      
      if(handleStateSimplified < 10 && (nextPositionSimplified <= (threshold-1) && nextPositionSimplified > threshold-10)){
        returnObject = {
          direction:"ccw",
          newTurn:true
        }
      }else if(nextPositionSimplified < 10 && (handleStateSimplified > (threshold-10) && handleStateSimplified <= (threshold-1))){
        returnObject = {
          direction:"cw",
          newTurn:true
        }
      }
      else {
        returnObject = {
          direction: "not critic"
        }
      }

      let stateObject={};
      stateObject[handle]=nextPosition;
      this.setState(stateObject);
      return returnObject;
    },
    minutero:{
      move(minuteDegrees){
        let hours = this.props.hours;
        
        let rotation = this.handle.senseRotation(minuteDegrees,"minutero",1);
        
        if(rotation.newTurn === true){
          if(rotation.direction === "cw" ){
            hours = (this.props.hours+1 === 13)? 1:this.props.hours+1;
          }else if(rotation.direction === "ccw"){
            hours = (this.props.hours-1 === 0)? 12: this.props.hours-1;
          }
        }

        let minutes = this.pointingNumber(minuteDegrees,6);
        let hourDegrees = this.handle.minutero.hourDegrees(hours, minutes);
        


        this.handle.both.moveView(hourDegrees,minuteDegrees-(minuteDegrees % 6));
        this.props.changeTime(hours,minutes);
      },
      hourDegrees(hours, minutes){
        return hours*30 + ((30/60)* minutes);
      }
    },
    horario:{
      move(hourDegrees){
        let minutes = this.props.minutes;
        
        let rotation = this.handle.senseRotation(hourDegrees,"horario",12);

        if(rotation.newTurn === true){
          if(rotation.direction === "cw" ){
            minutes = 0;
          }else if(rotation.direction === "ccw"){
            minutes = 59;
          }
        }

        let hours = this.pointingNumber(hourDegrees,30) || 12;
        let minuteDegrees = this.handle.horario.minuteDegrees(hourDegrees);
       
        this.handle.both.moveView(hourDegrees,minuteDegrees);
        this.props.changeTime(hours,minutes);

        //falta actualizar el minutero
      },
      minuteDegrees(hourDegrees){
        return ((360*(hourDegrees % 30))/30);
      }
    },
    eventHandlers:{
      mouseMove:function(e){
        if(this.state.moving === true){      
          let degrees = this.calculateDegrees(e)
          
          if(this.state.handle === "minutero"){
            this.handle.minutero.move(degrees);
          }else{
            this.handle.horario.move(degrees);
          }
          
        }
      },
      mouseDown(e){
        let horario = document.getElementById("horario");
        let minutero = document.getElementById("minutero");
        let handle =undefined;
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
        let angle = this.roundAngleOff(e);// no está functionando
        let actualHandle = document.getElementById(this.state.handle);
        actualHandle.style.zIndex = 10; 





        this.setState({moving:false,
        handle: undefined});
      }
    }
  }

  //mover a controll 

  degreesCenteredIn0(x,y,angle){
    let quadrants={
      x: ()=>{
        if(x===0){
          return "c";
        }else if(x>0){
          return 1;
        }else{
          return 2
        }
      },
      y:()=>{
        if(y===0){
          return "c";
        }else if(y>0){
          return "a";
        }else{
          return "b"
        }
      }
    };

    switch(`${quadrants.x()}${quadrants.y()}`){
      case"cc":
        return 0
      case"1a":
        return 90 - angle;
      case"1b":
        return 90+angle;
      case"2a":
        return 270+angle;
      case"2b":
        return 270-angle;
      case"ca":
        return 0;
      case"cb":
        return 180;
      case"1c":
        return 90;
      case"2c":
        return 270;
      default:
        return 0;
    }
  }

  calculateDegrees(e){
    let coordinates = {
      x:(e.clientX<this.deadCenter)?e.clientX-this.deadCenter:(e.clientX === this.deadCenter)? 0 :e.clientX - this.deadCenter,
      y:(e.clientY<this.deadCenter)?this.deadCenter - e.clientY:(e.clientY === 0)?0:(e.clientY- this.deadCenter)*(-1),
    }
    let angleInQuadrant = Math.floor((Math.atan(Math.abs(coordinates.y)/Math.abs(coordinates.x)))*(180/Math.PI));
    return this.degreesCenteredIn0(coordinates.x, coordinates.y, angleInQuadrant);
  }

  roundAngleOff(e){
    let degrees = this.calculateDegrees(e);
    let difference = degrees % 30;
    if(difference!== 0){
        return difference
      }else if(difference<15){
        return degrees-difference
      }else if(difference>15){
        return degrees + (30-difference)
      }
    }

  pointingNumber(degrees, grades){
    let rest = degrees % grades;
    return (degrees- rest)/grades;
  }

 


  render(){
    return(<><div className="reloj" id="reloj">
      <div className="manillaContainer minutero" id="minutero"><span className="agarrador" ><CgArrowsHAlt/></span><div className="manilla"></div></div>
      <div className="manillaContainer horario" id="horario"><span className="agarrador" ><CgArrowsHAlt/></span><div className="manilla"></div></div>
      <div className="numeros">
        <div className="horasContainer">
          <div className="horas numero1">1</div>
          <div className="horas numero2">2</div>
          <div className="horas numero3">3</div>
          <div className="horas numero4">4</div>
          <div className="horas numero5">5</div>
          <div className="horas numero6">6</div>
          <div className="horas numero7">7</div>
          <div className="horas numero8">8</div>
          <div className="horas numero9">9</div>
          <div className="horas numero10">10</div>
          <div className="horas numero11">11</div>
          <div className="horas numero12">12</div>
        </div>
        <div className="minutosContainer">
          <div className="minutos numero1">5</div>
          <div className="minutos numero2">10</div>
          <div className="minutos numero3">15</div>
          <div className="minutos numero4">20</div>
          <div className="minutos numero5">25</div>
          <div className="minutos numero6">30</div>
          <div className="minutos numero7">35</div>
          <div className="minutos numero8">40</div>
          <div className="minutos numero9">45</div>
          <div className="minutos numero10">50</div>
          <div className="minutos numero11">55</div>
          <div className="minutos numero12">00</div>
        </div>
      </div>
      
      <div className="numero digital">
        <span className="hours">{(this.props.hours<10)?`0${this.props.hours}`: this.props.hours}</span>
        <span className="minutes">{(this.props.minutes<10)? `0${this.props.minutes}`: this.props.minutes}</span>
      </div>
    </div>
   
    </>
    )
  }
}


export default App;
