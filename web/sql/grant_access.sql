GRANT ALL ON SEQUENCE public.seq_user TO trackrecord_user;
GRANT ALL ON SEQUENCE public.seq_artist TO trackrecord_user;
GRANT ALL ON SEQUENCE public.seq_venue TO trackrecord_user;
GRANT ALL ON SEQUENCE public.seq_asset TO trackrecord_user;

GRANT SELECT, INSERT, UPDATE ON TABLE public.user TO trackrecord_user;
GRANT SELECT, INSERT, UPDATE ON TABLE public.artist TO trackrecord_user;
GRANT SELECT, INSERT, UPDATE ON TABLE public.venue TO trackrecord_user;
GRANT SELECT, INSERT, UPDATE ON TABLE public.asset TO trackrecord_user;
