    /*
    * @param : element available on the url when sending the get request
    *@return : return an array of element in the url
    */
   function GetURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {

            return sParameterName[1];
        }
    }
}
function openContentElmt(content) {
    console.log(content);
    data=decodeURIComponent(content).split("/");
    
    if (typeof content !== "undefined" && content !== null) {
        //window.history.replaceState(null, null, "?formname="+contentName);
        window.location.replace("home.html?formname=" + content);
    }
}

if (typeof GetURLParameter('formname') !== "undefined"
    && GetURLParameter('formname') !== null) {
    var wrapperTable = document.getElementById("contentTab");
    var page_name="";
    var urlValue = decodeURIComponent(GetURLParameter('formname')).split("/");
    getData("/objects/?query=type:"+urlValue[2]+" AND /formAlternateName: " + urlValue[1])
        .then(response => response.json())
        .then(data => {
            page_name="<h1 class='page-header'>"+urlValue[0].charAt(0).toUpperCase()+ urlValue[0].slice(1);
            page_name+="<span style='float: right; margin-left: 10px;margin-right: 20px;'> <button class='btn btn-primary' onclick=createForm('" + urlValue[1] + "')> New "+urlValue[0]+" </button></span></h1>";
            document.getElementById("page-header").innerHTML =page_name;
            var tableHTML = " <div id='" + urlValue[1] + "' class='table-responsive'>"
                + " <div style='overflow-x:auto;'><table class='table table-striped'>"
                + "<thead>"
                + "<tr>"
                + "<th scope='col'>#</th>"
                + "<th scope='col'>Name</th>"
                + "<th scope='col'>Nist property</th>"
                + "<th scope='col'>Model number</th>"
                + "<th></th>"
                + " </tr>"
                + " </thead>"
                + "<tbody>";
            var tableElmt = "";
            data.results.forEach(element => {
                if (!!element.content && element.metadata.createdBy == "admin") {
                    tableHTML += "<tr>"
                        + "<th scope='row'>1</th>";
                    tableHTML += (!!element.content['name']) ? "<td>" + element.content['name'] + "</td>" : "<td></td>";

                    tableHTML += (!!element.content['nist_property']) ? "<td>" + element.content['nist_property'] + "</td>" : "<td></td>";

                    tableHTML += (!!element.content['model_number']) ? "<td>" + element.content['model_number'] + "</td>" : "<td></td>";
                    tableHTML += "<td>";
                    tableHTML += (!!element['id']) ? "<button type='button' class='btn btn-primary' onclick=OpenBtnPage('edit_" + element.content['@id'] +"_"+ element['type'] +"')>"
                        + "<span class='glyphicon glyphicon-pencil'></span></button>" : " ";
                    tableHTML += (!!element['id']) ? "<button type='button' class='btn btn-danger'  onclick=OpenBtnPage('delete_" + element.content['@id'] +"_"+ element['type'] + "')>"
                        + "<span class='glyphicon glyphicon-remove'></span></button>" : " ";
                    tableHTML += (!!element['id']) ? "<button type='button' class='btn btn-info' onclick=OpenBtnPage('view_" + element.content['@id'] +"_"+ element['type'] + "')>"
                        + "<span class='glyphicon glyphicon-eye-open'></span></button>" : " ";

                    tableHTML += "</td></tr>";
                }
            });
            tableHTML += "</tbody></table></div></div>";
            wrapperTable.innerHTML = tableHTML;
        });
}