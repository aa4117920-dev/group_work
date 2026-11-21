console.log("engine connected.....");
let currentRevision = 0;
let isSyncing = false;
let lastTypeTime = 0;

let code_box = document.getElementById("code-box");
let code_code = document.getElementById("code-code");
let update_btn = document.getElementById("update-btn");
let reload_btn = document.getElementById("reload-btn");

var base_code = {};  // Jo code aakhri baar cloud se sync hua tha
var typed_code = {}; // Local user ka current code

const API_URL = "https://script.google.com/macros/s/AKfycbzvtodzpkEEOCMntzQVnEbVWhpEFwplvjF50vd460xh0ANkXp-ADptVkuQ2fcV8ML0cbg/exec";

// Helper: Textarea ki lines ko object mein convert karein
function getLinesObject(text) {
  let lines = text.split("\n");
  let obj = {};
  for (let i = 0; i < lines.length; i++) {
    obj["l" + (i + 1)] = lines[i];
  }
  return obj;
}

// Helper: Pata lagayein user ka cursor abhi kis line par hai (0-based index)
function getActiveLineIndex() {
  let pos = code_code.selectionStart || 0;
  return code_code.value.substring(0, pos).split("\n").length - 1;
}

// Track karein user kab type kar raha hai
code_code.addEventListener("input", () => {
  lastTypeTime = Date.now();
});

// ==========================================
// UPDATE BUTTON: SIRF APNI EDITED LINES BHEJEIN
// ==========================================
update_btn.addEventListener("click", async () => {
  if (isSyncing) return;

  try {
    isSyncing = true;
    update_btn.innerText = "Updating...";
    update_btn.disabled = true;

    typed_code = getLinesObject(code_code.value);

    // Sirf woh lines nikalen jo is user ne base_code ke muqable mein badli hain
    let linesToUpdate = {};
    let hasChanges = false;
    let totalLocalLines = Object.keys(typed_code).length;
    let maxLines = Math.max(totalLocalLines, Object.keys(base_code).length);

    for (let i = 1; i <= maxLines; i++) {
      let key = "l" + i;
      let localLine = typed_code[key];
      let baseLine = base_code[key];

      if (localLine !== baseLine) {
        if (localLine !== undefined) {
          linesToUpdate[key] = localLine;
        }
        hasChanges = true;
      }
    }

    if (!hasChanges) {
      alert("Koi nayi tabdeeli nahi mili!");
      return;
    }

    const postResponse = await fetch(API_URL, {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify({
        updates: linesToUpdate,
        totalLines: totalLocalLines
      })
    });

    const postResult = await postResponse.json();

    if (postResult.status === "success") {
      // Bheji gayi lines ko base_code mein update karein
      for (let key in linesToUpdate) {
        base_code[key] = linesToUpdate[key];
      }
      // Extra deleted keys hatayein
      Object.keys(base_code).forEach(k => {
        if (Number(k.substring(1)) > totalLocalLines) delete base_code[k];
      });

      alert("Code successfully updated!");
      // Foran latest cloud changes bhi pull kar lein taake doosre user ki lines aa jayein
      isSyncing = false;
      await autoCheckUpdates(true);
    } else {
      throw new Error(postResult.message);
    }

  } catch (error) {
    console.error("Sync Error:", error);
    alert("Error aaya: " + error.message);
  } finally {
    isSyncing = false;
    update_btn.innerText = "Update";
    update_btn.disabled = false;
  }
});

// ==========================================
// PAGE OPEN HONE PAR CLOUD SE DATA LANE KA FUNCTION
// ==========================================
async function loadCloudCode() {
  try {
    code_code.placeholder = "Cloud se code load ho raha hai...";
    code_code.disabled = true;

    const response = await fetch(API_URL, {
      method: "GET",
      redirect: "follow",
      cache: "no-store"
    });

    const result = await response.json();

    if (result.status === "success") {
      currentRevision = result.revision;
      base_code = { ...result.data };
      typed_code = { ...result.data };

      let keys = Object.keys(base_code).sort((a, b) => {
        return parseInt(a.replace("l", "")) - parseInt(b.replace("l", ""));
      });

      let loadedLines = keys.map(k => base_code[k]);
      code_code.value = loadedLines.join("\n");

      console.log("Page load par cloud code aa gaya:", base_code);
    } else {
      console.error("Cloud se data lane mein masla:", result.message);
    }
  } catch (error) {
    console.error("Load Error:", error);
    code_code.placeholder = "Code load nahi ho saka. Apna code yahan likhein...";
  } finally {
    code_code.disabled = false;
    code_code.placeholder = "Apna code yahan likhein...";
  }
}

loadCloudCode();

// ==========================================
// RELOAD BUTTON
// ==========================================
reload_btn.addEventListener("click", () => {
  window.location.href = "./group-code.html";
});

