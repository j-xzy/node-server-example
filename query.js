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
      this.connection.query(`SELECT COUNT(*) FROM \`node_server_example\`.user WHERE \`username\` = '${username}' AND \`password\` = '${password}'`,
        function (results) {
          resolve(results[0]['COUNT(*)'] > 0);
        });
    });
  }
}

module.exports = Query;
