let code_box = document.getElementById("code-box");
let code_code = document.getElementById("code-code");
let update_btn = document.getElementById("update-btn");
let reload_btn=document.getElementById("reload-btn");


var typed_code = {}; // Local user ka code
var cloud_code = {}; // Google Sheet (Cloud) ka code

const API_URL = "https://script.google.com/macros/s/AKfycbygEwCYqzK4U5-u5UHU9XdYPPI8FWU_ulOAcHGAYEybAUMZnbKTfGWnyIempkMkcOJRYg/exec";

update_btn.addEventListener('click', async () => {
  try {
    update_btn.innerText = "Checking Cloud...";
    update_btn.disabled = true;

    // STEP A: Textarea ki current lines ko typed_code object mein banayein
    let lines = code_code.value.split("\n");
    typed_code = {};
    for (let i = 0; i < lines.length; i++) {
      typed_code["l" + (i + 1)] = lines[i];
    }

    // STEP B: GET Request (Bina headers ke)
    const getResponse = await fetch(API_URL, {
      method: "GET",
      redirect: "follow"
    });
    const getResult = await getResponse.json();

    if (getResult.status === "success") {
      cloud_code = getResult.data;
      console.log("Cloud se aaya hua data:", cloud_code);
    } else {
      throw new Error(getResult.message);
    }

    // STEP C: Line by Line Compare karein
    let linesToUpdate = {};
    let hasChanges = false;

    for (let key in typed_code) {
      if (cloud_code[key] !== typed_code[key]) {
        linesToUpdate[key] = typed_code[key];
        hasChanges = true;
      }
    }

    let cloudLineCount = Object.keys(cloud_code).length;
    let localLineCount = Object.keys(typed_code).length;

    if (!hasChanges && cloudLineCount === localLineCount) {
      console.log("Koi change nahi mila! Sheet pehle se updated hai.");
      alert("Koi nayi tabdeeli nahi mili!");
      return;
    }

    // STEP D: POST Request (Bina headers ke aur redirect: "follow" ke sath)
    console.log("Sirf yeh lines update ho rahi hain:", linesToUpdate);
    update_btn.innerText = "Updating...";

    const postResponse = await fetch(API_URL, {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify({
        updates: linesToUpdate,
        totalLines: localLineCount
      })
    });

    const postResult = await postResponse.json();
    console.log("Update Response:", postResult);
    // alert("Updated lines: " + (postResult.updatedKeys.join(", ") || "Deleted extra lines"));

  } catch (error) {
    console.error("Sync Error:", error);
    alert("Error aaya: " + error.message);
  } finally {
    update_btn.innerText = "Update";
    update_btn.disabled = false;
  }
});
// ==========================================
// PAGE OPEN HONE PAR CLOUD SE DATA LANE KA FUNCTION
// ==========================================
async function loadCloudCode() {
  try {
    // Jab tak data load ho raha ho, textarea mein placeholder ya message dikhayein
    code_code.placeholder = "Cloud se code load ho raha hai...";
    code_code.disabled = true;

    // 1. API se GET request ke zariye data mangwayein
    const response = await fetch(API_URL, {
      method: "GET",
      redirect: "follow"
    });
    
    const result = await response.json();

    if (result.status === "success") {
      cloud_code = result.data; // Global cloud_code object mein save karein
      
      // 2. Object ki keys (l1, l2, l3...) ko tarteeb (l1, l2, l3...) se array mein nikalein
      let keys = Object.keys(cloud_code).sort((a, b) => {
        return parseInt(a.replace("l", "")) - parseInt(b.replace("l", ""));
      });

      // 3. Har line ka text array mein jama karein
      let loadedLines = [];
      for (let i = 0; i < keys.length; i++) {
        loadedLines.push(cloud_code[keys[i]]);
      }

      // 4. Tamam lines ko Enter (\n) ke sath jor kar textarea mein show kar dein
      code_code.value = loadedLines.join("\n");
      
      // Local typed_code ko bhi update kar dein taake dono sync rahein
      typed_code = { ...cloud_code };

      console.log("Page load par cloud code aa gaya:", cloud_code);
    } else {
      console.error("Cloud se data lane mein masla:", result.message);
    }

  } catch (error) {
    console.error("Load Error:", error);
    code_code.placeholder = "Code load nahi ho saka. Apna code yahan likhein...";
  } finally {
    // Loading khatam hone par textarea ko dubara likhne ke qabil banayein
    code_code.disabled = false;
    code_code.placeholder = "Apna code yahan likhein...";
  }
}

// Page open/load hote hi is function ko chalayein
window.addEventListener("DOMContentLoaded", loadCloudCode);


// =====================
// == Reload section  ==  
// =====================

reload_btn.addEventListener('click',()=>{
	window.location.href="./group-code.html";
});