// ==========================================
// HAR 3 SECOND BAAD LIVE CHECK & MERGE
// ==========================================
async function autoCheckUpdates(force = false) {
  if (isSyncing && !force) return;

  try {
    const response = await fetch(
      API_URL + "?since=" + currentRevision,
      { method: "GET", redirect: "follow", cache: "no-store" }
    );

    const result = await response.json();
    if (result.status !== "success") return;
    if (result.revision <= currentRevision) return;

    // Cursor position save karein taake typing ke dauran cursor jump na kare
    let selStart = code_code.selectionStart;
    let selEnd = code_code.selectionEnd;
    let activeLine = getActiveLineIndex();
    let isActivelyTyping = (Date.now() - lastTypeTime) < 1200; // 1.2s ke andar type kiya ho

    let localLines = code_code.value.split("\n");
    let cloudData = result.data || {};
    let cloudKeys = Object.keys(cloudData);
    let cloudTotalLines = cloudKeys.length;

    // Kaun si keys cloud par badli hain
    let changedKeys = new Set();
    if (result.changes && result.changes.length > 0) {
      result.changes.forEach(change => {
        (change.updatedKeys || []).forEach(k => changedKeys.add(k));
      });
    } else {
      cloudKeys.forEach(k => changedKeys.add(k));
    }

    // Sirf woh lines apply karein jo cloud par badli hain (ya nayi add hui hain)
    for (let i = 1; i <= cloudTotalLines; i++) {
      let key = "l" + i;
      let idx = i - 1;

      // Agar user abhi isi line par type kar raha hai to is line ko skip karein
      if (isActivelyTyping && idx === activeLine && !force) {
        continue;
      }

      if (changedKeys.has(key) || idx >= localLines.length) {
        // Sirf tab overwrite karein jab local user ne khud is line mein un-saved edit na kiya ho
        let isLocallyModified = (localLines[idx] !== undefined && localLines[idx] !== base_code[key]);
        if (!isLocallyModified || force) {
          localLines[idx] = cloudData[key] ?? "";
        }
      }
    }

    // Agar doosre user ne aakhir se lines delete ki hain aur local user ne wahan kuch naya nahi likha
    if (cloudTotalLines < localLines.length && !isActivelyTyping) {
      let canTrim = true;
      for (let j = cloudTotalLines; j < localLines.length; j++) {
        if (localLines[j] !== (base_code["l" + (j + 1)] ?? "")) {
          canTrim = false;
          break;
        }
      }
      if (canTrim && cloudTotalLines > 0) {
        localLines.length = cloudTotalLines;
      }
    }

    let newText = localLines.join("\n");
    if (code_code.value !== newText) {
      code_code.value = newText;
      // Cursor wapas apni jagah set karein
      code_code.setSelectionRange(selStart, selEnd);
    }

    base_code = { ...cloudData };
    currentRevision = result.revision;

    console.log("Live sync updated to revision:", currentRevision);

  } catch (error) {
    console.error("Live update error:", error);
  }
}

setInterval(autoCheckUpdates, 3000);


function highlightHtmlByText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Pehle se maujood plain text nikaalein (agar dobara highlight karna ho to)
  const rawCode = el.innerText;

  // HTML characters ko escape karein taake browser unhein real DOM tags na samjhe
  const escaped = rawCode
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Tags (<...>) ko match karke unke andar tag name, attributes aur values ko color karein
  const coloredHtml = escaped.replace(
    /(&lt;\/?)([a-zA-Z0-9-]+)([\s\S]*?)(\/?&gt;)/g,
    (match, openBracket, tagName, attrs, closeBracket) => {
      // Attributes aur unki values ko color karein
      const coloredAttrs = attrs.replace(
        /([a-zA-Z0-9-:@]+)(\s*=\s*)(&quot;.*?&quot;|&#039;.*?&#039;|"[^"]*"|'[^']*')/g,
        (attrMatch, attrName, eqSign, attrVal) => {
          return (
            `<span style="color: #9cdcfe;">${attrName}</span>` +
            `<span style="color: #d4d4d4;">${eqSign}</span>` +
            `<span style="color: #ce9178;">${attrVal}</span>`
          );
        }
      );

      return (
        `<span style="color: #808080;">${openBracket}</span>` +
        `<span style="color: #569cd6; font-weight: 600;">${tagName}</span>` +
        coloredAttrs +
        `<span style="color: #808080;">${closeBracket}</span>`
      );
    }
  );

  // Tags ke bahar jo normal text bachta hai usay bhi color dein
  const finalHtml = coloredHtml
    .split(/(<span[\s\S]*?<\/span>)/g)
    .map((part) => {
      if (part.startsWith("<span")) return part;
      // Agar part mein sirf spaces/newlines hain to waisa hi rehne dein
      if (!part.trim()) return part;
      return `<span style="color: #e5e7eb;">${part}</span>`;
    })
    .join("");

  el.innerHTML = finalHtml;
}
highlightHtmlByText("code-code");