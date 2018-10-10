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