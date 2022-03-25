export let es = {
    //falta agregar el type
    phraseFinder(hours, minutes, mode, ending=true, forceType=false){
        let phraseNumber= [forceType] || es.choosePhrase(minutes,mode);
        return es.generatePhrases(hours,minutes,phraseNumber,mode,ending);
    },
    generatePhrases(hours,minutes,phraseNumber,mode,ending){
            let returnArray = [];
            phraseNumber.forEach((phrase)=>{
                returnArray = returnArray.concat(es.phrases[phrase](hours,minutes,mode,ending));
            });
        return returnArray;
    },
    choosePhrase:(minutes,mode)=>{
        if(minutes === 0 || mode === 4){
            return [0];
        }else {
            if(mode === 2 ){
                return [1];
            }else if(minutes<35){
                return [1];
            }else if(minutes >=35 && minutes <= 40){
                return [1,2];
            }else{
                return [2];
            }
        }
    },
    phrases : [
        (hours,minutes,mode,ending)=>{
            //solo en punto
            if(mode !== 2 ){
                if(hours === 12 && minutes === 0){
                    return [{type:0,phrase: "Es mediodía."}]
                }else if(hours === 0 && minutes === 0){
                    return [{type:0,phrase: "Es medianoche."}]
                }
            }
            let endings=es.endings(hours,mode,ending);
            hours = es.modeAdaptation(hours,mode);
            let hoursW = es.numberFinder(hours);
            let returnArray = endings.map((ending,index)=>{
                return {type:0,phrase: (hoursW === "uno")? `Es la una${(mode !== 4)?" en punto":""}${ending}`: `Son las ${hoursW}${(mode !== 4)?" en punto":""}${ending}`};
            });
            return returnArray;
            
        },
        (hours, minutes,mode,ending)=>{
            //1< min <39
            let endings = es.endings(hours,mode,ending);
            hours = es.modeAdaptation(hours,mode);
            let hoursW = es.hourExceptions(es.numberFinder(hours),mode);
            let minutesW = es.minuteExceptions(es.numberFinder(minutes));
            
            let returnArray = endings.map((ending,index)=>{
                return{type:1,phrase:(hoursW === "uno")?`Es la una y ${minutesW} ${ending}`: `Son las ${hoursW} y ${minutesW}${ending}`};
            });
            return returnArray;
        },
        (hours,minutes,mode,ending)=>{
            //40<min <59
            minutes = 60-minutes;
            let endings = es.endings(hours+1,mode,ending);
            hours = es.modeAdaptation(hours+1,mode);
            let hoursW = es.hourExceptions(es.numberFinder(hours));
            let minutesW = es.minuteExceptions(es.numberFinder(minutes));
            
            let returnArray = endings.map((ending,index)=>{
                if(mode === 0){
                    return {type:2,phrase:(hoursW === "uno")?`Son ${minutesW} para la una ${ending}`:`Son ${minutesW} para las ${hoursW}${ending}`}
                }else{
                    return {type:2,phrase:(hoursW === "uno")?`Son la una menos ${minutesW} ${ending}`: `Son las ${hoursW} menos ${minutesW}${ending}`}
                }
            });
            return returnArray;
        }
    ],
    modeAdaptation(hours,mode){
        if(mode ===2){
            
        }else{
            if(hours>12){
                hours -=12
            }
        }
        return hours;
    },
    endings:(hours,mode,ending)=>{
        if(ending === false){
            return ["."];
        }else if(ending === 0){
            return [" de la mañana."];
        }else if(ending === 1){
            return [" de la tarde."];
        }else if(ending === 2){
            return [" de la noche."];
        }
        if(mode === 3){
            if(hours<13){
                return [" AM."];
            }else{
                return [" PM."];
            }
        }else if(mode === 2){
            return ["."];
        }else{
            if (hours === 0){
                return  [" de la noche."]
            }else if(hours <= 12){
                return  [" de la mañana."]
            }else if(hours> 12 && hours<13){
                return  [" de la mañana.", " de la tarde."];
            }else if(hours < 19){
                return [" de la tarde."]
            }else if(hours === 19){
                return [" de la tarde.", " de la noche."]
            }else{
                return [" de la noche."]
            }
        }
    },
    minuteExceptions(number){
        if(number === "quince"){
            return "cuarto";
        }else if(number === "treinta"){
            return "media";
        }else{
            return number;
        }
    },
    hourExceptions(number,mode){
        if(number === "cero" && mode === 2){

        }else if(number === "veinticuatro" || number === "cero"){
            return "doce";
        }
        return number;
    },
    numberFinder: (number)=>{
        number = `${number}`;
        if(number<20){
            if(number.length === 2){
                return es.numbers[number[0]][number[1]];
            }else{
                return es.numbers[0][number[0]];
            }
        }else{
            if(number[1]=== "0"){
                return es.numbers[number[0]][0];
            }else{
                return es.numbers[ number[0] ][1]( es.numbers[0][number[1]] );
            }
        }
    },
    numbers:[
        ["cero","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve"],
        ["diez","once","doce","trece","catorce","quince","dieciseis","diecisiete","dieciocho","diecinueve"],
        ["veinte",(digito)=>`veinti${digito}`],
        ["treinta",(digito)=>`treinta y ${digito}`],
        ["cuarenta",(digito)=>`cuarenta y ${digito}`],
        ["cincuenta",(digito)=>`cincuenta y ${digito}`]
    ]
}