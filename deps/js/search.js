
const search = document.getElementById('search');
const matchList = document.getElementById('match-list');

// Search the user.json

const searchUser =  searchText =>{
    const res = getData("/objects/?query=type:User")
    .then(response => response.json()
    ).then(data => {
        let macthes = data.results.filter(user =>{
            const regex = new RegExp(`^${searchText}`, 'gi');
            console.log(searchText);
                return user.content.name.match(regex) || user.content.username.match(regex) ;
        });
        if(searchText.length <= 2){
            macthes=[];
        }
        console.log(macthes);
    });
    //const user = await res.json();
 
   // console.log(res);
};
if(search){
    search.addEventListener('input', ()=> searchUser(search.value));
}

