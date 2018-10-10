function setPersonInfo(username, role) {
  document.getElementById('username').textContent = username;
  document.getElementById('role').textContent = role;
}

function render(privilege) {

}

function compTemplate(isDownload, author, comp) {
  return
  `<div class='com'>
    <div class='info'>${comp}</div>
      <div>
        <label>作者:</label>
        <label>${author}</label>
      </div>
     ${isDownload && "<button id='downloadBtn'>下载</button>"}
  </div>`;
}

function myCompTemplate(comp) {
  return
  `<div class='com'>
     <div class='info'>${comp}</div>
     <button>删除</button>
   </div>`;
}

function adminTemplate(users) {
  return 
  `
  `
}

fetch('/info', {
  method: 'GET',
  credentials: 'include'
}).then((raw) => {
  return raw.json();
}).then((json) => {
  if (json.code === 0) {
    return alert(json.msg);
  }
  const data = json.data;
  setPersonInfo(data.username, data.role.join(''));
  render(data.privilege);
});

function getCookie(key) {
  let cookie = document.cookie.split(';');
  for (let i = 0; i < cookie.length; i++) {
    if (cookie[i].split('=')[0].trim() === key) {
      return cookie[i].split('=')[1];
    }
  }
}
