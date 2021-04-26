 /*
    * Function which helps to create Form
    */
   function createForm(formname){
    var html="";
    var FormCreate = document.getElementById("contentTab");
    getData("/objects/?query=jsonform AND /alternateName:" + formname)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(element => {
                html += "<form id=" + element.content.alternateName + "> </form>";
                FormCreate.innerHTML = html;
                $('form#' + element.content.alternateName).jsonForm({
                    "schema": element.content.schema,
                    "form": element.content.form,
                    "onSubmitValid": function (values) {
                    postData('/objects/?type='+element.content.cordraSchema, values)
                    .then(response => {
                        if(response.status ==200){
                            console.log("Successful");
                            alert("The form was submitted successfully.");
                            $('form#' + element.content.alternateName)[0].reset();
                            
                        }
                    });
                }
                })
            });
    });
}