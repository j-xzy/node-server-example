1.查询username的权限

``` sql
SELECT distinct privilege_id FROM 
(
  SELECT `user`.`id`,`user`.`username`,`user_has_role`.`role_id`
  FROM user,user_has_role 
  WHERE `username` = 'admin' AND `user`.`id` = `user_has_role`.`user_id`
) as A, role_has_privilege 
WHERE A.`role_id` = `role_has_privilege`.`role_id`
```

2. 查询username的角色

``` sql
SELECT `role`.`name` FROM
( 
  SELECT `user_has_role`.`role_id`
  FROM user,user_has_role
  WHERE `username` = 'whj' AND `user`.`id` = `user_has_role`.`user_id`
)AS f, role
WHERE `f`.`role_id` = `role`.`id`
```

3. 查询所有角色权限(除admin)

``` sql
SELECT username,name as rolename, role_id FROM
(
  SELECT username, role_id FROM `user`
  LEFT JOIN `user_has_role` 
  ON `user_has_role`.`user_id` =  `user`.`id`
  WHERE `user`.`id` != 0 
) AS foo, role WHERE `foo`.`role_id` = `role`.`id`
```

4. 更改用户角色

``` sql
UPDATE `user_has_role` SET `role_id`='3' WHERE `user_id`= (SELECT id FROM `user` WHERE username = 'whj')
```

5. 新增组件

``` sql
INSERT INTO `comp` (`user_id`,`content`, `status`) VALUES ((SELECT id FROM user WHERE username = 'whj'),'xxxx', '1');
```

6. 查询公开组件

``` sql
SELECT username, content, comp.id FROM comp LEFT JOIN user ON comp.user_id = user.id WHERE comp.status = 1
```

7. 查询用户组件(未被删除的)
``` sql
SELECT content, id FROM comp WHERE user_id = (SELECT id FROM user WHERE username = 'whj') AND status != 0
```