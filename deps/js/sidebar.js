var sidebar_url=[];
getData("/objects/?query=jsonform")
.then(response => response.json())
.then(data => {
    var obj={};
    var wrapper = document.getElementById("tab");
    data.results.forEach(element => {
        if (!!element.content.cordraSchema ) {
            if(!!Array.isArray(element.content.category)){
                element.content.category.forEach(elmt =>{
                    if(!obj[elmt]){
                        obj[elmt] = new Array();
                    }
                    obj[elmt].push(element.content.name+"/"+element.content.alternateName+"/"+element.content.cordraSchema);
                });
            }else{
                if(!obj[element.content.category]){
                    obj[element.content.category] = new Array();
                }
                obj[element.content.category].push(element.content.name+"/"+element.content.alternateName+"/"+element.content.cordraSchema);
            }    
        }
    });
    var myHTML="";
    for (const prop in obj) { 
        myHTML+="<li>"+prop+"</li><ul class='nav'>";
        obj[prop].forEach(elmt=>{
            data=elmt.split("/");
            myHTML+="<li><a href='#' onclick=openContentElmt('" + encodeURIComponent(elmt)+ "') >" + data[0] + "</a></li>";
        });
            
        myHTML+="</ul>";
    }
    wrapper.innerHTML = myHTML;
});
  