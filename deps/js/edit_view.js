/*
* Function which  helps to split the value on every button(Edit, Delete, view) and send it to the url
*/
function OpenBtnPage(url_values) {
    if (typeof url_values !== "undefined" && url_values !== null) {
        var result = url_values.split("_");
        window.location.replace("index.html?mode=" + result[0] + "&form=" + result[2] + "&id=" + result[1]);
    }
}
function OpenBtnPage_Create(url_values) {
    if (typeof url_values !== "undefined" && url_values !== null) {
        var result = url_values.split("_");
        window.location.replace("index.html?mode=" + result[0] + "&form="+ result[1]);
    }
}
/*
   * This part of the code retrieve values in the url and help to do one get request to create a form with its schema
   * and defaut value if the form is an edit mode. With the values getting in the url, a put method is requested to edit an form. 
   * Even delete a table values is done within this script below 
   */


if (typeof GetURLParameter('id') !== "undefined" && GetURLParameter('id') !== null &&
    typeof GetURLParameter('mode') !== "undefined" && GetURLParameter('mode') !== null &&
    typeof GetURLParameter('form') !== "undefined" && GetURLParameter('form') !== null ) {
    localStorage.setItem("message", "");
    var wrapperForm = document.getElementById("contentTab");
    var payloadWrapper = document.getElementById("displayPlayload");
    var myHTML = "";
    var urlParameter = GetURLParameter('mode');
    var id_form = GetURLParameter('form');
    getData("/objects/" + id_form)
        .then(response => response.json())
        .then(form_val => {
            getData("/objects/?query=type:" + form_val.cordraSchema + " AND /id" + GetURLParameter('id'))
                .then(response => response.json())
                .then(datas => {
                    if (!!datas) {
                        if (datas.results[0].payloads) {
                            datas.results[0].payloads.forEach(elt => {
                                value_fetch = CORDRA_HTTPS_URL + '/objects/' + datas.results[0].content['@id'] + '?' + new URLSearchParams({ payload: elt["name"], disposition: 'attachment' }).toString();
                                fetch(value_fetch, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': 'Bearer ' + authdata['token'],
                                    }
                                }).then(response => validateResponse(response))
                                    .then(Blod => readResponseAsBlob(Blod))
                                    .then(value => showImage(value, elt.filename))
                                    .catch(error => logError(error));
                            });
                        }
                        if (urlParameter === "edit") {
                            //edit mode is where the user can edit a form
                            var page_name = "<h1 class='h2'>" + form_val.name.charAt(0).toUpperCase() + form_val.name.slice(1) + "</h1>";
                            myHTML += "<form id=" + datas.results[0].content['formAlternateName'] + "> </form>";
                            wrapperForm.innerHTML = myHTML;
                            getData("/objects/?query=" + form_val.cordraSchema + " AND /alternateName:" + datas.results[0].content['formAlternateName'])
                                .then(response => response.json())
                                .then(data => {
                                    var formatValues = { "enum": [], "titleMap": {} };
                                    var values = {};
                                    var selectValues = [];
                                    data.results.forEach(element => {
                                        var queries = element.content.form.filter(item => {
                                            if (item.cordra) {
                                                return item.cordra;
                                            }
                                        });
                                        if (queries.length > 0) {
                                            getData("/objects/?query=" + queries[0].cordra.query + "&filter=['/content/@id','/content/name']")
                                                .then(response => response.json())
                                                .then(data => {
                                                    data.results.forEach(elt => {
                                                        selectValues.push(elt.content['@id']);
                                                        values[elt.content['@id']] = elt.content['name'];

                                                    });
                                                    formatValues.enum = selectValues;
                                                    formatValues.titleMap = values;
                                                    element.content.form.forEach(item => {
                                                        if (item.cordra) {
                                                            item.titleMap = values;
                                                            element.content.schema[item.key].enum = selectValues;
                                                        }
                                                    });
                                                    modifiedForm(element.content, datas);
                                                });

                                        } else {
                                            modifiedForm(element.content, datas);
                                        }
                                        document.getElementById("page-header").innerHTML = page_name;
                                    });
                                });
                        } else if (urlParameter === "view") {
                            localStorage.setItem("message", "");
                            var page_name = "<h1 class='h2'>" + form_val.name.charAt(0).toUpperCase() + form_val.name.slice(1) + "</h1>";
                            page_name += "<div class='btn-toolbar'><div class='btn-group me-3'><button type='button' class='btn btn-outline-primary' onclick=OpenBtnPage('edit_" + GetURLParameter('id') + "_" + id_form + "')>"
                                + "<i class='bi bi-pencil-square'></i></button>";
                            page_name += "<button type='button' class='btn  btn-outline-danger' data-bs-toggle='modal' data-bs-target='#delete" + GetURLParameter('id').split("/")[1] + "'>"
                                + "<i class='bi bi-x-square'></i></button>";
                            page_name += "<div class='modal fade' id='delete" + GetURLParameter('id').split("/")[1] + "' tabindex='-1'  aria-labelledby='myModalLabel' aria-hidden='true'>"
                                + "<div class='modal-dialog modal-sm' role='document'>"
                                + " <div class='modal-content'>"
                                + "<div class='modal-body'>"
                                + "Do you want to delete : <strong>" + GetURLParameter('id') + "</strong> ?"
                                + "</div>"
                                + "<div class='modal-footer'>"
                                + "<button type='button' class='btn btn-default' data-bs-dismiss='modal'>No</button>"
                                + "<button type='button' class='btn btn-primary' onclick=OpenBtnPage('delete_" + GetURLParameter('id') + "_" +id_form+ "')>Yes</button>"
                                + "</div>"
                                + "</div>"
                                + "</div>"
                                + "</div>"
                                + "<button type='button' class='btn btn-outline-primary' data-bs-toggle='modal' data-id='" + GetURLParameter('id') + "_" + datas.results[0].metadata["createdBy"] + "' data-bs-target='#shareModal' > "
                                + "<i class='fas fa-share-alt'></i></button>";
                            page_name += "<div class='modal fade' id='shareModal'   tabindex='-1' >"
                                + "<div class='modal-dialog modal-lg' role='document'>"
                                + "<div class='modal-content'>"
                                + "<div class='modal-header'>"
                                + "<h4 class='modal-title' id='myModalLabel'>Share</h4>"
                                + "<button type='button' class='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>"
                                + "</div>"
                                + "<div class='modal-body'>"
                                + "<form id='acl_user'>"
                                + "<div class='row g-3'>"
                                + "<div class='col' id='select_drop'>"
                                + "</div>"
                                + "<div class='col form-check'>"
                                + "<input type='checkbox' id='read' class='form-check-input' name='read' value='read' required>"
                                + "<label for ='read' class='form-check-label'>Can Read</label> </div>"
                                + "<div class='col form-check'>"
                                + "<input type='checkbox' id='write' class='form-check-input'  name='write' value='write' required>"
                                + "<label for='write' class='form-check-label'>Can write</label></div>"
                                + "<button  type='submit' id='submit_btn' class='btn btn-primary col'>Add</button>"
                                + "</div>"
                                + "</form>"
                                + "<hr>"
                                + "<div id='table_user'></div>"
                                + "</div>"
                                + "<div class='modal-footer'>"
                                + "</div>"
                                + "</div>"
                                + "</div>"
                                + "</div>"
                                + "</div>"
                                + "</div>";
                            myHTML += "<form id=" + datas.results[0].content['formAlternateName'] + "> </form>";
                            wrapperForm.innerHTML = myHTML;
                            document.getElementById("page-header").innerHTML = page_name;
                            getData("/objects/?query=" + form_val.cordraSchema + " AND /alternateName:" + datas.results[0].content['formAlternateName'])
                                .then(response => response.json())
                                .then(data => {
                                    var formatValues = { "enum": [], "titleMap": {} };
                                    var values = {};
                                    var selectValues = [];
                                    data.results.forEach(element => {
                                        var queries = element.content.form.filter(item => {
                                            if (item.cordra) {
                                                return item.cordra;
                                            }
                                        });
                                        if (queries.length > 0) {
                                            getData("/objects/?query=" + queries[0].cordra.query + "&filter=['/content/@id','/content/name']")
                                                .then(response => response.json())
                                                .then(data => {
                                                    data.results.forEach(elt => {
                                                        selectValues.push(elt.content['@id']);
                                                        values[elt.content['@id']] = elt.content['name'];
                                                    });
                                                    formatValues.enum = selectValues;
                                                    formatValues.titleMap = values;
                                                    element.content.form.forEach(item => {
                                                        if (item.cordra) {
                                                            item.titleMap = values;
                                                            element.content.schema[item.key].enum = selectValues;
                                                        }
                                                    });
                                                    
                                                    $('form#' + element.content.alternateName).jsonForm({
                                                        "schema": element.content.schema,
                                                        "form": element.content.form,
                                                        "value": datas.results[0].content

                                                    });
                                                    var form = document.getElementById(datas.results[0].content['formAlternateName']);
                                                    var elements = form.elements;
                                                    for (var i = 0; i < elements.length; ++i) {
                                                        elements[i].disabled = true;
                                                    }
                                                });

                                        } else {
                                            $('form#' + element.content.alternateName).jsonForm({
                                                "schema": element.content.schema,
                                                "form": element.content.form,
                                                "value": datas.results[0].content
                                            });
                                            
                                        }
                                    });
                                    
                                    var formatVal = document.getElementById(datas.results[0].content['formAlternateName']);
                                    var elements = formatVal.elements;
                                    for (var i = 0; i < elements.length; ++i) {
                                        elements[i].disabled = true;
                                    }
                                });

                            $('#shareModal').on('hidden.bs.modal', function (e) {
                                $('#acl_user')[0].reset();
                                location.reload();
                            });
                            $('#shareModal').on('show.bs.modal', function (event) {
                                var button = $(event.relatedTarget); // Button that triggered the modal
                                var split_values = button.data('id'); // Extract info from data-* attributes   
                                split_values = split_values.split("_");
                                var recipient = split_values[0];

                                var userIdCreateEntry = split_values[1];

                                $('#submit_btn').click(function (e) {
                                    e.preventDefault();

                                    var data = {
                                        readers: [],
                                        writers: []
                                    };

                                    if ($('#read').is(":checked")) {
                                        data.readers = $('#drop').val();
                                    }
                                    if ($('#write').is(":checked")) {
                                        data.writers = $('#drop').val();
                                    }

                                    if (data.writers === null && data.readers === null) {
                                        alert("You must select a user");
                                    } else {
                                        if (data.writers.length === 0 && data.readers.length === 0) {
                                            alert("You must check at least one box");
                                        } else {
                                            getData("/acls/" + recipient).then(response => response.json())
                                                .then(acl_datas => {
                                                    if (!!acl_datas && typeof acl_datas.readers !== "undefined" && acl_datas.readers !== null
                                                        && typeof acl_datas.writers !== "undefined" && acl_datas.writers !== null) {
                                                        data.readers = data.readers.concat(acl_datas.readers);
                                                        data.writers = data.writers.concat(acl_datas.writers);
                                                    }
                                                    putData('/acls/' + recipient, data).then(respons => {
                                                        if (respons.status == 200) {
                                                            $('#acl_user')[0].reset();
                                                            data = {};
                                                            $('#drop').multiselect('refresh');
                                                            loadTable(recipient, userIdCreateEntry);
                                                            dropdown(recipient);
                                                        }
                                                    });
                                                });
                                        }

                                    }

                                });
                                loadTable(recipient, userIdCreateEntry);
                                dropdown(recipient);

                            });
                        } else if (urlParameter === "delete") {
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
        });
}

function readResponseAsBlob(response) {
    return response.blob();
}
function showImage_tb(responseAsBlob, filename, name) {
    if (responseAsBlob.type && responseAsBlob.type.includes("image")) {
        var displayPlayload = document.getElementById(filename);
        var imgElem = document.createElement('img');
        var imgUrl = URL.createObjectURL(responseAsBlob);
        const a = document.createElement('a');
        imgElem.style.cssText = "height:100px;";
        imgElem.src = imgUrl;
        a.appendChild(imgElem);
        a.href = imgUrl;
        a.download = name + "." + responseAsBlob['type'].split('/')[1];
        a.title = name + "." + responseAsBlob['type'].split('/')[1];
        const clickHandler = () => {
            setTimeout(() => {
                URL.revokeObjectURL(imgUrl);
                this.removeEventListener('click', clickHandler);
            }, 150);
        }
        a.addEventListener('click', clickHandler, false);
        displayPlayload.appendChild(a);
        return imgElem;
    }
}
function showImage(responseAsBlob, filename) {
    var container = document.getElementById('link');
    var displayPlayload = document.getElementById('displayPlayload');
    var imgElem = document.createElement('img');
    var imgUrl = URL.createObjectURL(responseAsBlob);
    var link = document.createTextNode(filename)
    const a = document.createElement('a');
    imgElem.style.cssText = "width:100%";
    displayPlayload.appendChild(imgElem);
    a.appendChild(link);
    a.href = imgUrl;
    a.download = filename;
    a.title = filename;
    a.style.cssText = "margin: 10px";
    const clickHandler = () => {
        setTimeout(() => {
            URL.revokeObjectURL(imgUrl);
            this.removeEventListener('click', clickHandler);
        }, 150);
    }
    a.addEventListener('click', clickHandler, false);
    container.appendChild(a);
    imgElem.src = imgUrl;
    if (responseAsBlob.type && responseAsBlob.type.includes("image")) {
        if (displayPlayload) displayPlayload.appendChild(imgElem);
    }
}


function logError(error) {
    console.log('Looks like there was a problem: \n', error);
}

function validateResponse(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

function modifiedForm(content, datas) {
    var files = content.form.filter(item => item.type === "file");
    $('form#' + content.alternateName).jsonForm({
        "schema": content.schema,
        "form": content.form,
        "value": datas.results[0].content,
        "onSubmitValid": function (values) {
            if (!!document.querySelector('input[type=file]')) {
                var data_form = new FormData();
                files.forEach(item => {
                    var file = document.querySelector('input[name=' + item['key'] + ']').files[0];
                    if (file) {
                        data_form.append(item['key'], document.querySelector('input[name=' + item['key'] + ']').files[0]);
                        values[item['key']] = values[item['key']] = CORDRA_HTTPS_URL + '/objects/' + datas.results[0].content['@id'] + '?' +
                            new URLSearchParams({ payload: item['key'], disposition: 'attachment' }).toString();
                    } else {
                        values[item['key']] = datas.results[0].content[item['key']];
                    }
                });
                data_form.append('content', JSON.stringify(values));
                fetch(CORDRA_HTTPS_URL + '/objects/' + datas.results[0].content['@id'], {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer ' + authdata['token']
                    },
                    body: data_form
                }).then(r => {
                    if (r.status == 200) {
                        alert("The form was submitted successfully.");
                        localStorage.setItem("message", "The form was modified  successfully.");
                        $('form#' + content.alternateName)[0].reset();
                        window.location.replace(localStorage.getItem("redirect"));
                    }
                });
            } else {
                putData('/objects/' + datas.results[0].content['@id'], values)
                    .then(response => {
                        if (response.status == 200) {
                            alert("The form was submitted successfully.");
                            localStorage.setItem("message", "The form was modified  successfully.");
                            $('form#' + content.alternateName)[0].reset();
                            window.location.replace(localStorage.getItem("redirect"));
                        }
                    });
            }
        }
    });
}




