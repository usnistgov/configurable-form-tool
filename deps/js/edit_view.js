    /*
    * Function which  helps to split the value on every button(Edit, Delete, view) and send it to the url
    */
   function OpenBtnPage(id) {
    if (typeof id !== "undefined" && id !== null) {
        var result = id.split("_");
        window.location.replace("home.html?id=" + result[1] + "&mode=" + result[0]+ "&type=" + result[2]);
    }

}
 
 /*
    * This part of the code retrieve values in the url and help to do one get request to create a form with its schema
    * and defaut value if the form is an edit mode. With the values getting in the url, a put method is requested to edit an form. 
    * Even delete a table values is done within this script below 
    */
   if (typeof GetURLParameter('id') !== "undefined" && GetURLParameter('id') !== null &&
   typeof GetURLParameter('mode') !== "undefined" && GetURLParameter('mode') !== null && 
   typeof GetURLParameter('type') !== "undefined" && GetURLParameter('type') !== null ) {
   var wrapperForm = document.getElementById("contentTab");
   var myHTML = "";
   var urlParameter = GetURLParameter('mode');
   getData("/objects/?query=type:"+GetURLParameter('type')+" AND /id"+GetURLParameter('id'))
       .then(response => response.json())
       .then(datas => {
           if (!!datas) { 
               
               if (urlParameter === "edit") {
                   //edit mode is where the user can edit a form
                   myHTML += "<form id=" + datas.results[0].content['formAlternateName'] + "> </form>";
                   wrapperForm.innerHTML = myHTML;
                   getData("/objects/?query=jsonform AND /alternateName:" + datas.results[0].content['formAlternateName'])
                       .then(response => response.json())
                       .then(data => {
                           
                           data.results.forEach(element => {
                               $('form#' + element.content.alternateName).jsonForm({
                                   "schema": element.content.schema,
                                   "form": element.content.form,
                                   "value": datas.results[0].content,
                                   "onSubmitValid": function (values) {

                                       putData('/objects/' + datas.results[0].content['@id'], values)
                                           .then(response => {
                                               if (response.status == 200) {
                                                   console.log("Successful");
                                                   alert("The form was submitted successfully.");
                                                   $('form#' + element.content.alternateName)[0].reset();
                                                   location.reload();
                                               }
                                           });
                                   }
                               })
                           });
                   });
               } else if (GetURLParameter('mode') === "view") {
                   // View mode is where all values are available in certain format
                   //wrapperForm.appendChild(prettyPrint(datas.results));

                   myHTML += "<form id=" + datas.results[0].content['formAlternateName'] + "> </form>";
                   wrapperForm.innerHTML = myHTML;
                   
                   getData("/objects/?query=jsonform AND /alternateName:" + datas.results[0].content['formAlternateName'])
                       .then(response => response.json())
                       .then(data => {
                           
                           data.results.forEach(element => {
                               $('form#' + element.content.alternateName).jsonForm({
                                   "schema": element.content.schema,
                                   "form": element.content.form,
                                   "value": datas.results[0].content
                                   
                               })
                           });
                           var form = document.getElementById(datas.results[0].content['formAlternateName']);
                           var elements = form.elements;
                           for (var i = 0; i < elements.length; ++i) {
                               elements[i].disabled = true;
                           }
                   });
                   
                   
                   
               } else {
                   if (confirm("Press a button!")) {
                       console.log("things to do");
                   } else {
                       console.log("nothing to do");
                   }
               }
           }


       });

}