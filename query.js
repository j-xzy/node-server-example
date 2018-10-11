class Query {
  constructor(connection) {
    this.connection = connection;
    this.roleMapId = {
      programmer: 1,
      pm: 2,
      visitor: 3
    };
  }

  // 用户是否存在
  existUser(username) {
    return new Promise((resolve) => {
      this.connection.query(`SELECT COUNT(*) FROM \`node_server_example\`.user WHERE \`username\` = '${username}'`,
        function (results) {
          resolve(results[0]['COUNT(*)'] > 0);
        });
    });
  }

  // 新增用户
  addUser(username, password, role) {
    return new Promise((resolve) => {
      this.connection.query(`INSERT INTO\`node_server_example\`.\`user\`(\`username\`, \`password\`) VALUES('${username}', '${password}')`,
        () => {
          this.connection.query(`INSERT INTO\`node_server_example\`.\`user_has_role\`(\`user_id\`, \`role_id\`) VALUES(LAST_INSERT_ID(), ${this.roleMapId[role]})`,
            () => {
              resolve();
            });
        });
    });
  }

  // 验证用户密码
  validate(username, password) {
    return new Promise((resolve) => {
      this.connection.query(`SELECT COUNT(*) FROM \`node_server_example\`.user WHERE binary \`username\` = '${username}' AND binary \`password\` = '${password}'`,
        function (results) {
          resolve(results[0]['COUNT(*)'] > 0);
        });
    });
  }

  // 查询用户权限
  privilege(username) {
    return new Promise((resolve) => {
      this.connection.query(
        `SELECT distinct privilege_id FROM 
         (
           SELECT \`user\`.\`id\`,\`user\`.\`username\`,\`user_has_role\`.\`role_id\`
           FROM user,user_has_role 
           WHERE \`username\` = '${username}' AND \`user\`.\`id\` = \`user_has_role\`.\`user_id\`
         ) as A, role_has_privilege 
           WHERE A.\`role_id\` = \`role_has_privilege\`.\`role_id\`
        `,
        function (results) {
          resolve(results.map((packet) => {
            return packet.privilege_id;
          }));
        });
    });
  }

  // 查询用户角色
  role(username) {
    return new Promise((resolve) => {
      this.connection.query(
        `
        SELECT \`role\`.\`name\` FROM
          ( 
            SELECT \`user_has_role\`.\`role_id\`
            FROM user,user_has_role
            WHERE \`username\` = '${username}' AND \`user\`.\`id\` = \`user_has_role\`.\`user_id\`
          ) AS f, role
          WHERE \`f\`.\`role_id\` = \`role\`.\`id\`
        `,
        function (results) {
          resolve(results.map((packet) => {
            return packet.name;
          }));
        });
    });
  }

  // 查询所有用户及角色
  allUser() {
    return new Promise((resolve) => {
      this.connection.query(
        `
        SELECT username,name as rolename, role_id FROM
        (
          SELECT username, role_id FROM \`user\`
          LEFT JOIN \`user_has_role\` 
          ON \`user_has_role\`.\`user_id\` =  \`user\`.\`id\`
          WHERE \`user\`.\`id\` != 0 
        ) AS foo, role WHERE \`foo\`.\`role_id\` = \`role\`.\`id\`
        `,
        function (results) {
          resolve(results.map(({ username, role_id }) => {
            return {
              name: username,
              roleId: role_id
            }
          }));
        });
    });
  }

  // 更改用户权限
  updateRole(username, role) {
    return new Promise((resolve) => {
      this.connection.query(`UPDATE \`user_has_role\` SET \`role_id\`='${role}' WHERE \`user_id\`= (SELECT id FROM \`user\` WHERE username = '${username}')`,
        function (results) {
          resolve();
        });
    });
  }
}

module.exports = Query;
