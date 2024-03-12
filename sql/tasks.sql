
-- tasks
CREATE TABLE IF NOT EXISTS "tasks"(
    taskid serial,
    guid uuid default uuid_generate_v4(),
    title varchar(100) NOT NULL,
    description text,
    datecreated timestamp without time zone DEFAULT now(),
    datedeleted timestamp without time zone,
    datemodified timestamp without time zone,
    CONSTRAINT tasks_taskid_pk PRIMARY KEY (taskid)
);


CREATE OR REPLACE FUNCTION tasks_trigger()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
AS 
$$
DECLARE
BEGIN
    UPDATE tasks SET datemodified = now() WHERE taskid = NEW.taskid;
    RETURN NEW;
END;
$$;


CREATE TRIGGER after_insert_update_tasks
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW 
WHEN (pg_trigger_depth()<1)
EXECUTE FUNCTION tasks_trigger();


DROP FUNCTION IF EXISTS get_tasklist;
CREATE OR REPLACE FUNCTION get_tasklist(
	searchtext character varying,
	pagesize integer,
	pageoffset integer,
	orderby character varying,
	orderdir character varying,
	isadmin boolean,
	loginuser character varying,
	userids character varying,
	taskstatus character varying
	)
    RETURNS TABLE(total integer,
				  taskid uuid, 
				  title character varying, 
				  description text, 
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
      
		IF (COALESCE(LOWER(orderby), '') = 'title' ) THEN
			sqlorder := FORMAT(' ORDER BY TRIM(LOWER(t.title)) %1$s', orderdir); 
		ELSIF (COALESCE(LOWER(orderby), '') = 'description') THEN
			sqlorder := FORMAT(' ORDER BY TRIM(LOWER(t.description)) %1$s', orderdir);
        ELSIF (COALESCE(LOWER(orderby), '') = 'creationdate') THEN
			sqlorder := FORMAT(' ORDER BY LOWER(t.datecreated) %1$s', orderdir);
        ELSIF (COALESCE(LOWER(orderby), '') = 'modifieddate') THEN
			sqlorder := FORMAT(' ORDER BY LOWER(t.datemodified) %1$s', orderdir);
		ELSE
			sqlorder := FORMAT(' ORDER BY TRIM(LOWER(t.title)) %1$s',orderdir);
		END IF;
		

		IF(COALESCE(searchtext, '') <> '') THEN
		    searchtext :=  '%' || searchtext || '%';
		    searchquery := FORMAT(' AND (t.title ILIKE ''%1$s'' OR t.description ILIKE ''%1$s'' ) ',searchtext);
		END IF;

        BEGIN
        sqlselect:= FORMAT('SELECT $2::integer, t.guid, t.title, t.description, t.datemodified, t.datecreated');        
		
		sqlfrom:=FORMAT(' FROM tasks t ');
		sqlwhere := sqlwhere || ' WHERE t.datedeleted IS NULL ';
		IF (isadmin = false) THEN
			IF (COALESCE(loginuser,'')<>'')THEN
				sqlfrom = sqlfrom||' 
								   JOIN usertasks ut ON ut.taskid = t.taskid AND ut.datedeleted IS NULL
								   JOIN users u ON ut.userid = u.userid AND u.datedeleted IS NULL';
				sqlwhere := sqlwhere || FORMAT(' AND u.guid = ''%1$s''::uuid ', loginuser);
			END IF;
		ELSE
			
			IF (COALESCE(userids,'')<>'')THEN
				sqlfrom = sqlfrom||' 
								   JOIN usertasks ut ON ut.taskid = t.taskid AND ut.datedeleted IS NULL
								   JOIN users u ON ut.userid = u.userid AND u.datedeleted IS NULL';
				sqlwhere := sqlwhere || FORMAT(' AND u.guid = ANY(''{%1$s}'') ', userids);
			END IF;
		END IF;

		IF (taskstatus<>'') THEN
			sqlwhere := sqlwhere || FORMAT(' AND status = ''%1$s'' ',taskstatus); 
		END IF;
		
		sqlquery:='PREPARE task_count(varchar(100)) as 
         INSERT INTO count_table("count") 
         select count(DISTINCT t.taskid) '||sqlfrom||sqlwhere||searchquery;
		
        RAISE NOTICE '%', sqlquery;

		EXECUTE sqlquery;
		sqlquery := FORMAT('EXECUTE task_count(''%1$s'')',searchtext);
		EXECUTE sqlquery;
		

         --Get rows count
		SELECT "count" INTO rowscount FROM count_table;

           sqlquery := 'PREPARE task_list(varchar(500), integer) AS '
														|| sqlselect
														|| sqlfrom
                                                        || sqlwhere
														|| searchquery
														|| sqlorder
														|| sqlpaging;

			RAISE NOTICE '%', sqlquery;
			EXECUTE sqlquery;
			   
		sqlquery := FORMAT('EXECUTE task_list(''%1$s'', %2$s)', searchtext, rowscount);
		RETURN QUERY EXECUTE sqlquery;

        EXCEPTION
            WHEN OTHERS THEN
			RAISE INFO 'Error :%',SQLERRM;
			RAISE INFO 'Error State:%', SQLSTATE;
        END;

        BEGIN
            DEALLOCATE task_count;
            DEALLOCATE task_list;
        EXCEPTION
		
		WHEN OTHERS THEN
		RAISE INFO 'Error :%',SQLERRM;
		RAISE INFO 'Error State:%', SQLSTATE;

        END;
    END;
$BODY$;

-- SELECT * FROM public.get_tasklist(
--             '',--<searchtext character varying>,
--             '20',--<pagesize integer>,
--             0,--<pageoffset integer>,
--             'title',--<orderby character varying>,
--             'asc', --<orderdir character varying>
--             true,
--             '2702f66e-10c0-4ee4-a5ef-757346b7f606',
--             '',
--             ''
--         )


-- task detail function

DROP FUNCTION IF EXISTS get_task;
CREATE OR REPLACE FUNCTION get_task(
	taskid uuid,
	isadmin boolean,
	loginuser character varying
	)
    RETURNS TABLE(taskguid uuid, 
				  title character varying, 
				  description text, 
				  datemodified timestamp without time zone,
				  datecreated timestamp without time zone,
				  assignedusers json) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
DECLARE
        sqlquery text = '';
		sqlselect text = '';
		sqlfrom text = '';
		sqlwhere text = '';
		userquery text = '';
				       
        BEGIN
		
		IF (isadmin = false) THEN
			IF (COALESCE(loginuser,'')<>'')THEN
				userquery := FORMAT(' AND u.guid = ''%1$s''::uuid ', loginuser);
			END IF;
		END IF;
		
		
        sqlselect:= FORMAT('SELECT t.guid, t.title, t.description, t.datemodified, t.datecreated, 
						   (SELECT json_agg(row_to_json(x) FROM (SELECT * FROM usertasks ut JOIN users u ON u.userid = ut.userid AND u.datedeleted IS NULL WHERE ut.datedeleted IS NULL AND ut.taskid = t.taskid %1$s ) x)',userquery);        
		
		sqlfrom:=FORMAT(' FROM tasks t ');
		sqlwhere := sqlwhere || ' WHERE t.datedeleted IS NULL ';
		
		

		
		EXCEPTION WHEN OTHERS THEN
		RAISE INFO 'Error :%',SQLERRM;
		RAISE INFO 'Error State:%', SQLSTATE;

    END;
$BODY$;