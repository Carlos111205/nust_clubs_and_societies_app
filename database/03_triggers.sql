-- QUERY 8: Auto-update member_count when someone joins or leaves
 
-- Part A: Create the function
CREATE OR REPLACE FUNCTION update_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Someone joined: add 1 to that club's member_count
    UPDATE clubs
    SET member_count = member_count + 1
    WHERE id = NEW.club_id;
 
  ELSIF TG_OP = 'DELETE' THEN
    -- Someone left: subtract 1, but never go below 0
    UPDATE clubs
    SET member_count = GREATEST(member_count - 1, 0)
    WHERE id = OLD.club_id;
  END IF;
 
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
 
-- Part B: Attach the function to the memberships table
CREATE TRIGGER trigger_update_member_count
  AFTER INSERT OR DELETE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_member_count();
