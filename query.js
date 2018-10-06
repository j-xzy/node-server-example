class Query {
  constructor(connection) {
    this.connection = connection;
  }

  // 用户是否存在
  existUser(username) {
    return new Promise((resolve) => {
      this.connection.query(`SELECT COUNT(*) FROM \`node-server-example\`.user WHERE \`username\` = '${username}'`,
        function (results) {
          resolve(results[0]['COUNT(*)'] > 0);
        });
    });
  }

  // 新增用户
  addUser(username, password) {
    return new Promise((resolve) => {
      this.connection.query(`INSERT INTO\`node-server-example\`.\`user\`(\`username\`, \`password\`) VALUES('${username}', '${password}')`,
        function () {
          resolve();
        });
    });
  }

  // 验证用户密码
  validate(username, password) {
    return new Promise((resolve) => {
      this.connection.query(`SELECT COUNT(*) FROM \`node-server-example\`.user WHERE \`username\` = '${username}' AND \`password\` = '${password}'`,
        function (results) {
          resolve(results[0]['COUNT(*)'] > 0);
        });
    });
  }
}

module.exports = Query;
