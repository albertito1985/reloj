import {language} from './swToEsLetterExceptions';
import {es} from '../modell/writtenComponents/written'; 
import { toBePartiallyChecked } from '@testing-library/jest-dom/dist/matchers';
import {EndALoop} from './useful';
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
  input: "son las veinte cinco para las cuatro de la tarde mediodia.",
  hours: 0,
  minutes:0,
  analyzePhrase(phrase){
    phrase= phrase.replace(/\s+/g," ").trim();
    let words = phrase.split(" ");
    let responseObject={
      feedback:[],
      input:{
        whole:undefined,
        structure:undefined,
        intro:undefined,
        core:undefined,
        clarifier:undefined,
        ending:undefined
      },
      alternatives:{
        intro:[],
        core:[],
        ending:[]
      },
      results:{},
      conflicts:[]
    };

    if(words.length === 1){//if the use is writing the first word ... do nothing
      return responseObject;
    }

    //*************************dar feedback después del punto.
    // if(words.length >= 2){ // gives feedback about es o son at the beginning of the sentence.
    //   if(words.length === 2){
    //     if(!(phrase.match(/^(?:[EÉ][szc]|[SZC](?:ou|[oóuú])(?:ni|nj|[n|ñ]))/))){
    //       responseObject.feedback.push("La hora siempre comienza con 'Es' ó 'Son'.");
    //       responseObject.alternatives={
    //         intro: ["Es", "Son"]
    //       }
    //     }
    //     responseObject.input ={...responseObject.input,
    //       intro:{
    //         phrase:words[0],
    //         index:[0,words[0].length]
    //       }
    //     }
        
    //   }





      // else if (words.length >= 3){
      //   if(!(phrase.match(/^[eé][szc]\sl[aá]/i) || phrase.match(/^[szc](?:ou|[oóuú])(?:ni|nj|[n|ñ])\sl[aá][szc]/i))){
      //     responseObject.feedback.push("La hora comienza con 'Es la' ó 'Son las' si no es mediodía, medianoche ó la frase (minutos) para (horas).");
      //     return responseObject;
      //   }
      // }
    // }

    

    
    
    // if(words.length === 2 && phrase.match(/.+\.$/)){
    //   responseObject.feedback.shift();
      
    //   if(words[0].match(/[eé][szc]$/i)){//es mediodía or es medianoche
    //     if(words[1].match(/m[eé]d(?:ll|[iyí])(?:ou|[oóuú])d(?:ll|[iyí])[aá]\.$/i)){
    //       responseObject.result = {
    //         type : 0,
    //         minutes:0,
    //         hours:12
    //       }
    //       return responseObject;
    //     }else if(words[1].match(/m[eé]d(?:ll|[iyí])[aá](?:ni|nj|[n|ñ])(?:ou|[oóuú])(?:qu|[cszkq])h[eé]\.$/i)){
    //       responseObject.result = {
    //         type : 0,
    //         minutes:0,
    //         hours:0
    //       };
    //       return responseObject;
    //     }
    //   }
    //   responseObject.feedback.push("La hora comienza con 'Es la' ó 'Son las' si no es mediodía, medianoche ó la frase (minutos) para (horas).");
    //   return responseObject;
    // }else{
    if(phrase.match(/.+\.$/)){
      let phraseParts =this.identifyPhraseParts(phrase);
      let structure = this.senseStructure(phraseParts);
      if(structure.find((object)=>object.name ==="undefined")){//checks for unidentified parts in the phrase
        return {
          action: "delete",
          feedback:"Èstas partes están de más.",
          object: ["undefined"],
          phraseStructure:structure
        }
      }
      let duplicated = null;
      Object.keys(phraseParts).forEach((key)=>{//checks for duplicated phrase parts and return alternatives.
        if(phraseParts[key]!== null && phraseParts[key].duplicated === true){
          duplicated = key;
        }
      });
      if(duplicated !== null){
        if(phraseParts[duplicated].position.length >3){
          return {action:"show", feedback : "Revisa la frase"};
        }else{
          return {
            action:"alternatives",
            feedback:"Éstas partes no pueden estar en la misma oración.",
            object:[duplicated],
            phraseStructure:structure
          }
        }
      }
      let structureValidation = this.IdentifyRightStructure(structure,phraseParts);
      if(structureValidation !== "ok"){
        return structureValidation;
      }else {
        console.log("phrase structure is correct.");
      }
      
      console.log(phrase);

      return 0;

      // console.log(responseObject);
      //**************************************** Test**********************************
      // if(phrase.match(/^[eé][szc]\sm[eé]d(?:ll|[iyí])(?:ou|[oóuú])\s?d(?:ll|[iyí])[aá]\.$/i)){
      //   responseObject.result = {
      //     type : 0,
      //     minutes:0,
      //     hours:12
      //   }
      //   return responseObject;
      // }else if(phrase.match(/^[eé][szc]\sm[eé]d(?:ll|[iyí])[aá]\s?(?:ni|nj|[n|ñ])(?:ou|[oóuú])(?:qu|[cszkq])h[eé]\.$/i)){
      //   responseObject.result = {
      //     type : 0,
      //     minutes:0,
      //     hours:0
      //   };
      //   return responseObject;
      // }

      let mediodia = /m[eé]d(?:ll|[iyí])(?:ou|[oóuú])\s?d(?:ll|[iyí])[aá]/id.exec(phrase);
      if(mediodia){
        responseObject.results = {
          type : 0,
          minutes:0,
          hours:12
        }
        // check if the core is unset
        if(responseObject.input.core === undefined){
          responseObject.input = {
            core: {
              phrase : mediodia[0],
              position:mediodia.indices[0] //positions was called index before
            }
          }
        }
      }
      
      let medianoche = /m[eé]d(?:ll|[iyí])[aá]\s?(?:ni|nj|[n|ñ])(?:ou|[oóuú])(?:qu|[cszkq])h[eé]/id.exec(phrase);
      if(medianoche){
        responseObject.results = {
          type : 0,
          minutes:0,
          hours:0
        };
        responseObject.input = {
          core: {
            phrase : medianoche[0],
            position:medianoche.indices[0] //positions was called index before
          }
        }
        return responseObject;
      }

      
       //**************************************** Test**********************************
      responseObject.results = {};
      
      
      
      // let introduction = /^(?:[eé][szc]|^[szc](?:ou|[oóuú])(?:ni|nj|[n|ñ]))(?:\sl[aá][szc]?)?/gid.exec(phrase);
      // if(introduction){
      //   responseObject.input ={...responseObject.input,
      //     intro:{
      //       phrase:phrase.slice(0,introduction[0].length),
      //       index:introduction.indices[0]
      //     }
      //   }
      // }else{

      // }




      if(phrase.match(/.+\.$/)){// checks if the phrase has a period at the end and the period of time like de la mañana, de la tarde o de la noche. 
        if(words.length === 1){
            return {feedback : "Revisa la frase", source:phrase};
        }
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
        }
        // else if(responseObject.input.core.phrase.match(/[eé]n\sp(?:ou|[oóuú])nt(?:ou|[oóuú])/i)){//en punto
        //   let hoursWritten =/(\b[A-zÀ-ú]*\b)\s[eé]n\sp(?:ou|[oóuú])nt(?:ou|[oóuú])$/id.exec(responseObject.input.core.phrase);
        //   if(hoursWritten === null) return {feedback : "Revisa la frase.", source:responseObject.input.core.phrase};
        //   let hours = this.identifyHours(hoursWritten[1],hoursWritten.indices[1],responseObject.input.core.index[0]);
        //   let intro = this.checkIntro(responseObject.input.intro.phrase,2,hours,responseObject.input.intro.index);
        //   responseObject.results = {...responseObject.results,
        //     type:0,
        //     mode:0,
        //     minutes:0,
        //     hours: hours,
        //     intro:intro
        //   }
        // }
        else if(responseObject.input.core.phrase.match(/(?<!tr[eé][iyí]nt[aá]|(?:qu|[cszkq])(?:ou|[oóuú])[aá]r[eé]nt[aá]|(?:qu|[cszkq])[iyí]n(?:qu|[cszkq])(?:ou|[oóuú])[eé]nt[aá])\s[iy]\s(?:\b[A-zÀ-ú]*\b(?:\s[iy]\s\b[A-zÀ-ú]*\b)?)/i)){//y
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
        }else if(responseObject.input.core.phrase.match(/m[eé]n(?:ou|[oóuú])[szc]/i)){//menos
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
    }else{// if the sentence do not ends with period.
     responseObject.feedback.push("Termina la oración con un punto.");//? necesary
     return {action:"show", feedback:"Termina la oración con un punto."}
    }




    if(responseObject.results){
      if(Object.values(responseObject.results).some((value)=>typeof value==="object")){
        return responseObject
      }
    }
    responseObject = this.periodHourCongruence(responseObject);
    return responseObject
  },
  IdentifyRightStructure(structure,phraseParts){
    let correctStructure = [];
    if(phraseParts.core === null){//chooses the correct structure according to the core.
      //ex. son las dos.
      correctStructure =[{name:"intro",mandatory:true}, {name:"number",mandatory:true},{name:"clarifier",mandatory:false},{name:"ending",mandatory:false}, {name:"point",mandatory:true}];
    }else{

      switch(phraseParts.core.type[0]){
        case 0:
          //ex. es mediodia/medianoche
          correctStructure = [{name:"intro",mandatory:true}, {name:"core",mandatory:true},{name:"point",mandatory:true}];
        break;
        case 1:
        case 2:
          console.log("structure 1 & 2")
          correctStructure = [{name:"intro",mandatory:true},{name:"number",mandatory:true},{name:"core",mandatory:true},{name:"number",mandatory:true},{name:"ending",mandatory:false},{name:"point",mandatory:true}]
        break;
        default:
        break;
      }
    }
    return compareStructure(structure,correctStructure);

    function compareStructure(actualStructure,correctStructure){
      let deleteParts = [];
      let switchParts = false;
      let missingParts = [];
      let groups=0;
      //finding grouping the parts that follow each other correctly.
      for(let correct=0, start= false; correct < correctStructure.length; correct++){
        for(let actual=0; actual<actualStructure.length;actual++){
          if(!(actualStructure[actual].found)){
            if(start===false){
              if(actualStructure[actual].name.includes(correctStructure[correct].name)){
                start=true;
              }
            }
            if(start===true){
              if(actualStructure[actual].name.includes(correctStructure[correct].name)){
                actualStructure[actual].found = true;
                actualStructure[actual].group=groups
                correct++;
              }else if(correctStructure[correct].mandatory===false){
                correct++;
                actual--;
              }else{
                start = false;
                groups++;
                correct=0;
                break;
              }
            }
          }
        }
      }
      //finding the largest group
      let currentLargestGroup={group:null,quantity:null};
      for(let counter=0, temporalCounter=0; counter<=groups;counter++){
        for(let actualCounter=0;actualCounter<actualStructure.length;actualCounter++){
          let part=actualStructure[actualCounter];
            if(!(typeof part.group)){
              temporalCounter=0;
            break;
            }else if(part.group === counter){
              temporalCounter++;
              if(temporalCounter>currentLargestGroup.quantity){
                currentLargestGroup.group=counter;
                currentLargestGroup.quantity=temporalCounter;
              }
            }else{
              temporalCounter=0;
            }
            
        };
      }
      //deleting the smaller groups
      actualStructure.forEach((actualPart)=>{
        if(typeof actualPart.group !== undefined){
          if(actualPart.group!==currentLargestGroup.group){
            delete actualPart.group;
            delete actualPart.found;
          }
        } 
      });
      //validating the largest group against the correct structure or deleting the group properties if the largest group has only one word
      if(currentLargestGroup.quantity > 1){
        correctStructure.forEach((part)=>{
          if(!(part.found)){
            actualStructure.forEach((actualPart)=>{
              if(actualPart.group === currentLargestGroup.group){ 
                if(!(part.found === true)){
                  if(actualPart.name.includes(part.name)){
                    actualPart.found = true;
                    part.found = true;
                  }
                }
              }
            });
          }
        });
      }else{
        actualStructure.forEach((part)=>{
          delete part.group
        });
      }
      // finding correct structure parts or the rest of them.
      correctStructure.forEach((part)=>{
        actualStructure.forEach((actualPart)=>{
          if(!(part.found === true)){
            if(actualPart.name.includes(part.name)){
              actualPart.found = true;
              part.found = true;
            }
          }
        });
        if(!(part.found)){
          part.found = false;
        }
      });
      // checking for missing parts and deleting not mandatory-not found parts.
      correctStructure.forEach((part,index)=>{
        if(part.mandatory === true && part.found === false){
          return {
            action:"missing",
            feedback: "Faltan partes",
            object: missingParts,
          }
        }else if(part.mandatory === false && part.found === false){
          correctStructure.splice(index,1);
        }
      });
      // checking for extra parts
      actualStructure.forEach((actualPart)=>{
        if(!(actualPart.found)){
          deleteParts.push(actualPart.name);
        }
      });
      if(deleteParts.length>0){
        return{ 
          action:"delete",
          object:deleteParts,
          phraseStructure:structure
        }
      }
      //checking for the correct structure order 
      correctStructure.forEach((part,index)=>{
        if(actualStructure[index].name.includes(part.name)){
          actualStructure[index].validation = true;
        }else{
          let switchIndex = correctStructure.findIndex((innerPart)=>actualStructure[index].name.includes(innerPart.name))
          actualStructure[index].correctPosition = switchIndex;
          switchParts = true;
        }
      });
      if(switchParts === true){
        return {
          action:"switch",
          feedback: "Cambia el orden.",
          object: actualStructure,
        }
      }
        return "ok";
    }
    
    let order = ["intro","number","core","number","clarifier","ending","point"];


    if(phraseParts.core === null){
      let validStructure = [{mandatory:true,part:"intro"},{mandatory:true,part:"number"},{mandatory:false,part:"clarifier"},{mandatory:false,part:"ending"}];

    }else{
      if(phraseParts.core.type===0){

      }
    }
    //nota mental
    /*
    inte core = [intro, number, optional clarifier, optional ending];

    core type = 0, mode = 0;

    
    
    */
    
  },
  identifyPhraseParts(phrase){
    let returnObject = {
      wholePhrase:{
        phrase:[phrase],
        position:[[0,phrase.length]]
      },
      intro:{
        phrase : [],
        position: [],
        duplicated:false
      },
      clarifier:{
        phrase:[],
        position:[],
        duplicated:false
      },
      ending:{
        phrase : [],
        position: [],
        duplicated:false
      },
      core:{
        phrase: [],
        position: [],
        type:[],
        mode:[],
        hours:[],
        minutes:[],
        duplicated:false
      },
      point:{
        position:[]
      },
    }
    //intro
    let introIdentifier = /((?:\b[eé][szc]|\b[szc](?:ou|[oóuú])(?:ni|nj|[n|ñ]))(?:\sl[aá][szc]?\b)?)/gid;
    let intro = introIdentifier.exec(phrase);
    while(intro !== null) {
      returnObject.intro.phrase.push(intro[1]);
      returnObject.intro.position.push(intro.indices[1]);
      intro = introIdentifier.exec(phrase);
    }
    if(returnObject.intro.phrase.length === 0){
      returnObject.intro = null;
    }else if(returnObject.intro.phrase.length >= 2){
      returnObject.intro.duplicated = true;
    }
    //clarifier
    let clarifierIdentifier = /(?:^|\s)([eé]n\sp(?:ou|[oóuú])nt(?:ou|[oóuú]))(?:\.|\s)/gid;
    let clarifier = clarifierIdentifier.exec(phrase);
    while(clarifier !== null) {
      returnObject.clarifier.phrase.push(clarifier[1]);
      returnObject.clarifier.position.push(clarifier.indices[1])
      clarifier = clarifierIdentifier.exec(phrase);
    }
    if(returnObject.clarifier.phrase.length === 0){
      returnObject.clarifier = null;
    }else if(returnObject.clarifier.phrase.length >=2){
      returnObject.clarifier.duplicated = true;
    }
    
    //ending
    let endingIdentifier = /(?:^|\s)((?:d[eé]\sl[aá]\s\b[A-zÀ-ú]*\b))/gid;
    let ending = endingIdentifier.exec(phrase);
    while(ending !== null) {
      returnObject.ending.phrase.push(ending[1]);
      returnObject.ending.position.push(ending.indices[1]);
      ending = endingIdentifier.exec(phrase);
    }
    if(returnObject.ending.phrase.length === 0){
      returnObject.ending = null;
    }else if(returnObject.ending.phrase.length >=2){
      returnObject.ending.duplicated = true;
    }
    //core
    let coreIdentifiers = [
      {identifier : /\bm[eé]d(?:ll|[iyí])(?:ou|[oóuú])\s?d(?:ll|[iyí])[aá]\b/gid, type:0},
      {identifier :/\bm[eé]d(?:ll|[iyí])[aá]\s?(?:ni|nj|[n|ñ])(?:ou|[oóuú])(?:qu|[cszkq])h[eé]\b/gid, type:0},
      {identifier :/(?<!tr[eé][iyí]nt[aá]|(?:qu|[cszkq])(?:ou|[oóuú])[aá]r[eé]nt[aá]|(?:qu|[cszkq])[iyí]n(?:qu|[cszkq])(?:ou|[oóuú])[eé]nt[aá])\s[iy]\s/gid,type:1},
      {identifier :/\bp[aá]r[aá]\sl[aá][cszkq]?\b/gid,type:2, mode: 0},
      {identifier :/\bm[eé]n(?:ou|[oóuú])[szc]\b/gid, type:2, mode: 1}
    ];
    coreIdentifiers.forEach((identifier,index)=>{
      let coreTemporal = identifier.identifier.exec(phrase);
      while(coreTemporal !== null) {
        returnObject.core.phrase.push(coreTemporal[0]);
        returnObject.core.position.push(coreTemporal.indices[0]);
        returnObject.core.type.push(identifier.type);
        returnObject.core.mode.push((identifier.mode)?identifier.mode:0);
        coreTemporal = identifier.identifier.exec(phrase);
      }
    })
    if(returnObject.core.phrase.length === 0){
      returnObject.core = null;
    }else if(returnObject.core.phrase.length >=2){
      returnObject.core.duplicated = true;
    }
    //numbers
    let numbersTemporal = this.identifyNumbers(phrase);
    if(numbersTemporal !== null){
      let counter = 0;
      numbersTemporal.phrase.forEach((phrase,index)=>{
        returnObject[`number${counter}`] = {
          phrase: [],
          position:[],
          value:[]
        }
        returnObject[`number${counter}`].phrase.push(phrase);
        returnObject[`number${counter}`].position.push(numbersTemporal.position[index]);
        returnObject[`number${counter}`].value.push(numbersTemporal.value[index]);
        counter++
      });
    }
    
    //point
    let pointTemporal = /\./d.exec(phrase)
    returnObject.point.position=[pointTemporal.indices[0]];
    returnObject.point.phrase = pointTemporal[0];
    return returnObject;
  },
  senseStructure(phraseParts){
    let structure=[];
    let actualPosition=0;
    do{
      let found = false;
      let actualPositionUpdated = actualPosition;
      Object.keys(phraseParts).forEach((key)=>{
        if(phraseParts[key]!== null && key !== "wholePhrase"){
          phraseParts[key].position.forEach((innerPosition,index)=>{
            if(innerPosition[0]===actualPositionUpdated){
              found=true;
              structure.push({
                name:key,
                position:innerPosition,
                phrase:phraseParts[key].phrase[index]
              });
            }
          })
          
        }
      });
      if(!(found)){
        let gapPosition= findGap(phraseParts,actualPosition);
        let phrase = phraseParts.wholePhrase.phrase[0].slice(...gapPosition);
        if(phrase.match(/^\s$/)){
          actualPosition++;
        }else{
          if(phrase.match(/^\s/)){
            gapPosition[0] = gapPosition[0]+1;
          }
          if(phrase.match(/\s$/)){
            gapPosition[1] = gapPosition[1]-1;
          }
          phrase = phrase.trim();
          structure.push({
            name:"undefined",
            position:gapPosition,
            phrase: phrase
          })
          actualPosition=structure[structure.length-1].position[1];
        }  
      }else{
        actualPosition=structure[structure.length-1].position[1];
      }
    }while(structure[structure.length-1].position[1]!==phraseParts.wholePhrase.position[0][1]);
    return structure;
    
    function findGap(phraseParts,initialPosition){
      let lowerPosition=phraseParts.wholePhrase.position[0][1];
      Object.keys(phraseParts).forEach((key)=>{
        if(key !== "wholePhrase" && phraseParts[key]!== null){
          phraseParts[key].position.forEach((innerPosition)=>{
            if(innerPosition[0]>=initialPosition && innerPosition[0]<lowerPosition){
              lowerPosition = innerPosition[0];
             }
          });
        }
      });
      return [initialPosition,lowerPosition];
    }
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
  identifyNumbers(phrasePart){
    if(phrasePart===""){return null};
    let returnObject={
      phrase:[],
      position:[],
      value:[]
    }
    
    //find all unit numbers
    let regExUnder10 = [...this.numerosRegEx[0].slice(0,10)];
    let numbersUnder10 = findNumbers(regExUnder10,(index)=>index);
    
    //find numbers over 10 but under 21
    let regEx1020 = [...this.numerosRegEx[0].slice(10,20).concat(this.numerosRegEx[2])];
    let numbers1020 = findNumbers(regEx1020,(index)=>{
      if(index === 10){
        return 15;
      }else if(index === 11){
        return 30;
      }else{
        return index+10;
      }
    });
    
    //find numbers over 21 but under 60
    let regEx2160 = [...this.numerosRegEx[1]];
    let numbers2160 = findNumbers(regEx2160,(index)=>index*10);
    
    if(numbers2160.length>0){
      regExUnder10 = [...this.numerosRegEx[0].slice(0,10)];
      mergeAdjacentNumbers(numbers2160,numbersUnder10);
    }

    let resultsArray = numbersUnder10.concat(numbers1020.concat(numbers2160));
    resultsArray = resultsArray.sort((a,b)=>a.position[0]-b.position[0]);
    resultsArray.forEach((result)=>{
      returnObject.phrase.push(phrasePart.slice(...result.position));
      returnObject.position.push(result.position);
      returnObject.value.push(result.value);
    })
    if(returnObject.phrase.length === 0){
      return null
    }else{
      return returnObject
    }
    
    
    function mergeAdjacentNumbers(decimals,units){
      let deleteDecimalIndex = []
      decimals.forEach((decimal,index)=>{
        if(decimal.value === 20){
          let phraseAfter=phrasePart.slice(decimal.position[1],phrasePart.length);
          let phraseAfterInfo =  /^[A-zÀ-ú]*\b/id.exec(phraseAfter); 
          if(phraseAfterInfo!==null){
            let foundNumber = regExUnder10.findIndex((number)=>phraseAfterInfo[0].match(number));
            if(foundNumber!==-1){
              decimal.position = [decimal.position[0],decimal.position[1]+phraseAfterInfo.indices[0][1]];
              decimal.value = decimal.value + foundNumber;
            }else{
              deleteDecimalIndex.push(index);
            }
          }else{
            let closestUnit = units.find((unit)=> decimal.position[1] < unit.position[0]);
            if(closestUnit!==undefined){
              let phraseInMiddle=phrasePart.slice(decimal.position[1],closestUnit.position[0]);
              if(phraseInMiddle.match(/^\s?[iyí]?\s$/)){
                decimal.position = [decimal.position[0],closestUnit.position[1]];
                decimal.value = decimal.value + closestUnit.value;
                let deteteUnitIndex = units.findIndex((unit)=>unit.position[0]===closestUnit.position[0]);
                units.splice(deteteUnitIndex,1);
              }
            }
          } 
        }else{
          let closestUnit = units.find((unit)=> decimal.position[1] < unit.position[0]);
          if(closestUnit!==undefined){
            let phraseInMiddle=phrasePart.slice(decimal.position[1],closestUnit.position[0]);
            if(phraseInMiddle.match(/^\s?[iyí]?\s$/)){
              decimal.position = [decimal.position[0],closestUnit.position[1]];
              decimal.value = decimal.value + closestUnit.value;
              let deteteindex = units.findIndex((unit)=>unit.position[0]===closestUnit.position[0]);
              units.splice(deteteindex,1);
            }
          }
        }
        
      });
      if(deleteDecimalIndex.length>1){
        deleteDecimalIndex.sort((a,b)=>b-a);
        deleteDecimalIndex.forEach((index)=>{
          decimals.splice(index,1);
        });
      }else if(deleteDecimalIndex.length===1){
        decimals.splice(deleteDecimalIndex[0],1);
      }
    }
    function findNumbers(regex,valueFromIndex){
      let numbers = [];
      let foundNumber;
      while(foundNumber!==-1){
        foundNumber = regex.findIndex((number)=>phrasePart.match(number));
        if(foundNumber!==-1){
          let foundNumberInfo = regex[foundNumber].exec(phrasePart);
          let lastIndexNumberUnder10=0;
          while(foundNumberInfo!==null){
            numbers.push({value: valueFromIndex(foundNumber),position:foundNumberInfo.indices[0]});
            lastIndexNumberUnder10=foundNumberInfo.indices[0][1];
            regex[foundNumber].lastIndex=lastIndexNumberUnder10;
            foundNumberInfo = regex[foundNumber].exec(phrasePart);
            if(foundNumberInfo === null){
              regex[foundNumber]=/^$/
            }
          }
        }
      }
      numbers.sort((a,b)=>a.position[0]-b.position[0]);
      return numbers;
    }
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
    [/\b(?:qu|[cszkq])[eé]r(?:ou|[oóuú])\b/gid,/\b(?:ou|[oóuú])n(?:ou|[oóuú]|[aá])\b/gid,/\bd(?:ou|[oóuú])[szc]\b/gid,/\btr[eé][szc]\b/gid,/\b(?:qu|[cszkq])(?:ou|[oóuú])[aá]tr(?:ou|[oóuú])\b/gid,/\b(?:qu|[cszkq])[iyí]n(?:qu|[cszkq])(?:ou|[oóuú])\b/gid,/\b[szc][eé][iyí][szc]\b/gid,/\b[szc][iyí][eé]t[eé]\b/gid,/\b(?:ou|[oóuú])(?:qu|[cszkq])h(?:ou|[oóuú])\b/gid,/\bn(?:ou|[oóuú])[eé][vb][eé]\b/gid,/\bd[iyí][eé][szc]\b/gid,/\b(?:ou|[oóuú])nd?(?:qu|[cszkq])[eé]\b/gid,/\bd(?:ou|[oóuú])(?:qu|[cszkq])[eé]\b/gid,/\btr[eé](?:qu|[cszkq])[eé]\b/gid,/\b(?:qu|[cszkq])[aá]t(?:ou|[oóuú])r(?:qu|[cszkq])[eé]\b/gid,/\b(?:qu|[cszkq])(?:ou|[oóuú])?[iyí]n(?:qu|[cszkq])[eé]\b/gid,/\bd[iyí][eé](?:qu|[cszkq])[iyí][szc][eé][iyí][szc]\b/gid,/\bd[iyí][eé](?:qu|[cszkq])[iyí][szc][iyí][eé]t[eé]\b/gid,/\bd[iyí][eé](?:qu|[cszkq])[iyí](?:ou|[oóuú])(?:qu|[cszkq])h(?:ou|[oóuú])\b/gid,/\bd[iyí][eé](?:qu|[cszkq])[iyí]n(?:ou|[oóuú])[eé][vb][eé]\b/gid],
    [/^$/,/^$/,/\b[vb][eé][iyí]?nt[iyíeé]/gid,/\btr[eé][iyí]nt[aá]\b/gid,/\b(?:qu|[cszkq])(?:ou|[oóuú])[aá]r[eé]nt[aá]\b/gid,/\b(?:qu|[cszkq])[iyí]n(?:qu|[cszkq])(?:ou|[oóuú])[eé]nt[aá]\b/gid],
    [/\b[cszkq](?:ou|[oóuú])[aá]rt(?:ou|[oóuú])\b/gid,/\bm[eé]d[iyí][aá]\b/gid]
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