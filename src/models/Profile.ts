export interface Profile {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
};

export function toProfile(profileRow: ProfileRow): Profile {
  return {
    id: profileRow.id,
    email: profileRow.email,
    fullName: profileRow.full_name,
    createdAt: profileRow.created_at,
    updatedAt: profileRow.updated_at,
  };
}
