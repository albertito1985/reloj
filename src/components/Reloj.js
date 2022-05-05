import {Component} from 'react';
import {es} from '../modell/writtenComponents/written';
import { reloj, relojDigital, escrito, translate } from '../controller/controller';
import {CgArrowsHAlt} from 'react-icons/cg';
import {EndALoop} from '../controller/useful';//probar

class Disco extends Component {
    calculateDegrees(){
        let hours = this.props.hours;
        let minutes = this.props.minutes;
        return {"--rotate": `${(hours*15) + (minutes*0.25)}deg`};
    }
  
    render(){
      return(<div className="discoContainer">
        <div className="disco" style={this.calculateDegrees()}></div>
        <div className="discoArrow"></div>
      </div>)
    }
  }
  
class Escrito extends Component{
  constructor(){
    super();
    this.state = {
      hours:undefined,
      minutes:undefined,
      feedback:[],
      input:"",
      inputWithFeedback: null,
    }
    this.handleChange = this.handleChange.bind(this);
  }
  componentDidMount(){
    let input= null;
    if(this.props.answer === true){
      input = escrito.input;
    }else{
      input = this.state.input;
    }
    this.evaluatePhrase(input);
  }

  componentDidUpdate(prevProps,prevState){
    if(this.props.answer){
      let input= null;
      if(this.props.answer === true){
        input = escrito.input;
      }else{
        input = this.state.input;
      }
      if(prevState.input !== this.state.input){
        this.evaluatePhrase(input);
      }
    }
  }

  showInteraction(e){
    if(this.props.interaction){
      if(e.target.classList.contains("clockContainers")){
        let span = e.target.getElementsByClassName("digitalSpan")[0];
        let show = e.target.getElementsByClassName("digitalShow")[0];
        span.classList.add("show");
        show.classList.remove("show");
        let interaction = span.getElementsByClassName("digitalInteraction")[0];
        interaction.focus();
      }
    }
  }
  static getDerivedStateFromProps(props,state){
    if(props.answer){
      return {input:escrito.input,
        hours:escrito.hours,
        minutes: escrito.minutes};
    }else{
      return{
        hours:props.hours,
        minutes:props.minutes
      }
    }
  }
  write(hours,minutes){
    if(this.props.answer === true){
      return this.state.inputWithFeedback;
    }else{
      let text = es.phraseFinder(hours, minutes, this.props.mode);
      let content =  text.map((phrase,index)=>{
        return <p key={`${phrase.type}${index}`}><span className={`phrasePart phrase${phrase.type}`}>{phrase.phrase}</span></p>
      })
      return content;
    }
  }
  changeInputValue(value){
    escrito.input = value;
    this.setState({input : value,inputWithFeedback: null});
  }
  deletePhraseParts(inputObject){
    let alternative = [];
    let value= "";
    let key= null;
    inputObject.phraseStructure.forEach((part,index)=>{
      // if(part.name === object.phrasePart){
        if(inputObject.object.includes(part.name)){
        key+=index;
        if(alternative.length===0){
          alternative.push(<span key = {index} className="delete">{part.phrase}</span>)
        }else{
          alternative.push(` `);
          alternative.push(<span key = {index} className="delete">{part.phrase}</span>)
        }
      }else{
        if(alternative.length===0 ||part.name === "point"){
          alternative.push(part.phrase);
          value = value + part.phrase;
        }else{
          alternative.push(` ${part.phrase}`);
          value = value + ` ${part.phrase}`;
        }
      }
    });
    value= value.replace(/\s\s+/gi," ");
    return <span className="alternative" key={`${inputObject.object}${key}`} children={alternative} onClick={this.changeInputValue.bind(this,value)}></span>
  }
  createEitherOrAlternatives(timeObject){
    let returnObjects=[];
    let temporalStructure= null;
    timeObject.phraseStructure.forEach((part,index)=>{
      if(part.name === timeObject.object[0]){
        temporalStructure = [...timeObject.phraseStructure];
        temporalStructure[index] = {...part};
        temporalStructure[index].name = temporalStructure[index].name + "X";
        returnObjects.push(this.deletePhraseParts({
          action: "delete",
          object: timeObject.object,
          phraseStructure:temporalStructure
        }))
      }
    });
    return returnObjects;
  }
  switchParts(timeObject){
    timeObject.object.forEach((part,index)=>{
      if(part.correctPosition){
        let temporal = {...timeObject.object[part.correctPosition]};
        timeObject.object[part.correctPosition] = {...part};
        delete timeObject.object[part.correctPosition].correctPosition;
        timeObject.object[part.correctPosition].highlight = true;
        timeObject.object[index] = temporal;
        delete timeObject.object[index].correctPosition;
        timeObject.object[index].highlight = true;
      }
    });
    let value="";
    let children = [];
    timeObject.object.forEach((part)=>{
      if(children.length ===0 || part.name ==="point"){
        //do nothing
      }else{
        children.push(" ");
        value += " ";
      };
      if(part.highlight === true){
        children.push(<span className="highlight" key={part.phrase}>{part.phrase}</span>);
      }else{
        children.push(part.phrase)
      }
      value+=part.phrase;
    });
    return <span className="alternative" key={`${value}`} children={children} onClick={this.changeInputValue.bind(this,value)}></span>
  }
  highlightPart(inputObject){
    let children = [];
    inputObject.structure.forEach((part)=>{
      if(children.length ===0 || part.name ==="point"){
        //do nothing
      }else{
        children.push(" ");
      };
      if(part.highlight === true){
        children.push(<span key={part.phrase} className ="highlight">{part.phrase}</span>);
      }else{
        children.push(part.phrase);
      }
    });
    return <span key="highlight" children={children}></span>
  }
  replacePart(inputObject){
    let children = [];
    let value="";
    inputObject.structure.forEach((part)=>{
      if(children.length ===0 || part.name ==="point"){
        //do nothing
      }else{
        children.push(" ");
        value += " ";
      };
      if(part.replace){
        children.push(<span key={part.phrase} className ="highlight">{part.replace}</span>);
        value+=part.replace;
      }else{
        children.push(part.phrase);
        value+=part.phrase;
      }
    });
    return <span className="alternative" key={value} children={children} onClick={this.changeInputValue.bind(this,value)}></span>
  }

