-- Migration 0004: Workspace Members and Invites (RBAC)

CREATE TABLE IF NOT EXISTS vault_members (
  id         TEXT PRIMARY KEY,
  vault_id   TEXT NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(vault_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_vault_members_user  ON vault_members(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_members_vault ON vault_members(vault_id);

CREATE TABLE IF NOT EXISTS vault_invites (
  id         TEXT PRIMARY KEY,
  vault_id   TEXT NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  inviter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL COLLATE NOCASE,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  token_hash TEXT NOT NULL UNIQUE,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_vault_invites_token ON vault_invites(token_hash);
CREATE INDEX IF NOT EXISTS idx_vault_invites_vault ON vault_invites(vault_id);

-- Backfill all existing vaults so their creators are assigned as 'owner'
INSERT OR IGNORE INTO vault_members (id, vault_id, user_id, role, created_at)
SELECT 'vm_' || id || '_' || user_id, id, user_id, 'owner', created_at FROM vaults;
