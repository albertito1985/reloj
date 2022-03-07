export let es = {
    phraseFinder(hours, minutes, mode){
        let phraseNumber = undefined;
        if(hours === 12 && minutes === 0){
            return [<p key={"mediodia"}><span className="phrasePart phrase0">Es mediodía.</span></p>];
        }else if(hours === 0 && minutes === 0){
            return [<p key={"medianoche"}><span className="phrasePart phrase0">Es medianoche.</span></p>];
        }else{
            if(mode === 2){
                return es.generatePhrases(hours,minutes,0,mode);
            }else{
                phraseNumber = es.choosePhrase(minutes);
                return es.generatePhrases(hours,minutes,phraseNumber,mode); 
            }
        }
    },

    generatePhrases(hours,minutes,phraseNumber,mode){
            let returnArray = [];
            phraseNumber.forEach((phrase,phraseIndex)=>{
                returnArray = returnArray.concat(es.phrases[phrase](hours,minutes,mode));
            });
        return returnArray;
    },
    choosePhrase:(minutes)=>{
        if(minutes === 0){
            return [0];
        }else if(minutes<35){
            return [1];
        }else if(minutes >=35 && minutes <= 40){
            return [1,2];
        }else{
            return [2];
        }
    },
    phrases : [
        (hours,minutes,mode)=>{
            //solo en punto
            let endings = es.endings(hours,mode);
            hours = es.modeAdaptation(hours,mode);
            let hoursW = es.numberFinder(hours);
            let returnArray = endings.map((ending,index)=>{
                return <p key={`0mode${mode}${index}`}><span className="phrasePart phrase0">{(hoursW === "uno")? `Es la una en punto`: `Son las ${hoursW} en punto`}{ending}</span></p>;
            });
            return returnArray;
            
        },
        (hours, minutes,mode)=>{
            //1< min <39
            let endings = es.endings(hours,mode);
            hours = es.modeAdaptation(hours,mode);
            let hoursW = es.hourExceptions(es.numberFinder(hours));
            let minutesW = es.minuteExceptions(es.numberFinder(minutes));
            
            let returnArray = endings.map((ending,index)=>{
                return <p key={`1mode${mode}${index}`}><span className="phrasePart phrase1">{(hoursW === "uno")?`Es la una y ${minutesW}`: `Son las ${hoursW} y ${minutesW}`}{ending}</span></p>;
            });
            return returnArray;
        },
        (hours,minutes,mode)=>{
            //40<min <59
            minutes = 60-minutes;
            let endings = es.endings(hours+1,mode);
            hours = es.modeAdaptation(hours+1,mode);
            // hours =(hours+1 === 25)?1:hours+1;
            let hoursW = es.hourExceptions(es.numberFinder(hours));
            let minutesW = es.minuteExceptions(es.numberFinder(minutes));
            
            let returnArray = endings.map((ending,index)=>{
                // console.log(ending.props["data-period"]);
                if(mode === 0){
                    return <p key={`2mode${mode}${index}`}><span className="phrasePart phrase2">{`Son ${minutesW} para `}{(hoursW === "uno")?"la una":`las ${hoursW}`}{ending}</span></p>;
                }else{
                    return <p key={`2mode${mode}${index}`}><span className="phrasePart phrase2">{(hoursW === "uno")?`Son la una menos ${minutesW}`: `Son las ${hoursW} menos ${minutesW}`}{ending}</span></p>;
                }
            });
            return returnArray;
        }
    ],
    modeAdaptation(hours,mode){
        if(mode !==2){
            if(hours>12){
                hours -=12
            }
        }
        return hours;
    },
    endings:(hours,mode)=>{
        if(mode === 3){
            if(hours<13){
                return ["AM"];
            }else{
                return ["PM"];
            }
        }else if(mode === 2){
            return null;
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
    hourExceptions(number){
        if(number === "veinticuatro" || number === "cero"){
            return "doce";
        }
        return number;
    },
    numberFinder: (number)=>{
        number = `${number}`;
        if(number<20){
            if(number.length === 2){
                return es.numbers[number[0]][number[1]] //falla aquí
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