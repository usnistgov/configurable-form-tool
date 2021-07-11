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
        content = decodeURIComponent(content).split("/");
        //window.history.replaceState(null, null, "?formname="+contentName);
        localStorage.setItem("redirect", "index.html?formname=" + content[0] + "&altname=" + content[1] + "&schema=" + content[2]);
        localStorage.setItem("message", "");
        window.location.replace("index.html?formname=" + content[0] + "&altname=" + content[1] + "&schema=" + content[2]);
    }
}

if (typeof GetURLParameter('formname') !== "undefined" && GetURLParameter('formname') !== null &&
    typeof GetURLParameter('altname') !== "undefined" && GetURLParameter('altname') !== null &&
    typeof GetURLParameter('schema') !== "undefined" && GetURLParameter('schema') !== null
) {

    var wrapperTable = document.getElementById("contentTab");
    var page_name = "";
    var urlValue = (decodeURIComponent(GetURLParameter('formname')) + "/" + GetURLParameter('altname') + "/" + GetURLParameter('schema')).split("/");

    getData("/objects/?query=type:" + urlValue[2] + " AND /formAlternateName:" + urlValue[1])
        .then(response => response.json())
        .then(data => {
            page_name = "<h1 class='page-header'>" + urlValue[0].charAt(0).toUpperCase() + urlValue[0].slice(1);
            page_name += "<span style='float: right; margin-left: 10px;margin-right: 20px;'> <button class='btn btn-primary' onclick=createForm('" + urlValue[1] + "')> New " + urlValue[0] + " </button></span></h1>";

            var tableHTML = " <div id='" + urlValue[1] + "' class='table-responsive' >"
                + " <div style='overflow-x:auto;'><table  id='table_id' class='table table-striped table-bordered'>"
                + "<thead>"
                + "<tr>"
                + "<th scope='col'>Persistent Identifier</th>"
                + "<th scope='col'>Name</th>"
                + "<th></th>"
                + " </tr>"
                + " </thead>"
                + "<tbody>";
            var tableElmt = "";
            data.results.forEach(element => {
                if (!!element.content) {
                    tableElmt = element.content['@id'];
                    var id = tableElmt.split("/");
                    tableHTML += "<tr>"
                    tableHTML += "<th scope='row'>" + element.content['@id'] + "</th>";
                    tableHTML += (!!element.content['name']) ? "<td>" + element.content['name'] + "</td>" : "<td></td>";
                    tableHTML += "<td>";
                    tableHTML += (!!element['id']) ? "<button type='button' class='btn btn-primary' onclick=OpenBtnPage('edit_" + element.content['@id'] + "_" + element['type'] + "')>"
                        + "<span class='glyphicon glyphicon-pencil'></span></button>" : " ";
                    tableHTML += (!!element['id']) ? "<button type='button' class='btn btn-danger' data-toggle='modal' data-target='#delete" + id[1] + "' >"
                        + "<span class='glyphicon glyphicon-remove'></span></button>"
                        + "<div class='modal fade' id='delete" + id[1] + "' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'>"
                        + "<div class='modal-dialog modal-sm' role='document'>"
                        + " <div class='modal-content'>"
                        + "<div class='modal-body'>"
                        + "Do you want to delete : <strong>" + element.content['name'] + "</strong> ?"
                        + "</div>"
                        + "<div class='modal-footer'>"
                        + "<button type='button' class='btn btn-default' data-dismiss='modal'>No</button>"
                        + "<button type='button' class='btn btn-primary' onclick=OpenBtnPage('delete_" + element.content['@id'] + "_" + element['type'] + "')>Yes</button>"
                        + "</div>"
                        + "</div>"
                        + "</div>"
                        + "</div>"
                        : " ";
                    tableHTML += (!!element['id']) ? "<button type='button' class='btn btn-info' onclick=OpenBtnPage('view_" + element.content['@id'] + "_" + element['type'] + "')>"
                        + "<span class='glyphicon glyphicon-eye-open'></span></button>" : " ";
                    tableHTML += (!!element['id']) ? "<button type='button' class='btn btn-primary' data-toggle='modal' data-id='" + element.content['@id'] + "' data-target='#shareModal'>"
                        + "<i class='fas fa-share-alt'></i></button>"
                        + "<div class='modal fade' id='shareModal' role='dialog'  tabindex='-1'  >"
                        + "<div class='modal-dialog modal-lg' role='document'>"
                        + " <div class='modal-content'>"
                        + "  <div class='modal-header'>"
                        + "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"
                        + "<h4 class='modal-title' id='myModalLabel'>Share</h4>"
                        + "</div>"
                        + "<div class='modal-body'>"
                        + "<form id='acl_user' class='form-inline'>"
                        + "<div class='form-group' id='select_drop'>"
                        + "</div>"
                        + "<div class='checkbox'> <label>"
                        + "<input type='checkbox' id='read' name='read' value='read' required>Can Read"
                        + "</label></div>"
                        + "<div class='checkbox'> <label>"
                        + "<input type='checkbox' id='write'  name='write' value='write' required>Can write"
                        + "</label></div>"
                        + "<button  type='submit' id='submit_btn' class='btn btn-default'>Add</button>"
                        + "</form>"
                        + "<hr>"
                        + "<div id='table_user'></div>"
                        + "</div>"
                        + "<div class='modal-footer'>"
                        + "<button type='button' class='btn btn-default' data-dismiss='modal'>No</button>"
                        + "<button type='button' class='btn btn-primary' onclick=OpenBtnPage('share_" + element.content['@id'] + "_" + element['type'] + "')>Yes</button>"
                        + "</div>"
                        + "</div>"
                        + "</div>"
                        + "</div>"
                        : " ";
                    tableHTML += "</td></tr>";
                }
            });
            document.getElementById("page-header").innerHTML = page_name;
            tableHTML += "</tbody></table></div></div>";
            if (!!tableElmt)
                wrapperTable.innerHTML = tableHTML;
            else
                wrapperTable.innerHTML = "";
            $('#table_id').DataTable();
            $('#shareModal').on('hidden.bs.modal', function (e) {
                $('#acl_user')[0].reset();
                location.reload();
            });
            $('#shareModal').on('show.bs.modal', function (event) {

                var button = $(event.relatedTarget); // Button that triggered the modal
                var recipient = button.data('id'); // Extract info from data-* attributes   

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
                                    loadTable(recipient);
                                    dropdown(recipient);
                                }
                            });

                        });
                });
                loadTable(recipient);
                dropdown(recipient);
                
            });

        });
}

