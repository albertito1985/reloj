export let es = {
    phraseFinder(hours, minutes){
        
        let returnArray = [];
        if(minutes === 0){
            return es.phrases[0](hours);
        }
        let hoursW = this.numberFinder(hours);
        let minutesW = es.numberFinder(minutes);
        returnArray = es.phrases[1](hoursW, minutesW);
        if(minutes < 40){
            if(minutes === 15){
                returnArray.push([es.phrases[1](hoursW, "cuarto")]);
            }else if(minutes === 30){
                returnArray.push([es.phrases[1](hoursW, "media")]);
            }
        }else if(minutes >= 40){
            let restMinutes = 60-minutes;
            let minutesW = es.numberFinder(minutes)
            let restMinutesW = es.numberFinder(restMinutes);
            if(minutes === 45){
                returnArray.push(es.phrases[40](hoursW, "cuarto"));
            }
            returnArray.push([es.phrases[40](hoursW, restMinutesW)]);
        }
        return returnArray;
    },
    phrases : {
        0 : (hours)=>{
            //solo en punto
            return [(hours === 1)? `Es la una en punto.`: `Son las ${hours} en punto.`];   
        },
        1: (hours, minutes)=>{
            //1< min <39
            return [(hours === "uno")?`Es la una y ${minutes}.`: `Son las ${hours} y ${minutes}.`];
        },
        // 15: (hours)=>{
        //     //solo hora y cuarto
        //     return [(hours === 1)? `Es la una y cuarto.`: `Son las ${hours} y cuarto.`];
        // },
        // 30: (hours)=>{
        //     //solo hora y media
        //     return [(hours === 1)?`Es la una y media.`: `Son las ${hours} y media.`];
        // },
        40:(hours,minutes)=>{
            //solo hora y cuarenta
            return [(hours === "uno")?`Son ${minutes} para la una.`: `Son ${minutes} para las ${hours}.`,
                (hours === "uno")?`Son la una menos ${minutes}.`: `Son las ${hours} menos ${minutes}.`,];
        },
    },
    numberFinder: (number)=>{
        number = `${number}`;
        if(number<20){
            if(number.length === 2){
                return es.numbers[number[0]][number[1]]
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
        ["","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve"],
        ["diez","once","doce","trece","catorce","quince","dieciseis","diecisiete","dieciocho","diecinueve"],
        ["veinte",(digito)=>`veinti${digito}`],
        ["treinta",(digito)=>`treinta y ${digito}`],
        ["cuarenta",(digito)=>`cuarenta y ${digito}`],
        ["cincuenta",(digito)=>`cincuenta y ${digito}`]
    ]
}