  replacePartsAndGiveAlternatives(timeObject){
    let returnArray = [];
    timeObject.structure.forEach((part,index)=>{
      if(part.replace){
        part.replace.forEach((replacement)=>{
          let structure = [...timeObject.structure];
          structure[index] = {...timeObject.structure[index]};
          structure[index].replace = replacement; 
          returnArray.push({structure})
        });
      }
    });
    return returnArray.map((replacement)=>{
      return this.replacePart(replacement);
    })
  }
  evaluatePhrase(input){
    if(input.match(/.+\..+$/)){
      return null;
    }
    let timeObject = escrito.analyzePhrase(input);
    //validation
    console.log(timeObject)
    if(timeObject.action === "show"){
      console.log("show");
      this.props.feedback({feedback:timeObject.feedback});
      this.setState({inputWithFeedback : null})
      return 0;
    }else if(timeObject.action === "delete"){
      console.log("delete");
      this.props.feedback({feedback:timeObject.feedback});
      this.setState({inputWithFeedback : this.deletePhraseParts(timeObject)});
      return 0;
    }else if(timeObject.action === "alternatives"){
      console.log("alternatives");
      this.props.feedback({feedback:timeObject.feedback});
      this.setState({inputWithFeedback : this.createEitherOrAlternatives(timeObject)});
      return 0;
    }else if(timeObject.action === "switch"){
      console.log("switch");
      this.props.feedback({feedback:timeObject.feedback});
      this.setState({inputWithFeedback : this.switchParts(timeObject)});
      return 0;
    }else if(timeObject.action === "highlight"){
      console.log("highlight");
      this.props.feedback({feedback:timeObject.feedback});
      this.setState({inputWithFeedback : this.highlightPart(timeObject)});
      return 0;
    }else if(timeObject.action === "replace"){
      console.log("replace");
      this.props.feedback({feedback:timeObject.feedback});
      this.setState({inputWithFeedback : this.replacePart(timeObject)});
      return 0;
    }else if(timeObject.action === "replaceAndAlternatives"){
      this.props.feedback({feedback:timeObject.feedback});
      this.setState({inputWithFeedback : this.replacePartsAndGiveAlternatives(timeObject)});
      return 0;
    }else{
      this.props.feedback({feedback:null});
      this.setState({inputWithFeedback : null});
    }
    this.props.response(timeObject);
  }
  handleChange(e){
    escrito.input = e.target.value;
    this.setState({input:e.target.value});
  }
  render(){
      return (<div className="escritoContainer">
        <div className={`escrito${(this.props.answer === true)?'':' show'}`} >{this.write(this.state.hours, this.state.minutes)}</div>
        <span className={`escritoSpan${(this.props.answer === true)?' show':''}`}>
          <div className="escritoInteractionShow" >{this.write(this.state.hours, this.state.minutes)}</div>
          <input id="escritoInteraction" className="escritoInteraction" placeholder="Escribe la hora aquí. Termina con un punto." value={(this.props.answer === true )?escrito.input:this.state.input} onChange={this.handleChange}></input>
        </span>
      </div>);
  }
}
  
