getData("/objects/?query=jsonform")
.then(response => response.json())
.then(data => {
    var obj={};
    var wrapper = document.getElementById("tab");
    var myHTML = "";
    data.results.forEach(element => {
      
        if (!!element.content.cordraSchema ) {
            if(!obj[element.content.category]){
                obj[element.content.category] = new Array();
            }
            obj[element.content.category].push(element.content.name+"/"+element.content.alternateName+"/"+element.content.cordraSchema);

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
  