function showFile() {
    //var demoImage = document.querySelector('img');
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();
    var file_save=[];
    var item={};
    reader.onload = function () {
        item["upload"]=reader.result;
        file_save.push(item); 
    }
    reader.readAsBinaryString(file);
     //reader.readAsDataURL(file);
    return file_save;
 }