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
    if (typeof content !== "undefined" && content !== null) {
        localStorage.setItem("redirect", "index.html?mode=list&form=" +content);
        localStorage.setItem("message", "");
        window.location.replace("index.html?mode=list&form=" +content);
    }
}

if (typeof GetURLParameter('mode') !== "undefined" && GetURLParameter('mode') !== null && GetURLParameter('mode') ==="list" &&
    typeof GetURLParameter('form') !== "undefined" && GetURLParameter('form') !== null ) {

    var wrapperTable = document.getElementById("contentTab");
    var page_name = "";
    var id_form = decodeURIComponent(GetURLParameter('form'));
    getData("/objects/" + id_form)
        .then(response => response.json())
        .then(form_val => {
            getData("/objects/?query=type:" + form_val.cordraSchema + " AND /formAlternateName:" + form_val.alternateName)
                .then(response => response.json())
                .then(data => {
                    page_name = "<h1 class='h1'>" + form_val.name.charAt(0).toUpperCase() + form_val.name.slice(1) + "</h1>";
                    page_name += "<div class='btn-toolbar mb-2 mb-md-0'><button class='btn btn-primary' onclick=OpenBtnPage_Create('create_" +id_form + "')> New " + form_val.name + " </button></div>";
                    // Creation of dynamic table with the variable name tableTest
                    var tableTest = " <div id='" + form_val.alternateName + "' class='table-responsive' >"
                        + " <div style='overflow-x:auto;'><table  id='table_id' class='table table-striped table-bordered table-hover'>"
                        + "<thead>"
                        + "<tr>";
                    // Creation of not dynamic table with the variable name tableTest
                    var tableHTML = " <div id='" + form_val.alternateName + "' class='table-responsive' >"
                        + " <div style='overflow-x:auto;'><table  id='table_id' class='table table-striped table-bordered table-hover'>"
                        + "<thead>"
                        + "<tr>"
                        + "<th scope='col'>Persistent Identifier</th>"
                        + "<th scope='col'>Name</th>"
                        + "<th></th>"
                        + " </tr>"
                        + " </thead>"
                        + "<tbody>";
                    var tableElmt = "";
                    getData("/objects/?query=" + form_val.cordraSchema + " AND /alternateName:" + form_val.alternateName)
                        .then(response => response.json())
                        .then(dataTableColumns => {
                            if (dataTableColumns.results[0].content.tableColumns) {
                                dataTableColumns.results[0].content.tableColumns.forEach(el => {
                                    tableTest += "<th scope='col'>" + el.title + "</th>";
                                });
                                tableTest += "</tr></thead><tbody><tr>";
                                data.results.forEach(element => {
                                    dataTableColumns.results[0].content.tableColumns.forEach(el => {
                                        if (el.type === "string") {
                                            tableTest += "<td scope='row'> " + element.content[el.property] + "</td>";
                                        } else if (el.type === "hyperlink") {
                                            tableTest += "<td scope='row'> <a style='color: #337ab7 !important;' href=" + element.content[el.property] + " target='_blank' rel='noopener noreferrer'>" + element.content[el.property] + "</a></td>";
                                        } else if (el.type === "image") {
                                            tableTest += "<td scope='row' id='" + element.content[el.property] + "'> </td>";
                                            if (element.content[el.property] != "" && element.content[el.property].includes(CORDRA_HTTPS_URL)) {
                                                fetch(element.content[el.property], {
                                                    method: 'GET',
                                                    headers: {
                                                        'Authorization': 'Bearer ' + authdata['token'],
                                                    }
                                                }).then(response => validateResponse(response))
                                                    .then(Blod => readResponseAsBlob(Blod))
                                                    .then(value => showImage_tb(value, element.content[el.property], el.title))
                                                    .catch(error => logError(error));
                                            }

                                        } else if (el.type === "action") {
                                            if (!!element.content) {
                                                tableElmt = element.content['@id'];
                                                var id = tableElmt.split("/");
                                                tableTest += "<td>";
                                                tableTest += (!!element['id']) ? "<div class='btn-group' role='group' aria-label='Basic radio toggle button group'><button type='button' class='btn btn-primary' onclick=OpenBtnPage('edit_" + element.content['@id'] + "_"+ id_form + "')>"
                                                    + "<i class='bi bi-pencil-square'></i></button>" : " ";
                                                tableTest += (!!element['id']) ? "<button type='button' class='btn btn-danger' data-bs-toggle='modal' data-bs-target='#delete" + id[1] + "' >"
                                                    + "<i class='bi bi-x-square'></i></button>"
                                                    + "<div class='modal fade' id='delete" + id[1] + "' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'>"
                                                    + "<div class='modal-dialog modal-sm' role='document'>"
                                                    + " <div class='modal-content'>"
                                                    + "<div class='modal-body'>"
                                                    + "Do you want to delete : <strong>" + element.content['@id'] + "</strong> ?"
                                                    + "</div>"
                                                    + "<div class='modal-footer'>"
                                                    + "<button type='button' class='btn btn-default' data-bs-dismiss='modal'>No</button>"
                                                    + "<button type='button' class='btn btn-primary' onclick=OpenBtnPage('delete_" + element.content['@id'] + "_" + id_form + "')>Yes</button>"
                                                    + "</div>"
                                                    + "</div>"
                                                    + "</div>"
                                                    + "</div>"
                                                    : " ";
                                                tableTest += (!!element['id']) ? "<button type='button' class='btn btn-info' onclick=OpenBtnPage('view_" + element.content['@id'] + "_" + id_form + "')>"
                                                    + "<i class='bi bi-eye'></i></button>" : " ";
                                                tableTest += (!!element['id']) ? "<button type='button' class='btn btn-primary' data-bs-toggle='modal' data-id='" + element.content['@id'] + "_" + element.metadata["createdBy"] + "' data-bs-target='#shareModal'>"
                                                    + "<i class='fas fa-share-alt'></i></button>"
                                                    + "<div class='modal fade' id='shareModal' role='dialog'  tabindex='-1'  >"
                                                    + "<div class='modal-dialog modal-lg' role='document'>"
                                                    + " <div class='modal-content'>"
                                                    + "  <div class='modal-header'>"
                                                    + "<h4 class='modal-title' id='myModalLabel'>Share</h4>"
                                                    + "<button type='button' class='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>"
                                                    + "</div>"
                                                    + "<div class='modal-body'>"
                                                    + "<form id='acl_user'>"
                                                    + "<div class='row g-3'>"
                                                    + "<div class='col' id='select_drop'>"
                                                    + "</div>"
                                                    + "<div class='col form-check'> "
                                                    + "<input type='checkbox' id='read' class='form-check-input' name='read' value='read' required>"
                                                    + "<label for ='read' class='form-check-label'>Can Read</label> </div>"
                                                    + "<div class='col form-check'> "
                                                    + "<input type='checkbox' id='write' class='form-check-input'  name='write' value='write' required>"
                                                    + "<label for='write' class='form-check-label'>Can write</label></div>"
                                                    + "<button  type='submit' id='submit_btn' class='btn btn-primary col'>Add</button>"
                                                    + "</div>"
                                                    + "</form>"
                                                    + "<hr>"
                                                    + "<div id='table_user'></div>"
                                                    + "</div>"
                                                    + "</div>"
                                                    + "</div>"
                                                    + "</div></div>"
                                                    : " ";
                                                tableTest += "</td>";
                                            }
                                        }

                                    });
                                    tableTest += "</tr>"
                                });
                                document.getElementById("page-header").innerHTML = page_name;
                                tableTest += "</tbody></table></div></div>";
                                if (!!tableTest) {
                                    wrapperTable.innerHTML = tableTest;
                                }
                                else {
                                    wrapperTable.innerHTML = "";
                                }
                                $('#table_id').DataTable();
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
                                            data.writers = data.writers.filter(item => item !== "public");
                                        }
                                        if (data.readers === null || data.readers.length === 0) {
                                            alert("The user must have a read access!!");
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
                            } else {
                                data.results.forEach(element => {
                                    if (!!element.content) {
                                        tableElmt = element.content['@id'];
                                        var id = tableElmt.split("/");
                                        tableHTML += "<tr>"
                                        tableHTML += "<td scope='row'>" + element.content['@id'] + "</td>";
                                        tableHTML += (!!element.content['name']) ? "<td>" + element.content['name'] + "</td>" : "<td></td>";
                                        tableHTML += "<td>";
                                        tableHTML += (!!element['id']) ? "<div class='btn-group' role='group' aria-label='Basic radio toggle button group'><button type='button' class='btn btn-primary' onclick=OpenBtnPage('edit_" + element.content['@id'] + "_"+ id_form + "')>"
                                            + "<i class='bi bi-pencil-square'></i></button>" : " ";
                                        tableHTML += (!!element['id']) ? "<button type='button' class='btn btn-danger' data-bs-toggle='modal' data-bs-target='#delete" + id[1] + "' >"
                                            + "<i class='bi bi-x-square'></i></button>"
                                            + "<div class='modal fade' id='delete" + id[1] + "' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'>"
                                            + "<div class='modal-dialog modal-sm' role='document'>"
                                            + " <div class='modal-content'>"
                                            + "<div class='modal-body'>"
                                            + "Do you want to delete : <strong>" + element.content['name'] + "</strong> ?"
                                            + "</div>"
                                            + "<div class='modal-footer'>"
                                            + "<button type='button' class='btn btn-default' data-bs-dismiss='modal'>No</button>"
                                            + "<button type='button' class='btn btn-primary' onclick=OpenBtnPage('delete_" + element.content['@id'] + "_" + id_form + "')>Yes</button>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            : " ";
                                        tableHTML += (!!element['id']) ? "<button type='button' class='btn btn-info' onclick=OpenBtnPage('view_" + element.content['@id'] + "_" + id_form + "')>"
                                            + "<i class='bi bi-eye'></i></button>" : " ";
                                        tableHTML += (!!element['id']) ? "<button type='button' class='btn btn-primary' data-bs-toggle='modal' data-id='" + element.content['@id'] + "_" + element.metadata["createdBy"] + "' data-bs-target='#shareModal'>"
                                            + "<i class='fas fa-share-alt'></i></button>"
                                            + "<div class='modal fade' id='shareModal' role='dialog'  tabindex='-1'  >"
                                            + "<div class='modal-dialog modal-lg' role='document'>"
                                            + " <div class='modal-content'>"
                                            + "  <div class='modal-header'>"
                                            + "<h4 class='modal-title' id='myModalLabel'>Share</h4>"
                                            + "<button type='button' class='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>"
                                            + "</div>"
                                            + "<div class='modal-body'>"
                                            + "<form id='acl_user'>"
                                            + "<div class='row g-3'>"
                                            + "<div class='col' id='select_drop'>"
                                            + "</div>"
                                            + "<div class='col form-check'> "
                                            + "<input type='checkbox' id='read' class='form-check-input' name='read' value='read' required>"
                                            + "<label for ='read' class='form-check-label'>Can Read</label> </div>"
                                            + "<div class='col form-check'> "
                                            + "<input type='checkbox' id='write' class='form-check-input'  name='write' value='write' required>"
                                            + "<label for='write' class='form-check-label'>Can write</label></div>"
                                            + "<button  type='submit' id='submit_btn' class='btn btn-primary col'>Add</button>"
                                            + "</div>"
                                            + "</form>"
                                            + "<hr>"
                                            + "<div id='table_user'></div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div>"
                                            + "</div></div>"
                                            : " ";
                                        tableHTML += "</td></tr>";
                                    }
                                });
                                document.getElementById("page-header").innerHTML = page_name;
                                tableHTML += "</tbody></table></div></div>";
                                if (!!tableElmt) {
                                    wrapperTable.innerHTML = tableHTML;
                                }
                                else {
                                    wrapperTable.innerHTML = "";
                                }
                                $('#table_id').DataTable();
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
                                            data.writers = data.writers.filter(item => item !== "public");
                                        }
                                        if (data.readers === null || data.readers.length === 0) {
                                            alert("The user must have a read access!!");
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
                                                            } else if (respons.status == 403) {
                                                                alert("You do not have access to modify this entry");
                                                                location.reload();
                                                            }
                                                        });

                                                    });
                                            }

                                        }

                                    });
                                    loadTable(recipient, userIdCreateEntry);
                                    dropdown(recipient);

                                });
                            }

                        });
                });
    });
}

