

export function random(len:number){ 
   let options="ncidsbvdflmsacjvonownqnnvnk"; 
   let length=options.length; 
   let res=""; 
   for(let i=0;i<len;i++){ 
    res+=options[Math.floor((Math.random()*length))]; 
   } 
   return res
}