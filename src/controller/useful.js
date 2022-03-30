HTMLCollection.prototype.forEach = function(func){
   let CollectionArray =  Array.prototype.slice.call(this);
   CollectionArray.forEach(func);
   };