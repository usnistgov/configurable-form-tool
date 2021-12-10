/// Load this script to require the user to be logged in before allowing access.

// frontmatter forces jekyll to parse this 
const authdata = tryGetAuth();
if (null !== authdata) {
	// do nothing, let page continue loading
	
	const intro_ret =  postData('/auth/introspect', { token: authdata.token })
	.then(response => response.json())
        .then(data => {
			if(data.active == false){
				window.location.replace("login/index.html");
			}
		});
	//console.log(  intro_ret);
} else {
	// FORCE LOGIN HERE
	window.location.replace("login/index.html");
}