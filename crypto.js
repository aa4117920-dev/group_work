console.log("crypto connected.......")

async function crypto_stratergy(pass, feild) {
  const API_URL = "https://script.google.com/macros/s/AKfycbw_YShspK9Cyw6z2IRgWBI5_ZJkZfANRYSFgY6TOJn1-sFjnziEs5mPMU5zZB0lC_YQKg/exec";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8" // CORS error se bachne ke liye
      },
      // Data ko string bana kar bhej rahe hain
      body: JSON.stringify({
        password: pass,
        field: feild
      })
    });

    const result = await response.json(); // { login: true } ya { login: false }
  // alert("send")
 console.log(result)
    return result.login; 
  } catch (error) {
    console.error("API Error:", error);
  alert("error")
    return false;
  }

}
