document.getElementById('kt_sign_in_form').addEventListener('submit', function(event) {
    event.preventDefault(); // Formun varsayılan davranışını durdurur
    const form = event.target;
    const nameInput = document.querySelector('#name'); // Veya document.getElementById('name');
const passwordInput = document.querySelector('#password');

    const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "name": nameInput.value,
  "password": passwordInput.value
});


const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

fetch("http://localhost:3000/login", requestOptions)
  .then((response) => response.text())
  .then((result) => {
    console.log(result);
    const jsonResult = JSON.parse(result);
    if (jsonResult.login === true) {
        window.location.href = "/public/dashboard.html"; // Başarılı giriş sonrası yönlendirme
      } else {
        alert("Giriş başarısız! Lütfen bilgilerinizi kontrol edin."); // Giriş başarısızsa uyarı ver
      }


  })
  .catch((error) => console.error(error));
});
