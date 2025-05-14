document.addEventListener('DOMContentLoaded', () => {
    const loginform = document.getElementById('login-form');
    const registroform = document.getElementById('registro-form');

    const loginlink = document.querySelector('a [href="login.html"]');
    const registrolink = document.querySelector('a[href="registro.html"');

    loginlink.addEventListener('click', () => {
        loginform.style.display = 'block';
        registroform.style.display = 'none';
        
    });

    registrolink.addEventListener('click', () => {
        loginform.style.display = 'block';
        registroform.style.form = 'none';

    });
});