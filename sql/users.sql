CREATE TABLE IF NOT EXISTS "users"(
    userid serial,
    guid uuid default uuid_generate_v4(),
    firstname varchar(100) NOT NULL,
    middlename varchar(100),
    lastname varchar(100) NOT NULL,
    emailaddress varchar(100) NOT NULL,
	issystemadmin boolean default false,
    datecreated timestamp without time zone DEFAULT now(),
    datedeleted timestamp without time zone,
    datemodified timestamp without time zone,
    CONSTRAINT users_userid_pk PRIMARY KEY (userid)
);

-- data inserting
DO
$$
BEGIN
	IF NOT EXISTS(SELECT 1 FROM users WHERE emailaddress='admin@admin.com' and issystemadmin=true) THEN
		RAISE NOTICE 'No admin data is inserting';
		INSERT INTO users(firstname, lastname, emailaddress, issystemadmin)
		VALUES('Admin', 'Admin','admin@admin.com',true);
	ELSE
		RAISE INFO 'Yes admin data already exists';
	END IF;
END;
$$;



CREATE OR REPLACE FUNCTION users_trigger()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
AS 
$$
DECLARE
BEGIN
    UPDATE users SET datemodified = now() WHERE userid = NEW.userid;
    RETURN NEW;
END;
$$;


CREATE TRIGGER after_insert_update_users
AFTER INSERT OR UPDATE ON users
FOR EACH ROW 
WHEN (pg_trigger_depth()<1)
EXECUTE FUNCTION users_trigger();


--get_userlist


CREATE OR REPLACE FUNCTION get_userlist(
	searchtext character varying,
	pagesize integer,
	pageoffset integer,
	orderby character varying,
	orderdir character varying)
    RETURNS TABLE(total integer,
				  userid uuid, 
				  firstname character varying, 
				  lastname character varying, 
				  middlename character varying, 
				  emailaddress character varying,  
				  datemodified timestamp without time zone,
				  datecreated timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE
        sqlquery text = '';
		sqlselect text = '';
		sqlfrom text = '';
		sqlgroupby text= '';
		sqlwhere text = '';
		sqlorder text= '';
		sqlpaging text= '';
		searchquery TEXT = '';
		rowscount integer;
				
		BEGIN
        --Create temp table to hold total rows count
        DROP TABLE IF EXISTS count_table;
        CREATE TEMP TABLE count_table ("count" integer);
		
		           
        --Validate paging parameters
        IF COALESCE(pagesize, 0) <> 0 THEN
        sqlpaging := FORMAT(' OFFSET %1$s LIMIT %2$s', pageoffset, pagesize);
        END IF;

       --Prepare order parameters
	   RAISE NOTICE '%', orderdir;
        IF(COALESCE(LOWER(orderdir), '') = 'desc') THEN
        	orderdir := 'desc NULLS FIRST';
			 RAISE NOTICE 'if';
        ELSE  
        	orderdir := 'asc';
			RAISE NOTICE 'else NULLS LAST';
        END IF;
		RAISE NOTICE '%', orderdir;
      
		IF (COALESCE(LOWER(orderby), '') = 'firstname' ) THEN
			sqlorder := FORMAT(' ORDER BY TRIM(LOWER(u.firstname)) %1$s', orderdir); 
		ELSIF (COALESCE(LOWER(orderby), '') = 'lastname') THEN
			sqlorder := FORMAT(' ORDER BY TRIM(LOWER(u.lastname)) %1$s', orderdir);
		ELSIF (COALESCE(LOWER(orderby), '') = 'middlename') THEN
			sqlorder := FORMAT(' ORDER BY TRIM(LOWER(u.middlename)) %1$s', orderdir);
		ELSIF (COALESCE(LOWER(orderby), '') = 'emailaddress') THEN
			sqlorder := FORMAT(' ORDER BY TRIM(LOWER(u.emailaddress)) %1$s', orderdir);
        ELSIF (COALESCE(LOWER(orderby), '') = 'creationdate') THEN
			sqlorder := FORMAT(' ORDER BY LOWER(u.datecreated) %1$s', orderdir);
        ELSIF (COALESCE(LOWER(orderby), '') = 'modifieddate') THEN
			sqlorder := FORMAT(' ORDER BY LOWER(u.datemodified) %1$s', orderdir);
		ELSE
			sqlorder := FORMAT(' ORDER BY TRIM(LOWER(u.firstname)) %1$s',orderdir);
		END IF;
		

		IF(COALESCE(searchtext, '') <> '') THEN
		    searchtext :=  '%' || searchtext || '%';
		    searchquery := FORMAT(' AND (u.firstname ILIKE ''%1$s'' OR u.lastname ILIKE ''%1$s'' OR u.middlename ILIKE ''%1$s'' OR u.emailaddress ILIKE ''%1$s'' ) ',searchtext);
		END IF;

        BEGIN
        sqlselect:= FORMAT('SELECT $2::integer, u.guid, u.firstname, u.lastname, u.middlename, u.emailaddress, u.datemodified, u.datecreated');        
		
		sqlfrom:=FORMAT(' FROM users u ');
		sqlwhere := sqlwhere || ' WHERE u.datedeleted IS NULL ';
      
		
		sqlquery:='PREPARE user_count(varchar(100)) as 
         INSERT INTO count_table("count") 
         select count(u.userid) '||sqlfrom||sqlwhere||searchquery;
		
        RAISE NOTICE '%', sqlquery;

		EXECUTE sqlquery;
		sqlquery := FORMAT('EXECUTE user_count(''%1$s'')',searchtext);
		EXECUTE sqlquery;
		

         --Get rows count
		SELECT "count" INTO rowscount FROM count_table;

           sqlquery := 'PREPARE user_list(varchar(500), integer) AS '
														|| sqlselect
														|| sqlfrom
                                                        || sqlwhere
														|| searchquery
														|| sqlorder
														|| sqlpaging;

			RAISE NOTICE '%', sqlquery;
			EXECUTE sqlquery;
			   
		sqlquery := FORMAT('EXECUTE user_list(''%1$s'', %2$s)', searchtext, rowscount);
		RETURN QUERY EXECUTE sqlquery;

        EXCEPTION
            WHEN OTHERS THEN
			RAISE INFO 'Error :%',SQLERRM;
			RAISE INFO 'Error State:%', SQLSTATE;
        END;

        BEGIN
            DEALLOCATE user_count;
            DEALLOCATE user_list;
        EXCEPTION
		
		WHEN OTHERS THEN
		RAISE INFO 'Error :%',SQLERRM;
		RAISE INFO 'Error State:%', SQLSTATE;

        END;
    END;
$BODY$;

-- SELECT * from public.get_userlist(
-- 	'c',--<searchtext character varying>, 
-- 	'20',--<pagesize integer>, 
-- 	'1',--<pageoffset integer>, 
-- 	'asc',--<orderby character varying>, 
-- 	'creationdate'--<orderdir character varying>
-- )
