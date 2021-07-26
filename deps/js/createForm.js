/*
   * Function which helps to create Form
   */
function createForm(formname) {
    localStorage.setItem("message", "");
    var html = "";
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
                        if (!!document.querySelector('input[type=file]')) {
                            var file = document.querySelector('input[type=file]').files[0];
                            var data_form = new FormData();
                            data_form.append('content', JSON.stringify(values));
                            data_form.append('name', 'file');
                            data_form.append('upload', file);
                            fetch(CORDRA_HTTPS_URL + '/objects/?type=' + element.content.cordraSchema, {
                                method: 'POST',
                                headers: {
                                    'Authorization': 'Bearer ' + authdata['token'],
                                },
                                body: data_form
                            }).then(response => response.json())
                                .then(r => {
                                    if (response.status == 200) {
                                        const data = {
                                            "readers": [sessionStorage.getItem("userId")],
                                            "writers": [sessionStorage.getItem("userId")]
                                        };
                                        putData('/acls/' + r['@id'], data).then(response => {
                                            if (response.status == 200) {
                                                document.getElementById("msg").style.display = "block";
                                                $("#msg").hide(1000);
                                                alert("The form was submitted successfully.");
                                                $('form#' + element.content.alternateName)[0].reset();
                                                localStorage.setItem("message", "The form was submitted successfully.");
                                                window.location.replace(localStorage.getItem("redirect"));
                                            }
                                        });
                                    }
                                });
                        } else {
                            postData('/objects/?type=' + element.content.cordraSchema, values)
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
                                                    alert("The form was submitted successfully.");
                                                    $('form#' + element.content.alternateName)[0].reset();
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
            });
        });
}