function loadTable(recipient, idUser) {
    const table_user = document.getElementById('table_user');
    var tableUsers = "";
    getData("/objects/?query=type:User")
    .then(response => response.json())
    .then(data => {
        getData("/acls/" + recipient).then(response => response.json())
        .then(acl_datas => {
            var setUsers = new Map();
            $('#tableUser').empty();
            $('#tableUser').DataTable({
                destroy: true
            });
            if (!!acl_datas && typeof acl_datas.readers !== "undefined" && acl_datas.readers !== null
                && typeof acl_datas.writers !== "undefined" && acl_datas.writers !== null) {
                tableUsers += " <div class='table-responsive' ><table  id='tableUser'  class='table table-striped table-bordered table-hover'>";
                tableUsers += "<thead><tr><th scope='col'>Persistent Identifier</th><th scope='col'>Can Read?</th><th>Can Write?</th><th></th></thead>";

                acl_datas.readers.forEach(elt => {
                    if (!!elt && elt.length > 0 && elt !== "public")
                        setUsers.set(elt, { readers: true, writers: false });
                });
                acl_datas.writers.forEach(elt_2 => {
                    if (!!elt_2 && elt_2.length > 0 && elt_2 !== "public")
                        if (!!setUsers.get(elt_2)) {
                            setUsers.set(elt_2, { ...setUsers.get(elt_2), writers: true });
                        } else {
                            setUsers.set(elt_2, { writers: true, readers: false });
                        }
                });
                data.results.forEach(element => {
                    if (setUsers.has(element.content['@id'])) {
                        setUsers.set(element.content['@id'], { ...setUsers.get(element.content['@id']), name: element.content['name'] });
                    }
                });
                for (const [key, value] of setUsers.entries()) {
                    if (key !== idUser) {
                        tableUsers += (!!value.name && typeof value.name !== "undefined") ? "<td>" + value.name + "</td>" : "<td> </td>";
                        tableUsers += (typeof value.readers !== "undefined") ? ((value.readers == true) ? "<td> <div class='form-switch'><input type='checkbox' name='readers[]' role='switch' class='form-check-input'    onchange=switch_btn('readers_" + key + "_" + recipient + "_" + value.readers + "_" + idUser + "') checked></div></td>" : "<td> <div class='form-switch'><input type='checkbox' name='readers[]' role='switch'  class='form-check-input'   onchange=switch_btn('readers_" + key + "_" + recipient + "_" + value.readers + "_" + idUser + "')></div></td>") : "<td> </td>";
                        tableUsers += (typeof value.writers !== "undefined") ? ((value.writers == true) ? "<td> <div class='form-switch'><input type='checkbox' name='writers[]' role='switch' class='form-check-input'    onchange=switch_btn('writers_" + key + "_" + recipient + "_" + value.writers + "_" + idUser + "') checked></div></td>" : "<td><div class='form-switch'> <input type='checkbox' name='writers[]' role='switch'  class='form-check-input'    onchange=switch_btn('writers_" + key + "_" + recipient + "_" + value.writers + "_" + idUser + "')></div></td>") : "<td> </td>";
                        tableUsers += "<td>";
                        tableUsers += (!!key) ? "<button type='button'  class='btn btn-danger' onclick=removeUser('" + value.name.split(" ")[0] + "_" + key + "_" + recipient + "_" + idUser + "') >"
                            + "<i class='bi bi-x-square'></i></button>"
                            : " ";
                        tableUsers += "</td></tr>";
                    }
                }
                tableUsers += "</table></div>";
                table_user.innerHTML = tableUsers;
                $('#tableUser').DataTable();
            }
        });
    });

}

