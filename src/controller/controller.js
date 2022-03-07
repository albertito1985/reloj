export let reloj = {
    hours:0,
    minutes:0,
    period: "AM",
    moving:undefined,
    states:{
        minutes:360,
        hours:360,
    },
    calculatePeriod(){
      if((reloj.hours === 12 || reloj.hours === 0)&&(reloj.minutes ===0)){
        return "M";
      }else{
        return this.states.period;
      }
    },
    change(e,handle,clockCenter){
        let degrees = this.calculateDegrees(e,clockCenter)
        if(handle === "minutero"){
            this.moving = "minutero";
            return this.handle.minutero.move(degrees);
        }else{
            this.moving = "horario";
            return this.handle.horario.move(degrees);
        }
    },
    calculateDegrees(e,clockCenter){
        let coordinates = {
          x:(e.clientX<clockCenter.x)?e.clientX-clockCenter.x:(e.clientX === clockCenter.x)? 0 :e.clientX - clockCenter.x,
          y:(e.clientY<clockCenter.y)?clockCenter.y - e.clientY:(e.clientY === 0)?0:(e.clientY- clockCenter.y)*(-1),
        }
        let angleInQuadrant = (Math.atan(Math.abs(coordinates.y)/Math.abs(coordinates.x)))*(180/Math.PI);
        return this.degreesCenteredIn0(coordinates.x, coordinates.y, angleInQuadrant);
    },
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
    },
    pointingNumber(degrees, grades){
        let rest = degrees % grades;
        return (degrees- rest)/grades;
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
            let minutes = reloj.pointingNumber(minuteDegrees,6);
            
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
                    period:period,
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