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
    //aquí me quedé
    //poner todos los cambios desde el state
    let input= null;
    if(this.props.answer === true){
      input = escrito.input;
    }else{
      input = this.state.input;
    }






    // escrito.input = "son las veinte cinco para las cuatro de la tarde mediodia medianoche.";
    // this.setState({input:"son las veinte cinco para las cuatro de la tarde mediodia medianoche."});
    
    // this.setState({inputWithFeedback:this.deletePhraseParts(returnthing)});

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
  randomGreeting(){
    let greetings = ["Perfecto!","Muy bién!","Felicidades!", "Enhorabuena!","Bien hecho!","Buen trabajo!"];
    return <span key="greetings">{greetings[Math.floor(Math.random() * greetings.length)]}</span>;
  }

  changeInputValue(value){
    let input = document.getElementById("escritoInteraction");
    this.setState({input : value,inputWithFeedback: null});
    escrito.input = value;

  }

  deletePhraseParts(object){
    let alternative = [];
    let value= "";
    let key= null;
    object.phraseStructure.forEach((part,index)=>{
      if(part.name === object.phrasePart){
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
    return <span className="alternative" key={`${object.phrasePart}${key}`} children={alternative} onClick={this.changeInputValue.bind(this,value)}></span>
  }

  createEitherOrAlternatives(timeObject){
    let returnObjects=[];
    let temporalStructure= null;
    timeObject.phraseStructure.forEach((part,index)=>{
      if(part.name === timeObject.part){
        temporalStructure = [...timeObject.phraseStructure];
        temporalStructure[index] = {...part};
        temporalStructure[index].name = temporalStructure[index].name + "X";
        returnObjects.push(this.deletePhraseParts({
          action: "delete",
          phrasePart: timeObject.part,
          phraseStructure:temporalStructure
        }))
      }
    });
    console.log(returnObjects);
    return returnObjects;
  }

  handleChange(e){
    if(e.target.value.match(/.+\..+$/)){
      return null;
    }
    this.setState({input:e.target.value});
    escrito.input = e.target.value;
    let timeObject = escrito.analyzePhrase(e.target.value);
    //validation
    if(timeObject.action === "show"){
      this.props.response({
        feedback:timeObject.feedback
      });
    }else if(timeObject.action === "delete"){
      this.setState({inputWithFeedback : this.deletePhraseParts(timeObject)})
    }else if(timeObject.action === "alternatives"){
      this.setState({inputWithFeedback : this.createEitherOrAlternatives(timeObject)});
    }else{
      this.setState({inputWithFeedback : null});
      
    }
    return null;
    if(timeObject.results){//if the timeObject has a results object
      console.log(timeObject);
      timeObject.feedback = timeObject.feedback.map((feed,index)=><span key={`feed${index}`}>{feed}</span>);
      let coloredFeedback = [...timeObject.feedback];
      let coloredInput = [];
      let objects = null;
      let keys = Object.keys(timeObject.results);
      if(keys.length > 0){//if the results came populated.
        objects=0;
        let inputCopy = escrito.input;
        let colors=["green","blue","purple","red"];
        let changes = []
        keys.forEach((key)=>{//checks if there is some issue.
          if(typeof timeObject.results[key] === "object" && !(Array.isArray(timeObject.results[key]))){//create sentences from the issues
            coloredFeedback.push(<span key={key} style ={{color: colors[objects]}}>{timeObject.results[key].feedback}</span>);
            changes.push({
              start:timeObject.results[key].index[0],
              end:timeObject.results[key].index[1],
              color:objects});
            objects ++;
          }
        })
        //color the words
        if(changes.length>0){
          let changesOrderedIndexes = changes.map((change)=>change.start);
          changesOrderedIndexes = changesOrderedIndexes.sort((a,b)=>b-a);
          changesOrderedIndexes.forEach((wordIndex)=>{
            let selectedObject = changes.find(change=>change.start === wordIndex);
            coloredInput.unshift(inputCopy.slice(selectedObject.end));
            inputCopy= inputCopy.slice(0,selectedObject.end);
            coloredInput.unshift(<span style ={{color: colors[selectedObject.color]}} key={`word${wordIndex}`}>{inputCopy.slice(selectedObject.start)}</span>);
            inputCopy= inputCopy.slice(0,selectedObject.start);
          });
          coloredInput.unshift(inputCopy);
        }
      }



      
      //Create alternatives
      if(Object.keys(timeObject.alternatives).length > 0 ){
        Object.keys(timeObject.alternatives).forEach((index)=>{
          let newValue;
          switch(index){
            case "intro":

              break;
            default:
              break;

          }
          timeObject.alternatives[index] = timeObject.alternatives[index].map((alternative,index)=><span className="alternatives" key={alternative}></span>)
        })
      }






      if(objects === null){// if the results came unpopulated
        this.setState({inputWithFeedback:escrito.input});
        this.props.response({
          feedback:coloredFeedback
        });
      }else if(objects === 0){//if the result came and there are NO issues
        //compare with the correct answer.
        let correctWriting;
        if(Array.isArray(timeObject.results.hours)){
          correctWriting = es.phraseFinder(timeObject.results.hours[0], timeObject.results.minutes, timeObject.results.mode,timeObject.results.period,timeObject.results.type)[0].phrase;
        }else{
          correctWriting = es.phraseFinder(timeObject.results.hours, timeObject.results.minutes, timeObject.results.mode,timeObject.results.period,timeObject.results.type)[0].phrase;
        }
        if(correctWriting===e.target.value){
          this.setState({inputWithFeedback:escrito.input});
          this.props.response({
            hours:timeObject.results.hours,
            minutes:timeObject.results.minutes,
            feedback:coloredFeedback
          });
        }else{
          coloredFeedback.push(<span key="comparison">Corrige detalles en la oración; {correctWriting}</span>)
          this.setState({inputWithFeedback:escrito.input});
          this.props.response({
            feedback:coloredFeedback
          });
        }
      }else{//if the result came and there ARE issues
        this.setState({inputWithFeedback:coloredInput});
        this.props.response({
          feedback:coloredFeedback
        });
      }
    }else{//response without results object
      console.log("timeObject sin results");
      this.setState({inputWithFeedback:escrito.input});
      this.props.response({feedback:timeObject.feedback})
    }
  }

  render(){
      return (<div className="escritoContainer">
        <div className={`escrito${(this.props.answer === true)?'':' show'}`} >{this.write(this.state.hours, this.state.minutes)}</div>
        <span className={`escritoSpan${(this.props.answer === true)?' show':''}`}>
          <div className="escritoInteractionShow" >{this.write(this.state.hours, this.state.minutes)}</div>
          <input id="escritoInteraction" className="escritoInteraction" placeholder="Escribe la hora aquí. Termina con un punto." value={escrito.input} onChange={this.handleChange}></input>
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