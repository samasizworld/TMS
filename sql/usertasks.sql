-- bridge table
CREATE TYPE task_status AS ENUM ('todo', 'inprogress','done');


CREATE TABLE IF NOT EXISTS "usertasks"(
    usertaskid serial,
    guid uuid default uuid_generate_v4(),
    userid integer NOT NULL,
    taskid integer NOT NULL,
    status task_status default 'todo',
    datecreated timestamp without time zone DEFAULT now(),
    datedeleted timestamp without time zone,
    datemodified timestamp without time zone,
    CONSTRAINT usertasks_usertaskid_pk PRIMARY KEY(usertaskid),
    CONSTRAINT usertasks_userid_fk FOREIGN KEY (userid)
        REFERENCES users (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT usertasks_taskid_pk FOREIGN KEY (taskid)
        REFERENCES tasks (taskid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION 
);




CREATE OR REPLACE FUNCTION usertasks_trigger()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
AS 
$$
DECLARE
BEGIN
    UPDATE usertasks SET datemodified = now() WHERE usertaskid = NEW.usertaskid;
    RETURN NEW;
END;
$$;


CREATE TRIGGER after_insert_update_usertasks
AFTER INSERT OR UPDATE ON usertasks
FOR EACH ROW 
WHEN (pg_trigger_depth()<1)
EXECUTE FUNCTION usertasks_trigger();

-- creating unique index
CREATE UNIQUE INDEX IF NOT EXISTS uqidx_user_task
ON usertasks (userid, taskid, COALESCE(datedeleted, '2019-04-24 06:31:19.771'::timestamp without time zone) ASC NULLS LAST)