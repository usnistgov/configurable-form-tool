/*
   * Function which helps to create Form
   */
if (typeof GetURLParameter('mode') !== "undefined" && GetURLParameter('mode') !== null && GetURLParameter('mode') === "create" &&
    typeof GetURLParameter('form') !== "undefined" && GetURLParameter('form') !== null) {
    var page_name = "";
    getData("/objects/" + GetURLParameter('form'))
        .then(response => response.json())
        .then(form_val => {
            page_name = "<h1 class='h1'>" + form_val.name.charAt(0).toUpperCase() + form_val.name.slice(1) + "</h1>";
            var formname = form_val.alternateName + "/" + form_val.cordraSchema;
            createForm(formname);
            document.getElementById("page-header").innerHTML = page_name;
        });
}
function createForm(formname) {
    localStorage.setItem("message", "");
    var html = "";
    var FormCreate = document.getElementById("contentTab");
    formname = formname.split("/");
    getData("/objects/?query="+formname[1]+" AND /alternateName:" + formname[0])
    .then(response => response.json())
    .then(data => {
        var formatValues = { "enum": [], "titleMap": {} };
        var values = {};
        var selectValues = [];
        data.results.forEach(element => {
            html += "<form id=" + element.content.alternateName + "> </form>";
            FormCreate.innerHTML = html;
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
                        createFormJson(element.content);
                    });

            } else {
                createFormJson(element.content);
            }
        });
    });
}

function createFormJson(content) {
    var files = content.form.filter(item => item.type === "file");
    $('form#' + content.alternateName).jsonForm({
        "schema": content.schema,
        "form": content.form,
        "onSubmitValid": function (values) {
            if (!!document.querySelector('input[type=file]')) {
                var data_form = new FormData();
                files.forEach(item => {
                    var file = document.querySelector('input[name=' + item['key'] + ']').files[0];
                    if (file) {
                        data_form.append(item['key'], file);
                        values[item['key']] = new URLSearchParams({ payload: item['key'], disposition: 'attachment'}).toString();
                    } else {
                        values[item['key']] = "";
                    }
                    
                });
                data_form.append('content', JSON.stringify(values));
               fetch(CORDRA_HTTPS_URL + '/objects/?type=' + content.cordraSchema, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + authdata['token']
                    },
                    body: data_form
                }).then(response => response.json())
                .then(r => {
                    if (response.status == 200) {
                        let data = {
                            "readers": [sessionStorage.getItem("userId")],
                            "writers": [sessionStorage.getItem("userId")],
                        };
                        files.forEach(item => {
                            if (r[item['key']]) {
                                values[item['key']] = CORDRA_HTTPS_URL + '/objects/' + r['@id'] + '?' +
                                    new URLSearchParams({ payload: item['key'], disposition: 'attachment' }).toString();
                            }
                        });
                        putData('/objects/' + r['@id'], values).then(resp => resp.status);
                        putData('/acls/' + r['@id'],data).then(response => {
                            if (response.status == 200) {
                                document.getElementById("msg").style.display = "block";
                                $("#msg").hide(1000);
                                $('form#' + content.alternateName)[0].reset();
                                localStorage.setItem("message", "The form was submitted successfully.");
                                window.location.replace(localStorage.getItem("redirect"));
                            }
                        });
                    }
                });
            } else {
                postData('/objects/?type=' + content.cordraSchema, values)
                .then(response => {
                    if (response.status == 200) {
                        response.json().then(value => {
                            const data = {
                                "readers": [sessionStorage.getItem("userId")],
                                "writers": [sessionStorage.getItem("userId")]
                            };
                            putData('/acls/' + value['@id'], data).then(response => {
                                if (response.status == 200) {
                                    document.getElementById("msg").style.display = "block";
                                    $("#msg").hide(1000);
                                    $('form#' + content.alternateName)[0].reset();
                                    localStorage.setItem("message", "The form was submitted successfully.");
                                    window.location.replace(localStorage.getItem("redirect"));
                                }
                            });
                        });
                    }
                });
            }

        }
    });
}