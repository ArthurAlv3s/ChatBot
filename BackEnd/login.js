const users = [
    {username: 'user1', password: 'senha123'},
    {username: 'user2', password: '12345678'}

];

function loginUser(username, password) {

    const user = users.find(user => user.username === username && user.password === password)
    return user;

}

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = loginUser('username, password');

    if(user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        window.location.href = 'index.html';
    } else {
        document.getElementById('error-message').innerText = 'Usuário ou Senha Incorretos!'
        
      }});