function loadTable(recipient) {
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
                tableUsers += " <div class='table-responsive' ><table  id='tableUser'  class='table table-striped table-bordered'>";
                tableUsers += "<thead><tr><th scope='col'>Persistent Identifier</th><th scope='col'>Can Read?</th><th>Can Write?</th><th></th></thead>";
               
                acl_datas.readers.forEach(elt => {
                    if (!!elt && elt.length > 0)
                        setUsers.set(elt, { readers: true });
                });
                acl_datas.writers.forEach(elt_2 => {
                    if (!!elt_2 && elt_2.length > 0)
                        if (!!setUsers.get(elt_2)) {
                            setUsers.set(elt_2, { ...setUsers.get(elt_2), writers: true });
                        } else {
                            setUsers.set(elt_2, { writers: true });
                        }
                });
                data.results.forEach(element => {
                    if (setUsers.has(element.content['@id'])){
                        setUsers.set(element.content['@id'], { ...setUsers.get(element.content['@id']), name: element.content['name'] });
                    }
                });
                for (const [key, value] of setUsers.entries()) {
                    tableUsers += (!!value.name && typeof value.name !== "undefined") ? "<td>" + value.name + "</td>" : "<td> </td>";
                    tableUsers += (!!value.readers && typeof value.readers !== "undefined") ? "<td>" + value.readers + "</td>" : "<td> false</td>";
                    tableUsers += (!!value.writers && typeof value.writers !== "undefined") ? "<td>" + value.writers + "</td>" : "<td> false</td>";
                    tableUsers += "<td>";
                    tableUsers += (!!key) ? "<button type='button'  class='btn btn-danger' onclick='myFunction()' data-target='#delete" + key.split("/")[1] + "' >"
                        + "<span class='glyphicon glyphicon-remove'></span></button>"
                        + "<div class='modal fade' id='delete" + key.split("/")[1]  + "' tabindex='-1'  role='dialog'>"
                        + "<div class='modal-dialog modal-sm' role='document'>"
                        + " <div class='modal-content'>"
                        + "<div class='modal-body'>"
                        + "Do you want to delete : <strong>" + value.name  + "</strong> ?"
                        + "</div>"
                        + "<div class='modal-footer'>"
                        + "<button type='button' class='btn btn-default' data-dismiss='modal'>No</button>"
                        + "<button type='button' class='btn btn-primary' onclick=OpenBtnPages('delete_" + key  + "')>Yes</button>"
                        + "</div>"
                        + "</div>"
                        + "</div>"
                        + "</div>"
                        : " ";
                    tableUsers+="</td></tr>";

                }
                tableUsers += "</table></div>";
                table_user.innerHTML = tableUsers;
                $('#tableUser').DataTable();
            }
            });
    });
   
}
function myFunction() {
    var txt;
    if (confirm("Press a button!")) {
      txt = "You pressed OK!";
    } else {
      txt = "You pressed Cancel!";
    }
    console.log(txt);
  }

function dropdown(recipient){
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
                    selectDrop += '<select id="drop" name="users[]"  multiple="multiple" class="form-control" required>';
                    data.results.forEach(element => {
                        if (!setUsers.has(element.content['@id']))
                            selectDrop += '<option value="' + element.content['@id'] + '">' + element.content['name'] + '</option>';
                    });
                    selectDrop += '</select>';

                    select_drop.innerHTML = selectDrop;

                    $('#drop').multiselect({
                        nonSelectedText: 'Select User',
                        enableFiltering: true,
                        enableCaseInsensitiveFiltering: true,
                        enableFullValueFiltering: true
                    });
                });

        });
}