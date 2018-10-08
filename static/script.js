username.textContent = getCookie('username');

fetch('/info', {
  method: 'GET',
  credentials: 'include'
}).then((raw) => {
  return raw.json();
}).then((json) => {
  if (json.code === 0) {
    alert(json.msg);
  }
  console.log(json.data);
});

function getCookie(key) {
  let cookie = document.cookie.split(';');
  for (let i = 0; i < cookie.length; i++) {
    if (cookie[i].split('=')[0].trim() === key) {
      return cookie[i].split('=')[1];
    }
  }
}

// var a = {
//   code: 0,
//   msg: '',
//   data: {
//     username: '',
//     role: '',
//     menu: []
//   }
// }