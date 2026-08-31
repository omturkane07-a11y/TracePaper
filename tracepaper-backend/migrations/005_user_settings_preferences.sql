ALTER TABLE users
  ADD COLUMN IF NOT EXISTS theme VARCHAR(50) NOT NULL DEFAULT 'System Default',
  ADD COLUMN IF NOT EXISTS security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS investigation_alerts BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE users
SET
  theme = COALESCE(theme, 'System Default'),
  security_alerts = COALESCE(security_alerts, TRUE),
  email_notifications = COALESCE(email_notifications, TRUE),
  investigation_alerts = COALESCE(investigation_alerts, TRUE)
WHERE theme IS NULL
   OR security_alerts IS NULL
   OR email_notifications IS NULL
   OR investigation_alerts IS NULL;
