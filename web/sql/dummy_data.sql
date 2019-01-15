---Insert role
INSERT INTO public.role(
	"roleID", "roleName")
	VALUES (nextval('seq_role'), 'hello');

---Insert city
INSERT INTO public.city(
	"cityID", "cityName")
	VALUES (nextval('seq_city'), 'Irvine');

---Insert state
INSERT INTO public.state(
	"stateID", "stateName", "stateAbbr")
	VALUES (nextval('seq_state'), 'California', 'CA');

---Insert country
INSERT INTO public.country(
	"countryID", "counrtyName")
	VALUES (nextval('seq_country'), 'temp_country');

---Insert address
INSERT INTO public.address(
	"addressID", "addressLine1", "addressLine2", "cityID", "stateID", "countryID", "zipCode")
	VALUES (nextval('seq_address'), 'Scolarship', '2117', 1, 1, 1, '92613');

---Insert tag
INSERT INTO public.tag(
	"tagID", "parentTagID", tag)
	VALUES (nextval('seq_tag'), 1, 'temp_text');

---Insert Profile
INSERT INTO public.profile(
	"profileID", "tagIDs", website, name, "contactEmail", "phoneNumber", assets, "createTime", "updateTime", "createByUserID", "statusCode", twitter, instagram)
	VALUES (nextval('seq_profile'), '{0,1}', 'http://www.google.com', 'temp_name', 'temp@gmail.com', '213-123-4567', '{0,1,2}', '2018-1-7'::timestamp, '2018-1-7'::timestamp, 1, 'BLOCK', 'temp_twitter', 'temp_instagram');

---Insert Venue (Inherit table's values are now all 'NULL')
INSERT INTO public.venue(
"equipment", "customerAge", "capacity", "payrate", "remarks", "addressID")
VALUES('guitar', 'over nineteen', '50', '(100,200)'::int4range, 'temp_ramarks', 1);

---Insert artist (Inherit value now all 'NULL')
INSERT INTO public.artist(
"payrate", "noticeTerm", "dayAndNightTerm")
VALUES('(100,200)'::int4range,'10','7');

---Insert User (Inherit table's value are now all 'NULL')
INSERT INTO public."user"(
	"userID", "passwordSalt", "passwordHash", "roleID", "loginTime", "createTime", email, username, "emailVerifiedTime", password_hash_algorithm, "profileID", email_confirmation_token)
	VALUES (nextval('seq_user'), 'temp_pw', 'fixedLength', 1, '2018-1-7'::timestamp, '2018-1-7'::timestamp, 'temp@gmail.com', 'temp_name', '2018-1-7'::timestamp, 'HASH', 1, 'temp_token');

---Insert asset
INSERT INTO public.asset(
	"assetID", width, height, "fileSize", "createTime", url, "mediaType", "createByUserID")
	VALUES (nextval('seq_asset'), 256, 256, 1024, '2018-1-7'::timestamp, 'C:\Users\hoon', 'image/png', 0);