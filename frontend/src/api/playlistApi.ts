import axios from 'axios';
import type { PlaylistResponse, GeneratePlaylistRequest } from '../types';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  timeout: 90_000, // Claude vision + iTunes searches can take 20-30s
});

export const generatePlaylist = async (
  req: GeneratePlaylistRequest,
): Promise<PlaylistResponse> => {
  const { data } = await client.post<PlaylistResponse>(
    '/playlist/generate',
    req,
  );
  return data;
};
