console.log("connected............");

let login_form = document.getElementById("login-form");
let login_pass = document.getElementById("login-password");
let login_select = document.getElementById("login-selection");
var status_login = false;

// Form submit event ko 'async' banaya taake 'await' dono jagah chal sake
login_form.addEventListener('submit', async (e) => {
  // 1. Page ko reload hone se rokein
  e.preventDefault(); 

  const userValue = login_pass.value;
  const userField = login_select.value;

  const existingScript = document.querySelector('script[for="justpass"]');

  if (!existingScript) {
    const crypto = document.createElement("script");
    crypto.src = "./crypto.js";
    crypto.setAttribute("for", "justpass");

    crypto.onload = async () => {
      status_login = await crypto_stratergy(userValue, userField);
      console.log("Login Status:", status_login);
      
      if (status_login === true) {
        connect_member(userField);
      }
    };

    document.body.append(crypto);
  } else {
    // Doosri baar submit karne par bhi await aur connect_member chalega
    status_login = await crypto_stratergy(userValue, userField);
    console.log("Login Status (2nd try):", status_login);

    if (status_login === true) {
      connect_member(userField);
    }
  }
});

async function connect_member(feild) {
  const member = {
    "pstr": "./presenter_team-made.js",
    "ft-end": "./frontend_team-made.js",
    "bk-end": "./backend_team-made.js",
    "dbms": "./dbms_team-made.js",
  };

  const scriptPath = member[feild];

  if (scriptPath) {
    console.log("Loading script:", scriptPath);
    // Check karein ke member ki script pehle se load to nahi
    if (!document.querySelector(`script[src="${scriptPath}"]`)) {
      const memberScript = document.createElement("script");
      memberScript.src = scriptPath;
      document.body.append(memberScript);

    }
  } else {
    console.log("Invalid field selected:", feild);
  }
}