class RelojDigital extends Component{
  constructor(){
    super();
    this.state={
      hours:undefined,
      minutes:undefined,
      period:undefined
    }
    this.handleChange = this.handleChange.bind(this);
    this.showInteraction = this.showInteraction.bind(this);
  };

static getDerivedStateFromProps(props,state){
  let timeObject ={};
  if(props.answer){
    if(props.mode === 12){
      timeObject = translate.time24hto12h({hours:relojDigital.hours,minutes:relojDigital.minutes});
      
    }else{
      timeObject = {
        hours:relojDigital.hours,
        minutes:relojDigital.minutes
      }
    }
    return {...timeObject};
  }else{
    if(props.mode === 12){
      timeObject = translate.time24hto12h({hours:props.hours,minutes:props.minutes});
    }else{
      timeObject = {
        hours:props.hours,
        minutes:props.minutes
      }
    };
    return {...timeObject}
  }
}

response(timeObject){
  if(this.props.answer){
    relojDigital.hours = timeObject.hours;
    relojDigital.minutes = timeObject.minutes;
    this.setState(timeObject);
  }else{
    this.props.response(timeObject);
    this.setState(timeObject);
  }
}

handleChange(e){
  if(e.target.id === "period"){
    this.response(relojDigital.togglePeriodIn24h(this.state));
  }else if(e.target.id === "hours"){
    let filteredSiffra;
    if(this.props.mode === 12){
        filteredSiffra = filterminmaxvalue(e.target.value,1,12);
    }else{
        filteredSiffra = filterminmaxvalue(e.target.value,0,23);
    }
    if(!(filteredSiffra=== undefined)){
      this.response({hours:filteredSiffra,minutes:this.state.minutes})
    }
  }else if(e.target.id === "minutes"){
    let filteredSiffra;
    filteredSiffra = filterminmaxvalue(e.target.value,0,59);
    if(!(filteredSiffra=== undefined)){
      this.response({hours:this.state.hours,minutes:filteredSiffra})
    }
  }
  function filterminmaxvalue(value,min,max){
    let filteredSiffra = /\d*?(\d?(\d))$/.exec(value);
    if(filteredSiffra !== null ){
      if(filteredSiffra[1]<=max && filteredSiffra[1]>min){
        return parseInt(filteredSiffra[1]);
      }else if(filteredSiffra[2]>=min){
        return parseInt(filteredSiffra[2]);
      }
    }
  }
}

showInteraction(e){
  if(this.props.interaction){
    if(e.target.classList.contains("clockContainers")){
      let span = e.target.getElementsByClassName("digitalSpan")[0];
      let show = e.target.getElementsByClassName("digitalShow")[0];
      span.classList.add("show");
      show.classList.remove("show");
      let interaction = span.getElementsByClassName("digitalInteraction")[0];
      interaction.focus();
    }
  }
}

hideInteraction(e){
  if(e.target.classList.contains("digitalInteraction")){
    let span = e.target.parentElement;
    let show = span.previousSibling;
    span.classList.remove("show");
    show.classList.add("show");
  }
}

showTime(){
  let timeToShow={
    hours: (this.state.hours<10)?`0${this.state.hours}`: this.state.hours,
    minutes:(this.state.minutes<10)?`0${this.state.minutes}`: this.state.minutes,
  }
  let returnArray=[]
  if(this.props.mode === 12){
    returnArray.push(<span key="-">-</span>,
    <div className="clockContainers" tabIndex="3" onFocus={this.showInteraction} id="hoursContainer" key="period">
      <div className="digitalShow show period" >{this.state.period}</div>
      <span className="digitalSpan period" >
        <select className="digitalInteraction" id="period" onChange={this.handleChange} value={this.state.period} onBlur={this.hideInteraction}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </span>
    </div>);
  }

  returnArray.unshift(<div className="clockContainers" tabIndex="1" onFocus={this.showInteraction} id="hoursContainer" key="Hours">
      <div className="digitalShow show hours" >{timeToShow.hours}</div>
      <span className="digitalSpan hours" key="spanHours"><input  className="digitalInteraction" onBlur={this.hideInteraction} type="text" id="hours" value={timeToShow.hours} onChange={this.handleChange}></input></span>  
    </div>,
    <span key=":">:</span>,
    <div className="clockContainers" tabIndex="2" onFocus={this.showInteraction} id="minutesContainer" key="minutes">
      <div className="digitalShow show minutes">{timeToShow.minutes}</div>
      <span className="digitalSpan minutes" key="spanMinutes"><input className="digitalInteraction" onBlur={this.hideInteraction} type="text" id="minutes" value={timeToShow.minutes} onChange={this.handleChange}></input></span>
    </div>);
  return returnArray;
}

