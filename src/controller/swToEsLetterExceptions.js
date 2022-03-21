export let language = {
    stringToRegEx(string){
        let stringArray= string.split("");;
        let letterQueries = ["c|k|qu|q","s|z","v|b","a|á","e|é","i|y|í","o|ó|u|ú","n|ñ"];
        let replacement= ["(?:qu|[cszkq])","[szc]","[vb]","[aá]","[eé]","(?:ll|[iyí])","(?:ou|[oóuú])","(?:ni|nj|[n|ñ])"];
        
        letterQueries.forEach((letterQuery,replacementIndex)=>{
            stringArray.forEach((letter,index)=>{
                
                if(letter[0] === " "){
                    stringArray[index] = "\\s";
                }else if(!(letter[0] === "[" || letter[0] === "(" || letter[0] === "\\")){
                    let regEx = new RegExp(letterQuery,"i");
                    if(regEx.test(letter)){
                        stringArray[index] = replacement[replacementIndex];
                    }
                }
            })
        });
        return stringArray.join("");
      },
}