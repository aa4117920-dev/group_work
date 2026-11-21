console.log("teams made-presenter .........")
let body=document.body;
let login_page = document.getElementById("login-page");
console.log(login_page)
login_page.style.animation="";
setTimeout(()=>{
	login_page.style.animation="log-start 2s ease-in-out";
	setTimeout(()=>{
	login_page.style.opacity="0";
		setTimeout(()=>{
			inserting_start();
		},200);
	},1800);
},100);

function inserting_start() {
  body.innerHTML = `<h1 id="main-page-heading">Represent with Group</h1>

<section id="presentation-section">
	<div id="presenation-nav">
			<button class="pr-btn">P1</button>
			<button class="pr-btn">P2</button>
			<button class="pr-btn">P3</button>
	</div>
	<div id="presentation-hero">
		<p id="presenation-block">
			this is s
		</p>
		<div id="present-button-section">
			<button class="function-btn">Back</button>
			<button class="function-btn">Next</button>
		</div>
	</div>
</section>`;

  let script = document.createElement("script");
  script.src = "./db.js";
  script.onload = () => {
    console.log("db.js connected!");

    let script2 = document.createElement("script");
    script2.src = "./presentation.js";
    script2.onload = () => {
      console.log("presentation.js connected!");
      if (typeof initPresentation === "function") {
        initPresentation();
      }
    };
    script2.onerror = () => console.error("presentation.js load nahi hui!");
    document.body.appendChild(script2);
  };
  script.onerror = () => console.error("db.js load nahi hui!");

  document.body.appendChild(script);
  return true;
}