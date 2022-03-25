import {language} from './swToEsLetterExceptions';
import {es} from '../modell/writtenComponents/written'; 
import { toBePartiallyChecked } from '@testing-library/jest-dom/dist/matchers';
export let reloj = {
    hours:0,
    minutes:0,
    period: "AM",
    moving:undefined,
    states:{
        minutes:360,
        hours:360,
    },
    change(e,handle,clockCenter){
        let degrees = this.degreesFromInteraction(e,clockCenter)
        if(handle === "minutero"){
            this.moving = "minutero";
            return this.handle.minutero.move(degrees);
        }else{
            this.moving = "horario";
            return this.handle.horario.move(degrees);
        }
    },
    degreesFromInteraction(e,clockCenter){
        let coordinates = {
          x:(e.clientX<clockCenter.x)?e.clientX-clockCenter.x:(e.clientX === clockCenter.x)? 0 :e.clientX - clockCenter.x,
          y:(e.clientY<clockCenter.y)?clockCenter.y - e.clientY:(e.clientY === 0)?0:(e.clientY- clockCenter.y)*(-1),
        }
        let angleInQuadrant = (Math.atan(Math.abs(coordinates.y)/Math.abs(coordinates.x)))*(180/Math.PI);
        return this.degreesFromCoordinates(coordinates.x, coordinates.y, angleInQuadrant);
    },

    degreesFromNumber(hours,minutes){
      if(hours>=12){
        hours -= 12;
      }
      let degrees= {minutes : minutes*6}
      degrees.hours = reloj.handle.minutero.hourDegrees(hours,minutes);
      reloj.hours=hours;
      reloj.minutes=minutes;
      reloj.states.hours = degrees.hours;
      reloj.states.minutes = degrees.minutes;
      return degrees;
    },

    degreesFromCoordinates(x,y,angle){
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
    },
    readPointingNumber(degrees, separation){
        let rest = degrees % separation;
        return (degrees- rest)/separation;
    },

    senseRotation(nextPosition,handle,criticalPoints){
        let returnObject= {};
        let threshold = 360/criticalPoints;
        let nextPositionSimplified= nextPosition % threshold;
        let handleStateSimplified= reloj.states[handle] % threshold;
    
        if(handleStateSimplified < 10 && (nextPositionSimplified <= (threshold-0.1) && nextPositionSimplified > threshold-10)){
          returnObject = {
            direction:"ccw",
            newTurn:true
          }
        }else if(nextPositionSimplified < 10 && (handleStateSimplified > (threshold-10) && handleStateSimplified <= (threshold-0.1))){
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
        return returnObject;
      },
    handle : {        
        minutero:{
          move(minuteDegrees, hourDegrees=undefined){
            let hours = reloj.hours;
            let period = reloj.period;
            let minutes = reloj.readPointingNumber(minuteDegrees,6);

            if(reloj.moving === "minutero"){
              let rotation = reloj.senseRotation(minuteDegrees,"minutes",1);
              if(rotation.newTurn === true){
                if(rotation.direction === "cw" ){
                  hours = (reloj.hours+1 === 24)?0:reloj.hours+1;
                }else if(rotation.direction === "ccw"){
                  hours = (reloj.hours-1 === -1)? 23: reloj.hours-1;
                }
              }
              hourDegrees = reloj.handle.minutero.hourDegrees(hours, minutes);
            }

            let rotation1 = reloj.senseRotation(hourDegrees,"hours",12);
            if(rotation1.newTurn){
              let rotation12 = reloj.senseRotation(hourDegrees,"hours",1);
              if(rotation12.newTurn === true){
                period = (reloj.period === "AM")? "PM":"AM";
                if(rotation12.direction === "cw" ){
                  if(period === "PM"){
                    hours = 12;
                  }else{
                    hours= 0;
                  }
                }else if(rotation12.direction === "ccw"){
                  if(period === "AM"){
                    hours= 11;
                  }else{
                    hours=23;
                  }
                }
              }else if(reloj.moving === "horario"){
                if(rotation1.direction === "cw" ){
                  hours = reloj.hours+1;
                }else if(rotation1.direction === "ccw"){
                  hours = reloj.hours-1;
                }
               
              }
            }
          
            reloj.states["minutes"] = minuteDegrees;
            reloj.states["hours"] = hourDegrees;
            reloj.hours = hours;
            reloj.minutes = minutes;
            reloj.period = period
            let returnObject = {
                time: {
                    hours:hours,
                    minutes:minutes,
                },
                degrees: {
                    hours: hourDegrees,
                    minutes: minuteDegrees
                }
            }
            return returnObject;
          },
          hourDegrees(hours, minutes){
            return (hours*30) + ((30/60)* minutes);
          }
        },
        horario:{
          move(hourDegrees){
            let minuteDegrees = reloj.handle.horario.minuteDegrees(hourDegrees);
            return reloj.handle.minutero.move(minuteDegrees, hourDegrees);
          },
          minuteDegrees(hourDegrees){
            return ((360*(hourDegrees % 30))/30);
          }
        },
      }
}

export let relojDigital = {
  hours:0,
  minutes:0,
  togglePeriodIn24h(timeObject12){
    let time24= translate.time12hto24h(timeObject12);
    if(this.state.period === "PM"){
      //pm to am
      return {
        hours: time24.hours - 12,
        minutes: time24.minutes
      };
    }else{
      //am to pm
      return {
        hours: (time24.hours +12 === 24)?0:time24.hours +12,
        minutes: time24.minutes
      }
    }
  }
}

export let escrito ={
  input: "",
  hours: 0,
  minutes:0,
  analyzePhrase(phrase){
    phrase= phrase.replace(/\s+/g," ").trim();
    let words = phrase.split(" ");
    let responseObject={feedback:["Escribe la hora aquí. Termina con un punto."]};
    if(words.length === 1){
      if(phrase.match(/.+\.$/)){
        return {feedback : "Revisa la frase", source:phrase};
      }
        return responseObject;
    }



    if(words.length >= 2){ // gives feedback about es o son at the beginning of the sentence.
      if(!(phrase.match(/^(?:[eé][szc]|[szc](?:ou|[oóuú])(?:ni|nj|[n|ñ]))/i))){
        responseObject.feedback.push("La hora siempre comienza con 'Es' ó 'Son'.");
        responseObject.input ={...responseObject.input,
          intro:{
            phrase:"",
            index:[0,words[0].length]
          }
        }
      }else{
        if(!(phrase.match(/^[EÉ]|[SZC]/))){
          responseObject.feedback.push("La primera letra de la oración siempre es mayuscula.");
        }
        responseObject.input = {whole:phrase};
      }
    }







    if(words.length === 2 && phrase.match(/.+\.$/)){
      responseObject.feedback.shift();
      if(words[0].match(/[eé][szc]$/i)){//es mediodía or es medianoche
        if(words[1].match(/m[eé]d(?:ll|[iyí])(?:ou|[oóuú])d(?:ll|[iyí])[aá]\.$/i)){
          console.log(responseObject);
          responseObject.result = {
            type : 0,
            minutes:0,
            hours:12
          }
          return responseObject;
        }else if(words[1].match(/m[eé]d(?:ll|[iyí])[aá](?:ni|nj|[n|ñ])(?:ou|[oóuú])(?:qu|[cszkq])h[eé]\.$/i)){
          responseObject.result = {
            type : 0,
            minutes:0,
            hours:0
          };
          return responseObject;
        }
      }
      
      responseObject.feedback.push("La hora comienza con 'Es la' ó 'Son las' si no es mediodía, medianoche ó la frase (minutos) para (horas).");
      return responseObject;
    }else{





      







      responseObject.results = {};
      let introduction = /^(?:[eé][szc]|^[szc](?:ou|[oóuú])(?:ni|nj|[n|ñ]))(?:\sl[aá][szc]?)?/gid.exec(phrase);
      if(introduction){
        responseObject.input ={...responseObject.input,
          intro:{
            phrase:phrase.slice(0,introduction[0].length),
            index:introduction.indices[0]
          }
        }
      }
      if(phrase.match(/.+\.$/)){// checks if the phrase has a period at the end and the period of time like de la mañana, de la tarde o de la noche. 
        responseObject.feedback.shift();
        let ending= phrase.match(/(?:d[eé]\sl[aá]\s\b[A-zÀ-ú]*\b).?$/i);
        if(ending){
          responseObject.input ={...responseObject.input,
            ending:{
              phrase: phrase.slice(ending.index),
              index:[ending.index,phrase.length]
            }
          }
          let response = /d[eé]\sl[aá]\s(\b[A-zÀ-ú]*\b).?$/id.exec(responseObject.input.ending.phrase);
          responseObject.results.period = this.identifyPeriod(response[1],response.indices[1],ending.index);
        }else{
          responseObject.input.ending = {phrase:""}
          responseObject.results.period = false;
          responseObject.feedback.push("Puedes terminar la frase con; de la mañana, de la tarde o de la noche, para que sea mas clara.");
        }
      }else{
        responseObject.input.ending = {phrase:""}
      }
      let corePhrase = phrase.replace(responseObject.input.intro.phrase,"").replace(responseObject.input.ending.phrase,"").replace(".","").trim();
      responseObject.input={...responseObject.input,
        core: {
          phrase: corePhrase,
          index: new RegExp(corePhrase,"d").exec(phrase).indices[0]
        }
      }
      if(responseObject.results.period !== undefined){
        if(responseObject.input.core.phrase.match(/^\b[A-zÀ-ú]*\b$/i)){// checks if the phrase is short like "son las diez."
          let hoursWritten =/^(\b[A-zÀ-ú]*\b)$/id.exec(responseObject.input.core.phrase);
          let hours = this.identifyHours(hoursWritten[1],hoursWritten.indices[1],responseObject.input.core.index[0]);
          let intro = this.checkIntro(responseObject.input.intro.phrase,2,hours,responseObject.input.intro.index);
          responseObject.results = {...responseObject.results,
            type:0,
            mode:4,
            minutes:0,
            hours: hours,
            intro:intro
          }
          if(typeof hours==="number"){
            responseObject.feedback.push("Puedes agregar 'en punto' después de la hora.");
          }
        }else if(responseObject.input.core.phrase.match(/[eé]n\sp(?:ou|[oóuú])nt(?:ou|[oóuú])/i)){//en punto
          let hoursWritten =/(\b[A-zÀ-ú]*\b)\s[eé]n\sp(?:ou|[oóuú])nt(?:ou|[oóuú])$/id.exec(responseObject.input.core.phrase);
          if(hoursWritten === null) return {feedback : "Revisa la frase.", source:responseObject.input.core.phrase};
          let hours = this.identifyHours(hoursWritten[1],hoursWritten.indices[1],responseObject.input.core.index[0]);
          let intro = this.checkIntro(responseObject.input.intro.phrase,2,hours,responseObject.input.intro.index);
          responseObject.results = {...responseObject.results,
            type:0,
            mode:0,
            minutes:0,
            hours: hours,
            intro:intro
          }
        }else if(responseObject.input.core.phrase.match(/(?<!tr[eé][iyí]nt[aá]|(?:qu|[cszkq])(?:ou|[oóuú])[aá]r[eé]nt[aá]|(?:qu|[cszkq])[iyí]n(?:qu|[cszkq])(?:ou|[oóuú])[eé]nt[aá])\s[iy]\s(?:\b[A-zÀ-ú]*\b(?:\s[iy]\s\b[A-zÀ-ú]*\b)?)/i)){//y
          let timeWritten =/(\b[A-zÀ-ú]*\b)\s(?<!tr[eé][iyí]nt[aá]|(?:qu|[cszkq])(?:ou|[oóuú])[aá]r[eé]nt[aá]|(?:qu|[cszkq])[iyí]n(?:qu|[cszkq])(?:ou|[oóuú])[eé]nt[aá])\s?[iy]\s(\b[A-zÀ-ú]*\b(?:\s[iy]\s\b[A-zÀ-ú]*\b)?)$/id.exec(responseObject.input.core.phrase);
          if(timeWritten === null) return {feedback : "Revisa la frase.", source:responseObject.input.core.phrase};
            let minutes = this.identifyMinutes(timeWritten[2],timeWritten.indices[2],responseObject.input.core.index[0]);
            let hours = this.identifyHours(timeWritten[1],timeWritten.indices[1],responseObject.input.core.index[0]);
            let intro = this.checkIntro(responseObject.input.intro.phrase,2,hours,responseObject.input.intro.index);
            if(minutes>40){
              responseObject.feedback.push("La frase '(horas) y (minutos)' se usa normalmente hasta los 40 minutos.");
            }
            responseObject.results = {...responseObject.results,
              type:1,
              mode:0,
              minutes:minutes,
              hours: hours,
              intro:intro
            }
        }else if(responseObject.input.core.phrase.match(/p[aá]r[aá]\sl[aá][szc]?\s/i)){//para
          let timeWritten = /((?:\b[A-zÀ-ú]*\b\s[iyí]\s)?\b[A-zÀ-ú]*\b)\sp[aá]r[aá]\sl[aá][cszkq]?\s(\b[A-zÀ-ú]*\b$)/id.exec(responseObject.input.core.phrase);
          if(timeWritten === null) return {feedback : "Revisa la frase.", source:responseObject.input.core.phrase};
            let minutes = this.identifyMinutes(timeWritten[1],timeWritten.indices[1],responseObject.input.core.index[0]);
            let hours = this.identifyHours(timeWritten[2],timeWritten.indices[2],responseObject.input.core.index[0]);
            let intro = this.checkIntro(responseObject.input.intro.phrase,1,minutes,responseObject.input.intro.index);
            if(minutes>25){
              responseObject.feedback.push("La frase '(minutos) para las (horas)' se usa cuando faltan menos de 25 minutos para cumplir la hora.")
            }
            responseObject.results = {...responseObject.results,
              type:2,
              mode:0,
              minutes: minutes,
              hours: hours,
              intro:intro
            }
        }else if(responseObject.input.core.phrase.match(/m[eé]n(?:ou|[oóuú])[szc]/)){//menos
          let timeWritten = /(\b[A-zÀ-ú]*\b)\sm[eé]n(?:ou|[oóuú])[szc]\s((?:\b[A-zÀ-ú]*\b\s[iyí]\s)?\b[A-zÀ-ú]*\b$)/id.exec(responseObject.input.core.phrase);
          if(timeWritten === null) return {feedback : "Revisa la frase.", source:responseObject.input.core.phrase};
          let minutes = this.identifyMinutes(timeWritten[2],timeWritten.indices[2],responseObject.input.core.index[0]);
          let hours = this.identifyHours(timeWritten[1],timeWritten.indices[1],responseObject.input.core.index[0]);
          let intro = this.checkIntro(responseObject.input.intro.phrase,2,hours,responseObject.input.intro.index);
          if(minutes>25){
            responseObject.feedback.push("La frase '(horas) menos (minutos)' se usa cuando faltan menos de 25 minutos para cumplir la hora.")
          }
          responseObject.results = {...responseObject.results,
            type:2,
            mode:1,
            minutes:minutes,
            hours: hours,
            intro:intro
          }
        }else{
          return {feedback : "Revisa la frase.", source:responseObject.input.core.phrase};
        }
      }else{
        return responseObject
      }
    }
    if(responseObject.results){
      if(Object.values(responseObject.results).some((value)=>typeof value==="object")){
        return responseObject
      }
    }
    responseObject = this.periodHourCongruence(responseObject);
    return responseObject
  },
  checkIntro(intro,wordsQuantity,relatedNumber,index){
    let regExNumber = (relatedNumber===1)?[/^[eé][szc]/i,/^[eé][szc]\sl[aá]/i]:[/^[szc](?:ou|[oóuú])(?:ni|nj|[n|ñ])/i,/^[szc](?:ou|[oóuú])(?:ni|nj|[n|ñ])\sl[aá][szc]/i]
    let regEx=(wordsQuantity === 1)? regExNumber[0]:regExNumber[1];
    if(intro.match(regEx)){
      return "ok";
    }else{
      if(relatedNumber === 1){
        if(wordsQuantity===1){
          return {feedback:"En este caso la introducción comienza con 'Es'.",source:intro,index:index};
        }else{
          return {feedback:"En este caso la introducción comienza con 'Es la'.",source:intro,index:index};
        }
      }else{
        if(wordsQuantity===1){
          return {feedback:"En este caso la introducción comienza con 'Son'.",source:intro,index:index};
        }else{
          return {feedback:"En este caso la introducción comienza con 'Son las'.",source:intro,index:index};
        }
      }
      
    }
  },
  periodHourCongruence(timeObject){
    let responseObject=timeObject;
    if(!(timeObject.results.period===0 || timeObject.results.period=== false)){
      responseObject.results.hours = (timeObject.results.hours +12 === 24)? 0: timeObject.results.hours +12;
    }
    if(timeObject.results.period === 0){
      if((timeObject.results.hours>12 && timeObject.results.hours<24) || timeObject.results.hours===0){
        responseObject.feedback.push("El periodo 'mañana' se usa entre la 1 y las 12 horas.");
      }
    }else if(timeObject.results.period === 1){
      if(!(timeObject.results.hours<19 && timeObject.results.hours>12)){
        responseObject.feedback.push("El periodo 'tarde' se usa entre las 13 y las 19 horas.");
      }
    }else if(timeObject.results.period === 2){
      if(timeObject.results.hours<19 && timeObject.results.hours !== 0){
        responseObject.feedback.push("El periodo 'noche' se usa entre las 19 y las 0 horas.");
      }
    }
    if(timeObject.results.type === 2){
      responseObject.results.hours = timeObject.results.hours-1;
      responseObject.results.minutes = 60-timeObject.results.minutes;
    };
    if(timeObject.results.period === false){
      responseObject.results.hours =[responseObject.results.hours, (timeObject.results.hours +12 === 24)? 0: timeObject.results.hours +12]
    }
    return responseObject;
  },
  identifyMinutes(minutesWritten,index,coreStartIndex){
    minutesWritten= minutesWritten.split(" ");
    if(minutesWritten.length ===1){
      if(minutesWritten[0].match(/m[eé]d(?:ll|[iyí])[aá]/)){
        return 30;
      }else if(minutesWritten[0].match(/(?:qu|[cszkq])(?:ou|[oóuú])[aá]rt(?:ou|[oóuú])/)){
        return 15;
      }else{
        if(minutesWritten[0].match(/^[vb][eé][iyí]nt[iyí]/i)){
          let units = minutesWritten[0].replace(/^[vb][eé][iyí]?nt[iyí]/i,"")
          units = this.numerosRegEx[0].findIndex((number)=>units.match(number));
          if (units>0){
            return 20 + units;
          }else{
            return {
              feedback:"Los minutos están mal escritos.",
              source:minutesWritten,
              index:[index[0]+coreStartIndex,index[1]+coreStartIndex]
            }
          }
        }
        let number = this.numerosRegEx[0].findIndex((number)=>minutesWritten[0].match(number));
        number = (number===-1)? this.numerosRegEx[1].findIndex((number)=>minutesWritten[0].match(number))*10: number;
        if(number === -1 || number === -10){
          return {
            feedback:"Los minutos están mal escritos.",
            source:minutesWritten,
            index:[index[0]+coreStartIndex,index[1]+coreStartIndex]
          }
        }
        return number
      }   
    }else{
      let regExUnits=this.numerosRegEx[0].slice(0,10);
      let decimal = this.numerosRegEx[1].findIndex((number)=>minutesWritten[0].match(number));
      let units = regExUnits.findIndex((number)=>minutesWritten[2].match(number));
      if(decimal ===-1 || units === -1){
        return {
          feedback:"Los minutos están mal escritos.",
          source:minutesWritten
        }
      }
      return (decimal * 10)+ units;
    }
  },
  identifyHours(hoursWritten,index,coreStartIndex){
    let number = this.numerosRegEx[0].findIndex((number)=>hoursWritten.match(number));
    if (number === -1 ){
      return {
        feedback:`Las horas están mal escritas.`,
        source: hoursWritten,
        index:[index[0]+coreStartIndex,index[1]+coreStartIndex]
      }
    }else if(number>12){
      return {
        feedback: "Después de las 12 se comienza a contar desde 1 de nuevo.",
        source: hoursWritten,
        index:[index[0]+coreStartIndex,index[1]+coreStartIndex]
      }
    }else{
      return number
    };
  },
  identifyPeriod(word,index,endingStartIndex){
    // agregar periodos ambiguos ... sin de la mañana, tarde o noche.
    let periodIdentifiers = [/m[aá](?:ni|nj|[n|ñ])[aá](?:ni|nj|[n|ñ])[aá].?$/i,/t[aá]rd[eé].?$/i,/n(?:ou|[oóuú])(?:qu|[cszkq])h[eé].?$/i];
      let identifierNumber = periodIdentifiers.findIndex((identifier)=>word.match(identifier));
      if(identifierNumber===-1){
        return {feedback: "El periodo está mal escrito.",
          source:word,
          index:[index[0]+endingStartIndex,index[1]+endingStartIndex]
        }
      }else{
        return identifierNumber
      };
  },
  numerosRegEx : [
    [/^(?:qu|[cszkq])[eé]r(?:ou|[oóuú])$/,/^(?:ou|[oóuú])n(?:ou|[oóuú]|[aá])$/,/^d(?:ou|[oóuú])[szc]$/,/^tr[eé][szc]$/,/^(?:qu|[cszkq])(?:ou|[oóuú])[aá]tr(?:ou|[oóuú])$/,/^(?:qu|[cszkq])[iyí]n(?:qu|[cszkq])(?:ou|[oóuú])$/,/^[szc][eé][iyí][szc]$/,/^[szc][iyí][eé]t[eé]$/,/^(?:ou|[oóuú])(?:qu|[cszkq])h(?:ou|[oóuú])$/,/^n(?:ou|[oóuú])[eé][vb][eé]$/,/^d[iyí][eé][szc]$/,/^(?:ou|[oóuú])n(?:qu|[cszkq])[eé]$/,/^d(?:ou|[oóuú])(?:qu|[cszkq])[eé]$/,/^tr[eé](?:qu|[cszkq])[eé]$/,/^(?:qu|[cszkq])[aá]t(?:ou|[oóuú])r(?:qu|[cszkq])[eé]$/,/^(?:qu|[cszkq])(?:ou|[oóuú])?[iyí]n(?:qu|[cszkq])[eé]$/,/^d[iyí][eé](?:qu|[cszkq])[iyí][szc][eé][iyí][szc]$/,/^d[iyí][eé](?:qu|[cszkq])[iyí][szc][iyí][eé]t[eé]$/,/^d[iyí][eé](?:qu|[cszkq])[iyí](?:ou|[oóuú])(?:qu|[cszkq])h(?:ou|[oóuú])$/,/^d[iyí][eé](?:qu|[cszkq])[iyí]n(?:ou|[oóuú])[eé][vb][eé]$/,/^[vb][eé][iyí]?nt[eé]$/],
    [/^$/,/^$/,/^[vb][eé][iyí]nt[iyí]/,/^tr[eé][iyí]nt[aá]$/,/^(?:qu|[cszkq])(?:ou|[oóuú])[aá]r[eé]nt[aá]$/,/^(?:qu|[cszkq])[iyí]n(?:qu|[cszkq])(?:ou|[oóuú])[eé]nt[aá]$/],
  ]
}

export let translate = {
  time12hto24h(timeObject){
    let responseObject={minutes: timeObject.minutes};
    if(timeObject.hours === 12 && timeObject.period === "AM"){
      responseObject.hours = 0;
    }else if (timeObject.hours === 12 && timeObject.period === "PM"){
      responseObject.hours = timeObject.hours;
    }else if(timeObject.period === "PM"){
      responseObject.hours = timeObject.hours +12;
    }else{
      responseObject.hours = timeObject.hours;
    }
    return responseObject;
  },
  time24hto12h(timeObject){
    if(timeObject.hours === 0 ){
      timeObject.hours = 12;
        timeObject.period ="AM"
    }else if(timeObject.hours > 12){
      timeObject.hours = timeObject.hours - 12;
      timeObject.period = "PM";
    }else if(timeObject.hours === 12){
        timeObject.period ="PM"
    } else{
      timeObject.period ="AM"
    }
    return timeObject;
  }
}