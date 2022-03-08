import {Component} from 'react';
import './App.css';

import './controller/useful';//probar
// import './controller/controller';
import {Disco, Escrito, RelojDigital, RelojAnalogo} from './components/Reloj'

class App extends Component {
  constructor(){
    super();
    this.state = {
      hours: 0,
      minutes: 0,
      period:"AM",
      config:{
        digital:24,
        writtenType:0,
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
            <RelojAnalogo hours={this.state.hours} minutes={this.state.minutes} moving={this.state.moving} changeTime={this.changeTime}/>
            <RelojDigital hours={this.state.hours} minutes={this.state.minutes} mode={this.state.config.digital}/>
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



export default App;