  render(){
    return(<div className="relojDigital">
        {this.showTime(this.props.interaction)}
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
        degrees:{
          hours:0,
          minutes:0
        }  
      }
    };
    this.handle.eventHandlers.mouseUp =this.handle.eventHandlers.mouseUp.bind(this);
    this.handle.eventHandlers.mouseDown =this.handle.eventHandlers.mouseDown.bind(this);
    this.handle.eventHandlers.mouseMove = this.handle.eventHandlers.mouseMove.bind(this);
    this.handle.both.moveView= this.handle.both.moveView.bind(this);
  }

  static getDerivedStateFromProps(props,state){
      if(props.answer){
        return {clockWork:{
          degrees:{
            hours:reloj.states.hours,
            minutes:reloj.states.minutes
          }
        }}
      }else{
        let clockWork = {};
      clockWork.degrees = reloj.degreesFromNumber(props.hours, props.minutes);
      reloj.hours = props.hours;
      reloj.minutes = props.minutes;
      reloj.period = translate.time24hto12h({hours: props.hours,minutes:props.minutes}).period;
      reloj.states ={...clockWork.degrees};
      return {clockWork};
      }
      
  }

  componentDidMount(){
    this.clockCenter = this.calculateClockCenter();
    if(this.props.interaction === true){
      let manillaContainers = document.getElementsByClassName("manillaContainer");
      manillaContainers.forEach((container)=>{
        container.classList.add("active");
        container.addEventListener('mousedown',this.handle.eventHandlers.mouseDown);
      });
      let reloj = document.getElementById("reloj");
      reloj.addEventListener('mouseup',this.handle.eventHandlers.mouseUp);
      reloj.addEventListener('mousemove',this.handle.eventHandlers.mouseMove);
    }
    
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
    both : {
      moveView(timeObject){
        this.setState({clockWork:{
          degrees:{
            hours:timeObject.degrees.hours,
            minutes: timeObject.degrees.minutes
          }
        }})
      },
    },
    eventHandlers:{
      mouseMove:function(e){
        if(this.state.moving === true){
          let timeObject = reloj.change(e, this.state.handle, this.clockCenter);
          this.handle.both.moveView(timeObject);
          this.props.response({...timeObject.time});
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
        };
        this.setState({moving:true,
              handle:handle
            });
      },
      mouseUp(e){
        if(this.state.moving === true){
          let actualHandle = document.getElementById(this.state.handle);
          actualHandle.style.zIndex = 10; 
          this.setState({moving:false,
          handle: "horario"});
        }
      }
    }
  }

  render(){
    return(<div className="reloj" id="reloj">
      <div className="manillaContainer minutero" id="minutero" style={{"--rotation": `${this.state.clockWork.degrees.minutes}`}} ><span className="agarrador" ><CgArrowsHAlt/></span><div className="manilla"></div></div>
      <div className="manillaContainer horario" id="horario" style={{"--rotation": `${this.state.clockWork.degrees.hours}`}} ><span className="agarrador" ><CgArrowsHAlt/></span><div className="manilla"></div></div>
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