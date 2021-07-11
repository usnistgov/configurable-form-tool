/*
* Function which  helps to split the value on every button(Edit, Delete, view) and send it to the url
*/
function OpenBtnPage(id) {
    if (typeof id !== "undefined" && id !== null) {
        var result = id.split("_");

        window.location.replace("index.html?id=" + result[1] + "&mode=" + result[0] + "&type=" + result[2]);
    }

}

/*
   * This part of the code retrieve values in the url and help to do one get request to create a form with its schema
   * and defaut value if the form is an edit mode. With the values getting in the url, a put method is requested to edit an form. 
   * Even delete a table values is done within this script below 
   */
if (typeof GetURLParameter('id') !== "undefined" && GetURLParameter('id') !== null &&
    typeof GetURLParameter('mode') !== "undefined" && GetURLParameter('mode') !== null &&
    typeof GetURLParameter('type') !== "undefined" && GetURLParameter('type') !== null) {
        localStorage.setItem("message", "");
    var wrapperForm = document.getElementById("contentTab");
    var myHTML = "";
    var urlParameter = GetURLParameter('mode');
    getData("/objects/?query=type:" + GetURLParameter('type') + " AND /id" + GetURLParameter('id'))
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
                                        
                                        if (!!document.querySelector('input[type=file]')) {
                                            var file = document.querySelector('input[type=file]').files[0];
                                            var data_form = new FormData();
                                            data_form.append('content', JSON.stringify(values));
                                            data_form.append('name', 'file');
                                            data_form.append('filename', file);
                                            fetch(CORDRA_HTTPS_URL + '/objects/' + datas.results[0].content['@id'], {
                                                method: 'PUT',
                                                headers: {
                                                    'Authorization': 'Bearer ' + authdata['token'],
                                                },
                                                body: data_form
                                            })
                                                .then(r => {
                                                    if (response.status == 200) {
                                                        alert("The form was submitted successfully.");
                                                        localStorage.setItem("message", "The form was modified  successfully.");
                                                        $('form#' + element.content.alternateName)[0].reset();
                                                        window.location.replace(localStorage.getItem("redirect"));
                                                    }
                                                })
                                        } else {
                                            putData('/objects/' + datas.results[0].content['@id'], values)
                                                .then(response => {
                                                    if (response.status == 200) {
                                                        console.log("Successful");
                                                        alert("The form was submitted successfully.");
                                                        localStorage.setItem("message", "The form was modified  successfully.");
                                                        $('form#' + element.content.alternateName)[0].reset();
                                                        window.location.replace(localStorage.getItem("redirect"));
                                                    }
                                                });
                                        }
                                    }
                                })
                            });
                        });
                } else if (GetURLParameter('mode') === "view") {
                    // View mode is where all values are available in certain format
                    //wrapperForm.appendChild(prettyPrint(datas.results));
                    localStorage.setItem("message", "");
                    var page_name = "";
                    page_name += "<span class='page-header' style='float: right; margin-left: 10px;margin-right: 20px;'><button type='button' class='btn btn-primary' onclick=OpenBtnPage('edit_" + GetURLParameter('id') + "_" + GetURLParameter('type') + "')>"
                        + "<span class='glyphicon glyphicon-pencil'></span></button>";
                    page_name += "<button type='button' class='btn btn-danger' data-toggle='modal' data-target='#delete" + GetURLParameter('id').split("/")[1] + "'>"
                        + "<span class='glyphicon glyphicon-remove'></span></button>"
                        + "<div class='modal fade' id='delete" + GetURLParameter('id').split("/")[1] + "' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'>"
                        + "<div class='modal-dialog modal-sm' role='document'>"
                        + " <div class='modal-content'>"
                        + "<div class='modal-body'>"
                        + "Are you sure you want to delete ?"
                        + "</div>"
                        + "<div class='modal-footer'>"
                        + "<button type='button' class='btn btn-default' data-dismiss='modal'>No</button>"
                        + "<button type='button' class='btn btn-primary' onclick=OpenBtnPage('delete_" + GetURLParameter('id') + "_" + GetURLParameter('type') + "')>Yes</button>"
                        + "</div>"
                        + "</div>"
                        + "</div>"
                        + "</div>";
                    page_name += "<button type='button' class='btn btn-primary' data-toggle='modal' data-target='#share" + GetURLParameter('id').split("/")[1] + "' >"
                        + "<i class='fas fa-share-alt'></i></button></span>"
                        + "<div class='modal fade' id='share" + GetURLParameter('id').split("/")[1] + "' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'>"
                        + "<div class='modal-dialog' role='document'>"
                        + " <div class='modal-content'>"
                        + "  <div class='modal-header'>"
                        + "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"
                        + "<h4 class='modal-title' id='myModalLabel'>Share</h4>"
                        + "</div>"
                        + "<div class='modal-body'>"
                        + "Do you want to delete ?"
                        + "</div>"
                        + "<div class='modal-footer'>"
                        + "<button type='button' class='btn btn-default' data-dismiss='modal'>No</button>"
                        + "<button type='button' class='btn btn-primary' onclick=OpenBtnPage('share_" + GetURLParameter('id') + "_" + GetURLParameter('type') + "')>Yes</button>"
                        + "</div>"
                        + "</div>"
                        + "</div>"
                        + "</div>";
                    myHTML += "<form id=" + datas.results[0].content['formAlternateName'] + "> </form>";
                    wrapperForm.innerHTML = myHTML;
                    document.getElementById("page-header").innerHTML = page_name;
                    getData("/objects/?query=jsonform AND /alternateName:" + datas.results[0].content['formAlternateName'])
                        .then(response => response.json())
                        .then(data => {
                            
                            data.results.forEach(element => {
                               
                                    //delete element.content.form[element.content.form.length-1];
                                
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



                } else if (GetURLParameter('mode') === "delete") {

                    deleteData('/objects/' + GetURLParameter('id'))
                        .then(response => {
                            if (response.status == 200) {
                                console.log("Successful");
                                localStorage.setItem("message", "The entry was deleted successfully.");
                                window.location.replace(localStorage.getItem("redirect"));

                            }
                        });
                }
            }


        });

}