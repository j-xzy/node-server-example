const handler = {
  set: function (obj, prop, value) {
    obj[prop] = value;
    if (prop === 'alluser') {
      renderAdmin(value);
    }
    if (prop === 'compStore') {
      renderCompStore(value, obj.privilege.includes(2));
    }
    if (prop === 'username') {
      renderUsername(value);
    }
    if (prop === 'myComp') {
      renderMyComp(value);
    }
    if (prop === 'role') {
      renderRole(value);
    }
  }
}

const database = new Proxy({
  alluser: [],
  compStore: [],
  privilege: [],
  myComp: [],
  username: '',
  role: ''
}, handler)

async function render() {
  const privilege = database.privilege;
  if (!privilege) {
    return alert('没有权限');
  }
  // admin
  if (privilege.includes(0)) {
    const alluser = await fetchAllUser();
    if (alluser) {
      database.alluser = alluser;
    }
  }

  // store
  if (privilege.includes(3)) {
    database.compStore = await fetchPublicComp();
  }

  // upload mycom
  if (privilege.includes(1)) {
    renderUploadComp();
    database.myComp = await fetchMyComp();
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

// 请求公开组件
function fetchPublicComp() {
  return new Promise((resolve) => {
    fetch('/publicComp', {
      method: 'GET',
      credentials: 'include'
    }).then((res) => {
      return res.json();
    }).then((json) => {
      if (json.code === 0) {
        return alert(json.msg);
      }
      resolve(json.data);
    });
  });
}

// 请求我的组件
function fetchMyComp() {
  return new Promise((resolve) => {
    fetch('/myComp', {
      method: 'GET',
      credentials: 'include'
    }).then((res) => {
      return res.json();
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
      comps.map(({ comp, auther, id }) => {
        return compTemplate(auther, comp, id);
      }).join('')
      }
      </div>
      `
    )
  }

  function compTemplate(author, comp, id) {
    return (
      `<div class='com'>
       <div class='info'>${comp}</div>
        <div>
          <label>作者:</label>
          <label>${author}</label>
        </div>
       ${isDownload ? `<button onClick=handleDownloadBtnClick(${id})>下载</button>` : ''}
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
      comps.map(({ content, id }) => {
        return myCompTemplate(content, id);
      }).join('')
      }
       </div>`
    );
  }

  function myCompTemplate(comp, id) {
    return (
      `<div class='com'>
         <div class='info'>${comp}</div>
         <button onClick=handleDeleteBtn(${id})>删除</button>
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
        公开<input type='checkbox' checked id='ispublic'/>
      </div>
      <button onClick=handleUploadClick() id='uploadBtn'>上传</button>`
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
      users.map(({ name, roleId }, idx) => {
        return liTemplate(name, roleId, idx);
      }).join('')
      }
        </ul>
        <button onClick=handleAdminBtnClick()>确认</button>`
    );
  }

  function liTemplate(name, role, idx) {
    return (
      `<li> ${name}
         <select onChange=changeRole('${idx}') id=select_${idx} class='roleSelect'>
           <option ${role === 3 && 'selected'} value='3'>游客</option>
           <option ${role === 2 && 'selected'} value='2'>项目经理</option>
           <option ${role === 1 && 'selected'} value='1'>程序员</option>
         </select>
      </li>`
    );
  }
}

// 更改database.allUser的role
function changeRole(id) {
  database.alluser[id].roleId = document.querySelector(`#select_${id}`).value;
}

// 处理删除组件按钮事件
function handleDeleteBtn(compId) {
  fetch('/deleteComp', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json'
    },
    body: compId
  }).then((res) => {
    return res.json();
  }).then((result) => {
    alert(result.msg);
    if (result.code === 1) {
      database.myComp = database.myComp.filter(({ id }) => {
        return id != compId;
      });
      database.compStore = database.compStore.filter(({ id }) => {
        return id != compId;
      });
    }
  })
}

function handleDownloadBtnClick(compId) {
  const a = document.createElement('a');
  a.href = `/download?id=${compId}`;
  a.id = 'downloada'
  a.download = 'file.text';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 处理admin的click事件，提交role更改
function handleAdminBtnClick() {
  fetch('/updateRole', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(database.alluser)
  }).then((res) => {
    return res.json();
  }).then((result) => {
    alert(result.msg);
  })
}

// 处理上传组件逻辑
function handleUploadClick() {
  const comp = document.querySelector('#textarea').value;
  const status = document.querySelector('#ispublic').checked ? 1 : 2;
  fetch('/uploadComp', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      comp,
      status
    })
  }).then((res) => {
    return res.json();
  }).then((result) => {
    if (result.code !== 1) {
      return alert(result.msg);
    }
    const id = result.data.compId;
    if (status === 1) {
      database.compStore = [...database.compStore, {
        comp,
        id,
        auther: database.username
      }]
    }
    database.myComp = [...database.myComp, { content: comp, id }];
    alert(result.msg);
  })
}

function renderUsername(username) {
  document.getElementById('username').textContent = username;
}

function renderRole(role) {
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
  database.username = data.username;
  database.role = data.role.join(',');
  database.privilege = data.privilege;
  render();
});

function getCookie(key) {
  let cookie = document.cookie.split(';');
  for (let i = 0; i < cookie.length; i++) {
    if (cookie[i].split('=')[0].trim() === key) {
      return cookie[i].split('=')[1];
    }
  }
}
