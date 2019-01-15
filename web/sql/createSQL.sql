--Create Venue
CREATE SEQUENCE IF NOT EXISTS seq_venue START 1;
CREATE TABLE IF NOT EXISTS public.venue
(


    "venueID" integer NOT NULL DEFAULT nextval('seq_venue'),
    "venueTypes" text[], 
    "actTypes" text[],
    "genrePreferences" text[],
    "paymentTypes" text[],
    website character varying(50),
    name character varying(50),
    "contactEmail" text,
    "phoneNumber" character varying(20),
    assets integer[],
    "createTime" timestamp with time zone,
    "updateTime" timestamp with time zone,
    "createByUserID" integer,
    "statusCode" integer,
    twitter character varying(30),
    instagram character varying(30),
    equipment boolean,
    "customerAge" character varying(20),
    "stageElevated" boolean, 
    capacity integer,
    payrate int4range,
    "description" text,
    "addressLine1" character varying(40),
    "addressLine2" character varying(40),
    "city" character varying(60),
    "region" character varying(60),
    "zipCode" character(5),
    PRIMARY KEY ("venueID")
);

GRANT SELECT, INSERT, UPDATE ON TABLE public.venue TO
  trackrecord_user
;

	
--Create artist
CREATE SEQUENCE IF NOT EXISTS seq_artist START 1;
CREATE TABLE IF NOT EXISTS public.artist
(
    "artistID" integer NOT NULL DEFAULT nextval('seq_artist'),
    genres text[],
    website character varying(50),
    name character varying(50),
    "paymentTypes" text[],
    "contactEmail" character varying(50),
    "phoneNumber" character varying(20),
    assets integer[],
    "createTime" timestamp with time zone,
    "updateTime" timestamp with time zone,
    "createByUserID" integer,
    "statusCode" integer,
    twitter character varying(50),
    instagram character varying(50),
    youtube character varying(50),
    soundcloud character varying(50),
    minpayrate int,
    "noticeTerm" boolean,
    "zipCode" character(5),
    "canTravel" boolean,
    "openMic" boolean,
    "over18" boolean,
    equipment boolean,
    "actTypes" text[],
    "description" text,
    PRIMARY KEY ("artistID")
);

-- Create User
CREATE SEQUENCE IF NOT EXISTS seq_user START 1;
CREATE TABLE IF NOT EXISTS public."user"
(
    "userID" integer NOT NULL DEFAULT nextval('seq_user'),
    "passwordHash" character varying(100),
    "roleID" integer NOT NULL,
    "loginTime" timestamp with time zone,
    "createTime" timestamp with time zone,
    email text  NOT NULL,
    username character varying(30) NOT NULL,
    "emailVerifiedTime" timestamp with time zone,
    password_hash_algorithm character varying(10),
    "artistID" integer references public.artist("artistID"),
    "venueID" integer references public.venue("venueID"),
    email_confirmation_token text,
	PRIMARY KEY ("userID"),
	CONSTRAINT "UK_user_email" UNIQUE ("email"),
	CONSTRAINT "UK_user_username" UNIQUE ("username"),
    CONSTRAINT users_email_valid CHECK ( email ~* '^.+@.+\..+$' )
);

CREATE INDEX ON public."user" ((lower("username")));
	
--Create asset
CREATE SEQUENCE IF NOT EXISTS seq_asset START 1;
CREATE TABLE IF NOT EXISTS public.asset
(
    "assetID" integer NOT NULL DEFAULT nextval('seq_asset'),
    "fileName" character varying(20),
    width integer,
    height integer,
    "fileSize" integer,
    "createTime" timestamp  with time zone,
    url text not null,
    "mediaType" character varying(20),
    "statusCode" integer,
    "createByUserID" integer references public."user"("userID"),
    PRIMARY KEY ("assetID")
);

--Create role
CREATE SEQUENCE IF NOT EXISTS seq_role START 1;
CREATE TABLE IF NOT EXISTS public.role
(
    "roleID" integer NOT NULL DEFAULT nextval('seq_role'),
    "roleName" character varying(20),
    PRIMARY KEY ("roleID")
);
