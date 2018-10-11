const handler = {
  set: function (obj, prop, value) {
    obj[prop] = value;
    if (prop === 'alluser') {
      renderAdmin(value);
    }
  }
}

const database = new Proxy({
  alluser: []
}, handler)

async function render(privilege) {
  // admin
  if (privilege.includes(0)) {
    const alluser = await fetchAllUser();
    if (alluser) {
      database.alluser = alluser;
    }
  }

  // upload mycom
  if (privilege.includes(1)) {
    renderUploadComp();
    renderMyComp(['aaa', 'bbb', 'ccc']);
  }

  // store 不能下载
  if (privilege.includes(2) && !privilege.includes(3)) {
    renderCompStore(
      [
        {
          comp: 'xxx',
          auther: 'whj'
        }
      ], false
    );
  }

  // store 可以下载
  if (privilege.includes(2) && privilege.includes(3)) {
    renderCompStore(
      [
        {
          comp: 'xxx',
          auther: 'whj'
        }
      ], true
    );
  }
}

// 请求所有用户及角色
function fetchAllUser() {
  return new Promise((resolve) => {
    fetch('/alluser', {
      method: 'GET',
      credentials: 'include'
    }).then((raw) => {
      return raw.json();
    }).then((json) => {
      if (json.code === 0) {
        return alert(json.msg);
      }
      resolve(json.data);
    });
  })
}

// 渲染组件市场
function renderCompStore(comps, isDownload) {

  document.querySelector('.store').innerHTML = template();

  function template() {
    return (
      `
      <h3>组件市场</h3>
      <div class='comp-container'>
        ${
      comps.map(({ comp, auther }) => {
        return compTemplate(isDownload, auther, comp);
      }).join('')
      }
      </div>
      `
    )
  }

  function compTemplate(isDownload, author, comp) {
    return (
      `<div class='com'>
       <div class='info'>${comp}</div>
        <div>
          <label>作者:</label>
          <label>${author}</label>
        </div>
       ${isDownload ? "<button id='downloadBtn'>下载</button>" : ''}
      </div>`
    );
  }

}

// 渲染我的组件
function renderMyComp(comps) {
  document.querySelector('.mycom').innerHTML = template();

  function template() {
    return (
      `<h3>我的组件</h3>
       <div class='comp-container'>
         ${
      comps.map((comp) => {
        return myCompTemplate(comp);
      }).join('')
      }
       </div>`
    );
  }

  function myCompTemplate(comp) {
    return (
      `<div class='com'>
         <div class='info'>${comp}</div>
         <button>删除</button>
       </div>`
    );
  }
}

// 渲染上传组件
function renderUploadComp() {

  document.querySelector('.upload').innerHTML = template();

  function template() {
    return (
      `<h3>上传组件</h3>
      <div>输入组件信息:</div>
      <textarea id='textarea' cols='20' rows='5'></textarea>
      <div>
        公开<input type='checkbox' />
      </div>
      <button id='uploadBtn'>上传</button>`
    );
  }
}

// 渲染admin
function renderAdmin(users) {

  document.querySelector('.admin').innerHTML = adminTemplate();

  function adminTemplate() {
    return (
      `<h3>管理员</h3>
        <ul>
        ${
      users.map(({ name, role }, idx) => {
        return liTemplate(name, role, idx);
      }).join('')
      }
        </ul>
        <button id='updateRoleBtn'>确认</button>`
    );
  }

  function liTemplate(name, role, idx) {
    return (
      `<li> ${name}
         <select onChange=changeRole('${idx}') id=select_${idx} class='roleSelect'>
           <option ${role === 'visitor' && 'selected'} value='visitor'>游客</option>
           <option ${role === 'pm' && 'selected'} value='pm'>项目经理</option>
           <option ${role === 'programmer' && 'selected'} value='programmer'>程序员</option>
         </select>
      </li>`
    );
  }
}

function changeRole(id) {
  database.alluser[id].role = document.querySelector(`#select_${id}`).value;
}

function renderPersonInfo(username, role) {
  document.getElementById('username').textContent = username;
  document.getElementById('role').textContent = role;
}

// 请求基本信息
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
  renderPersonInfo(data.username, data.role.join(''));
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
