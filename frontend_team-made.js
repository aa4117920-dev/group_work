console.log("teams made-frontend .........")
let body=document.body;
let login_page = document.getElementById("login-page");
console.log(login_page)
login_page.style.animation="";
setTimeout(()=>{
	login_page.style.animation="log-start 2s ease-in-out";
	setTimeout(()=>{
		inserting_start();
	},2100);
},100);

function inserting_start(){
console.clear();
body.innerHTML=`
		<h1 id="main-page-heading">Code with Group</h1>
<section id="code-section">
	
	<!-- nav bar -->
	<div id="code-nav">
		<button class="function-btn" id="update-btn">Update</button>
		<button class="function-btn" id="reload-btn" target="_blank">Reload</button>
		<a id="preview-btn"  target="_blank "href="./preview.html">Preview</a>
	</div>
		
		<!-- code box -->
	<div id="code-box">
		<textarea id="code-code" title="Write the web code" spellcheck="false"> fdfs</textarea>
	</div>

</section>
`;	
    let script = document.createElement("script");
    script.src = "./engine.js";
    script.onload = () => console.log("engine.js connected!");
    script.onerror = () => console.error("engine.js load nahi hui!");
    document.body.appendChild(script);
return true;
}

