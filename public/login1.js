document.getElementById('kt_sign_in_form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Formun varsayılan davranışını durdurur
    const nameInput = document.querySelector('#name').value.trim();
    const passwordInput = document.querySelector('#password').value.trim();

    if (!nameInput || !passwordInput) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }

    const raw = JSON.stringify({
        name: nameInput,
        password: passwordInput
    });

    const requestOptions = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: raw
    };

    try {
        const response = await fetch("http://localhost:3000/login", requestOptions);
        const result = await response.json();

        if (!response.ok) {
            alert(result.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            return;
        }

        // JWT token'ı tarayıcıya kaydediyoruz
        if (result.token) {
            localStorage.setItem('token', result.token);
            alert('Başarıyla giriş yapıldı.');
            window.location.href = "/public/dashboard.html"; // Başarılı giriş sonrası yönlendirme
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
});
