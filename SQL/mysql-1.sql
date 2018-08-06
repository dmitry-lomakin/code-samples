SELECT SUM(IF(t.status = 'Open', 1, 0))           AS open_tickets_count,
       SUM(IF(t.status = 'Customer-Reply', 1, 0)) AS customer_reply_tickets_count,
       SUM(IF(pc.userid IS NULL, 0, 1))           AS premium_customers_tickets_count,
       SUM(IF(p247c.userid IS NULL, 0, 1))        AS premium247_customers_tickets_count
FROM tbltickets t
       LEFT JOIN (SELECT h.userid
                  FROM tblhostingconfigoptions co
                         INNER JOIN tblhosting h ON co.relid = h.id
                  WHERE co.optionid IN
                        (SELECT os.id FROM tblproductconfigoptionssub os WHERE os.optionname IN ('Premium'))) pc
         ON t.userid = pc.userid
       LEFT JOIN (SELECT h.userid
                  FROM tblhostingconfigoptions co
                         INNER JOIN tblhosting h ON co.relid = h.id
                  WHERE co.optionid IN
                        (SELECT os.id FROM tblproductconfigoptionssub os WHERE os.optionname IN ('24/7 Premium'))) p247c
         ON t.userid = p247c.userid
WHERE t.status IN ('Customer-Reply', 'Open')