function switch_btn(value_change) {
    var split_val = value_change.split("_");
    if (split_val[0] === "readers") {
        getData("/acls/" + split_val[2]).then(response => response.json())
        .then(acl_datas => {
            if (split_val[3] === "true") {
                acl_datas.readers = acl_datas.readers.filter(item => item !== split_val[1]);
                acl_datas.writers = acl_datas.writers.filter(item => item !== split_val[1]);
            } else {
                acl_datas.readers = [...acl_datas.readers, split_val[1]];
            }
            putData('/acls/' + split_val[2], acl_datas).then(respons => {
                if (respons.status == 200) {
                    $('#acl_user')[0].reset();
                    data = {};
                    $('#drop').multiselect('refresh');
                    loadTable(split_val[2], split_val[4]);
                    dropdown(split_val[2]);
                } else if (respons.status == 403) {
                    alert("You do not have access to modify this entry");
                    location.reload();
                } else {
                    alert(respons.statusText);
                    location.reload();
                }
            });
        });
    }
    if (split_val[0] === "writers") {
        getData("/acls/" + split_val[2]).then(response => response.json())
        .then(acl_datas => {
            if (split_val[3] === "true") {
                acl_datas.writers = acl_datas.writers.filter(item => item !== split_val[1]);
            } else {
                acl_datas.writers = [...acl_datas.writers, split_val[1]];
            }
            putData('/acls/' + split_val[2], acl_datas).then(respons => {
                if (respons.status == 200) {
                    $('#acl_user')[0].reset();
                    data = {};
                    $('#drop').multiselect('refresh');
                    loadTable(split_val[2], split_val[4]);
                    dropdown(split_val[2]);
                } else if (respons.status == 403) {
                    alert("You do not have access to modify this entry");
                    location.reload();
                } else {
                    alert(respons.statusText);
                    location.reload();
                }
            });
        });
    }

}
function removeUser(name) {
    if (confirm("Do you want remove " + name.split("_")[0] + " ?")) {
        getData("/acls/" + name.split("_")[2]).then(response => response.json())
        .then(acl_datas => {
            acl_datas.readers = acl_datas.readers.filter(item => item !== name.split("_")[1]);
            acl_datas.writers = acl_datas.writers.filter(item => item !== name.split("_")[1]);
            putData('/acls/' + name.split("_")[2], acl_datas).then(respons => {
                if (respons.status == 200) {
                    $('#acl_user')[0].reset();
                    data = {};
                    $('#drop').multiselect('refresh');
                    loadTable(name.split("_")[2], name.split("_")[3]);
                    dropdown(name.split("_")[2]);
                }
            });
        });
    }

}

