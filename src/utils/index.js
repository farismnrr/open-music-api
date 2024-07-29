const mapSongModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapAlbumModel = ({ id, name, year, created_at, updated_at }) => ({
  id,
  name,
  year,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapPlaylistModel = ({ id, name, owner, created_at, updated_at }) => ({
  id,
  name,
  owner,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapUserModel = ({
  id,
  username,
  password,
  fullname,
  created_at,
  updated_at,
}) => ({
  id,
  username,
  password,
  fullname,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapAuthModel = ({ token, created_at, updated_at }) => ({
  token,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapCollaborationModel = ({
  id,
  playlist_id,
  user_id,
  created_at,
  updated_at,
}) => ({
  id,
  playlistId: playlist_id,
  userId: user_id,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapPlaylistSongModel = ({
  id,
  playlist_id,
  song_id,
  created_at,
  updated_at,
}) => ({
  id,
  playlistId: playlist_id,
  songId: song_id,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapPlaylistSongActivityModel = ({
  id,
  playlist_id,
  song_id,
  user_id,
  action,
  time,
  created_at,
  updated_at,
}) => ({
  id,
  playlistId: playlist_id,
  songId: song_id,
  userId: user_id,
  action,
  time,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = {
  mapSongModel,
  mapAlbumModel,
  mapPlaylistModel,
  mapUserModel,
  mapCollaborationModel,
  mapAuthModel,
  mapPlaylistSongModel,
  mapPlaylistSongActivityModel,
};
