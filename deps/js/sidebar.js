
function secondaryFunction(first){
    var second = document.getElementById("secondary_key").value;
    localStorage.setItem("primary_filter", first);
    localStorage.setItem("secondary_filter", second);
    sidebarF(first,second);
}

function sidebarF(primaryV, secondary){
   var filter ="";
   var primary_S =  localStorage.getItem("primary_filter");
   var secondary_S = localStorage.getItem("secondary_filter");
    if(primaryV){
        filter+=" AND /filterPrimary/_:"+primaryV;
    }else if(primary_S){
        filter+=" AND /filterPrimary/_:"+primary_S;
    }
    if(secondary){
        filter+=" AND /filterSecondary/_:"+secondary;
    }else if(secondary_S){
        filter+=" AND /filterSecondary/_:"+secondary_S;
    }
    
getData("/objects/?query=type:Form"+filter)
.then(response => response.json())
.then(data => {
    var obj={};
    var primary = new Set();
    var primary_select="";
    var wrapper = document.getElementById("tab");
    var primaryWrapper = document.getElementById("primary_select");
    primary_select+="<select id='primary_key' class='form-select select_class' onchange=primaryFunction()> ";
    primary_select+="<option value=''selected='selected'>Primary Filter</option>";
    data.results.forEach(element => {
        if (!!element.content.cordraSchema ) {
            if (!!element.content.filterPrimary) {
                // id = @id, mode = list, 
                element.content.filterPrimary.forEach(value => {
                    primary.add(value);
                });
            } 
            if (!!Array.isArray(element.content.category)) {
                element.content.category.forEach(elmt => {
                    if(!obj[elmt]){
                        obj[elmt] = new Array();
                    }
                    obj[elmt].push(element.content.name+":"+element.content['@id']);
                });
            }else{
                if(!obj[element.content.category]){
                    obj[element.content.category] = new Array();
                }
                obj[element.content.category].push(element.content.name+":"+element.content['@id']);
            }       
        }
    });
    for (let item of primary.values()){
        if(item===primaryV || item===primary_S){ 
            primary_select+="<option value='"+item+"' selected>"+item+"</option>";
        }
        else{
            primary_select+="<option value='"+item+"'>"+item+"</option>";
        }  
    }
    primary_select+="</select>";
    var myHTML="";
    for (const prop in obj) { 
        myHTML += "<h5 class='sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted'>" +
            "<span>"+prop + "</span></h5><ul class='nav flex-column'>";
        obj[prop].forEach(elmt=>{
            data = elmt.split(":");
            myHTML+="<li class='nav-item'><a class='nav-link' href='#' onclick=openContentElmt('" + encodeURIComponent(data[1])+ "') >" + data[0] + "</a></li>";
        });
            
        myHTML+="</ul>";
    }
    wrapper.innerHTML = myHTML;
    primaryWrapper.innerHTML = primary_select;
    primaryFunction();
});
}

  
function primaryFunction(){
    var x = document.getElementById("primary_key").value;
   
    if(localStorage.getItem("primary_filter") !== x){
        localStorage.setItem("secondary_filter", "");
    }
    localStorage.setItem("primary_filter", x);
    var secondary_S ="";
    if(localStorage.getItem("secondary_filter")){
        secondary_S = localStorage.getItem("secondary_filter");
    }else{
        localStorage.setItem("secondary_filter", "");
    }
   // sidebarF(x,secondary_S);
    var secondary = new Set();
    var secondary_select="";
    var secondaryWrapper = document.getElementById("secondary_select");
    secondary_select+="<select id='secondary_key' class='form-select select_class' onchange=secondaryFunction('"+x+"')> ";
    secondary_select+="<option value='' selected>Secondary Filter</option>";
    getData("/objects/?query=jsonform&filter=['/content/filterPrimary','/content/filterSecondary']")
    .then(response => response.json())
    .then(data => { 
    data.results.forEach(elmt =>{
        if(elmt.content.hasOwnProperty('filterPrimary')===true){
            elmt.content.filterPrimary.filter(item =>{
                if(item==x){
                    if(!!elmt.content.filterSecondary){
                        elmt.content.filterSecondary.forEach(value=>secondary.add(value));
                    }
                }
            });
        }
    });
    
    for (let item of secondary.values()){
        if(item === secondary_S){
            secondary_select+="<option value='"+item+"' selected>"+item+"</option>";  
        }else{
            secondary_select+="<option value='"+item+"'>"+item+"</option>";
        }
            
    }
    secondary_select+="</select>";
    secondaryWrapper.innerHTML = secondary_select;
    });
   
}