function dropdown(recipient) {
    const select_drop = document.getElementById('select_drop');
    var selectDrop = '';
    getData("/objects/?query=type:User")
        .then(response => response.json())
        .then(data => {
            getData("/acls/" + recipient).then(response => response.json())
                .then(acl_datas => {
                    var setUsers = new Set();
                    if (!!acl_datas && typeof acl_datas.readers !== "undefined" && acl_datas.readers !== null
                        && typeof acl_datas.writers !== "undefined" && acl_datas.writers !== null) {
                        acl_datas.readers.forEach(elt => {
                            setUsers.add(elt);
                        });
                        acl_datas.writers.forEach(elt => {
                            setUsers.add(elt);
                        });
                    }
                    selectDrop += '<select id="drop" name="users[]"  multiple="multiple" class="form-select-lg" style="display: none;"  required>';
                    if (!setUsers.has("public")) {
                        selectDrop += '<option value="public">Public</option>';
                    }
                    data.results.forEach(element => {
                        if (!setUsers.has(element.content['@id']))
                            selectDrop += '<option value="' + element.content['@id'] + '">' + element.content['name'] + '</option>';
                    });
                    selectDrop += '</select>';
                    select_drop.innerHTML = selectDrop;
                    $('#drop').multiselect({
                        nonSelectedText: 'Select a User',
                        enableFiltering: true,
                        enableCaseInsensitiveFiltering: true,
                        enableFullValueFiltering: true
                    });
                });

        });
}