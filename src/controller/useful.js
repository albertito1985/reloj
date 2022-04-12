//allows using the forEach statement directly on a HTMLCollection element
HTMLCollection.prototype.forEach = function(func){
   let CollectionArray =  Array.prototype.slice.call(this);
   CollectionArray.forEach(func);
   };

//creates a countdowm to breake an infinite loop.
export class EndALoop{
   constructor(loopsQuantity){
      this.loops = loopsQuantity;
   };
   counter=0;
   count(){
         if(this.counter >= this.loops){
            console.log("EndALoop stop!")
            return false
         }else {
            this.counter++;
            return true
         }
      }
   }

 